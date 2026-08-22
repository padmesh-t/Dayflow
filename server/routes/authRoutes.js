import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';
import { generateLoginId } from '../utils/idGenerator.js';
import { generateOTP, sendOtpEmail } from '../utils/mailer.js';
import { signToken } from '../utils/token.js';

const router = express.Router();

function buildToken(user) {
  return signToken({
    userId: user.id,
    companyId: user.company_id,
    role: user.role,
    loginId: user.login_id,
    email: user.email,
    name: user.name
  });
}

// 1. Sign In (Check Credentials -> Trigger 2FA OTP)
router.post('/sign-in', async (req, res) => {
  try {
    const { loginOrEmail, password } = req.body;
    if (!loginOrEmail || !password) {
      return res.status(400).json({ error: 'Please enter Login ID/Email and password.' });
    }

    const db = await getDb();
    const user = await db.get(
      'SELECT * FROM users WHERE login_id = ? OR email = ?',
      [loginOrEmail.trim(), loginOrEmail.trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid Login ID/Email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Login ID/Email or password.' });
    }

    // Generate 6-digit OTP code
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.run(
      'INSERT INTO otp_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)',
      [user.email, otpCode, expiresAt]
    );

    // Send Simulated Email
    await sendOtpEmail(user.email, otpCode);

    return res.json({
      requiresOtp: true,
      email: user.email,
      otpCode, // Included for easy testing demo display
      message: `2FA OTP Sent to ${user.email}. Please verify to complete login.`
    });
  } catch (err) {
    console.error('Sign-in error:', err);
    return res.status(500).json({ error: 'Internal server error during sign-in.' });
  }
});

// 2. Verify 2FA OTP Code
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const db = await getDb();
    const record = await db.get(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp_code = ? ORDER BY id DESC LIMIT 1',
      [email.trim(), otpCode.trim()]
    );

    if (!record) {
      return res.status(400).json({ error: 'Invalid OTP code. Please check and try again.' });
    }

    // Check expiration
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new code.' });
    }

    // Delete used OTP
    await db.run('DELETE FROM otp_verifications WHERE email = ?', [email.trim()]);

    // Fetch full user record
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.trim()]);
    if (!user) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    delete user.password_hash;
    const token = buildToken(user);
    return res.json({
      success: true,
      user,
      token,
      message: 'Email OTP verified successfully. Welcome to Dayflow!'
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    return res.status(500).json({ error: 'Internal server error during OTP verification.' });
  }
});

// 3. Sign Up (Company & Admin Registration)
router.post('/sign-up', async (req, res) => {
  try {
    const { companyName, name, email, phone, password, logoUrl } = req.body;
    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ error: 'Company Name, Admin Name, Email and Password are required.' });
    }

    const db = await getDb();

    // Check existing email
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered. Please sign in.' });
    }

    // Insert Company
    const compRes = await db.run(
      'INSERT INTO companies (name, logo_url) VALUES (?, ?)',
      [companyName.trim(), logoUrl || '/logo.svg']
    );
    const companyId = compRes.lastID;

    // Generate Admin Login ID
    const countObj = await db.get('SELECT COUNT(*) as count FROM users WHERE company_id = ?', [companyId]);
    const serialNum = (countObj?.count || 0) + 1;
    const loginId = generateLoginId('OI', name, new Date().getFullYear(), serialNum);

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert Admin User
    const userRes = await db.run(`
      INSERT INTO users (
        company_id, login_id, name, email, phone, password_hash, role,
        department, job_position, emp_code, date_of_joining, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      companyId, loginId, name.trim(), email.trim(), phone || '',
      passwordHash, 'Admin', 'Executive', 'Company Founder & Admin',
      `EMP-${1000 + serialNum}`, new Date().toISOString().split('T')[0], 'Present'
    ]);

    const newUser = await db.get('SELECT * FROM users WHERE id = ?', [userRes.lastID]);
    delete newUser.password_hash;
    const token = buildToken(newUser);

    return res.status(201).json({
      success: true,
      user: newUser,
      loginId,
      token,
      message: `Account registered successfully! Your Auto Login ID is ${loginId}.`
    });
  } catch (err) {
    console.error('Sign-up error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 4. Change Password
router.post('/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required.' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (oldPassword && !user.is_temp_password) {
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.run(
      'UPDATE users SET password_hash = ?, is_temp_password = 0 WHERE id = ?',
      [newHash, userId]
    );

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Error updating password.' });
  }
});

export default router;
