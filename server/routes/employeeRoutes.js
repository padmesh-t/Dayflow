import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';
import { generateLoginId, generateTempPassword } from '../utils/idGenerator.js';
import { sendWelcomeCredentialsEmail } from '../utils/mailer.js';

const router = express.Router();

// 1. Get All Employees (For Landing Page Grid / Table)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const employees = await db.all(`
      SELECT 
        id, company_id, login_id, name, email, phone, role, avatar_url,
        department, job_position, manager, location, date_of_joining, status,
        emp_code, monthly_wage, yearly_wage, basic_percent, hra_percent, pf_percent, professional_tax,
        dob, residing_address, nationality, personal_email, gender, marital_status,
        bank_account_no, bank_name, ifsc_code, pan_no, uan_no,
        about, love_about_job, hobbies, skills, certifications,
        paid_leave_balance, sick_leave_balance, is_temp_password
      FROM users 
      ORDER BY id ASC
    `);
    return res.json(employees);
  } catch (err) {
    console.error('Fetch employees error:', err);
    return res.status(500).json({ error: 'Error fetching employee directory.' });
  }
});

// 2. Get Single Employee Details
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const employee = await db.get('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    delete employee.password_hash;
    return res.json(employee);
  } catch (err) {
    console.error('Fetch single employee error:', err);
    return res.status(500).json({ error: 'Error fetching employee details.' });
  }
});

// 3. Create New Employee (Admin / HR Officer Only)
router.post('/', async (req, res) => {
  try {
    const { 
      name, email, phone, role, department, jobPosition, 
      monthlyWage, manager, location, dateOfJoining 
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Employee Name and Email are required.' });
    }

    const db = await getDb();

    // Check email uniqueness
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'Employee email already exists.' });
    }

    // Auto-generate Login ID (Format: OIJODO20250001)
    const year = dateOfJoining ? new Date(dateOfJoining).getFullYear() : new Date().getFullYear();
    const countObj = await db.get('SELECT COUNT(*) as count FROM users');
    const serialNum = (countObj?.count || 0) + 1;
    const loginId = generateLoginId('OI', name, year, serialNum);

    // Auto-generate Temporary Password
    const tempPassword = generateTempPassword(8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const wageNum = Number(monthlyWage) || 50000;
    const yearlyNum = wageNum * 12;

    const result = await db.run(`
      INSERT INTO users (
        company_id, login_id, name, email, phone, password_hash, is_temp_password,
        role, department, job_position, manager, location, date_of_joining,
        emp_code, monthly_wage, yearly_wage, status, avatar_url
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      1, loginId, name.trim(), email.trim(), phone || '', passwordHash,
      role || 'Employee', department || 'Engineering', jobPosition || 'Software Engineer',
      manager || 'Padmesh T', location || 'Chennai, India', dateOfJoining || new Date().toISOString().split('T')[0],
      `EMP-${1000 + serialNum}`, wageNum, yearlyNum, 'Present', '/avatars/default.png'
    ]);

    // Send Simulated Welcome Credentials Email
    await sendWelcomeCredentialsEmail(email.trim(), name.trim(), loginId, tempPassword);

    const newEmp = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    delete newEmp.password_hash;

    return res.status(201).json({
      success: true,
      employee: newEmp,
      loginId,
      tempPassword,
      message: `Employee created! Auto Login ID: ${loginId}, Temp Password: ${tempPassword}. Credentials sent to email.`
    });
  } catch (err) {
    console.error('Create employee error:', err);
    return res.status(500).json({ error: 'Internal error creating employee.' });
  }
});

// 4. Update Employee Details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const allowedFields = [
      'name', 'phone', 'role', 'department', 'job_position', 'manager', 'location',
      'status', 'dob', 'residing_address', 'nationality', 'personal_email', 'gender',
      'marital_status', 'bank_account_no', 'bank_name', 'ifsc_code', 'pan_no', 'uan_no',
      'monthly_wage', 'yearly_wage', 'working_days_per_week', 'break_hours',
      'basic_percent', 'hra_percent', 'pf_percent', 'professional_tax',
      'about', 'love_about_job', 'hobbies', 'skills', 'certifications', 'avatar_url'
    ];

    const updates = [];
    const values = [];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    values.push(id);
    await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    delete updatedUser.password_hash;

    return res.json({ success: true, employee: updatedUser, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Update employee error:', err);
    return res.status(500).json({ error: 'Error updating employee record.' });
  }
});

export default router;
