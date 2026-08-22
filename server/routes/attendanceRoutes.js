import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// 1. Get Attendance Logs
router.get('/logs', async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    const db = await getDb();

    let query = `
      SELECT a.*, u.name as employee_name, u.email as employee_email, u.emp_code, u.department 
      FROM attendance a
      JOIN users u ON a.employee_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (employeeId) {
      conditions.push('a.employee_id = ?');
      params.push(employeeId);
    }
    if (date) {
      conditions.push('a.date = ?');
      params.push(date);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY a.date DESC, a.id DESC`;

    const records = await db.all(query, params);
    return res.json(records);
  } catch (err) {
    console.error('Fetch attendance error:', err);
    return res.status(500).json({ error: 'Error fetching attendance records.' });
  }
});

// 2. Check In
router.post('/check-in', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required.' });
    }

    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Check if already checked in today
    const existing = await db.get(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (existing) {
      return res.status(400).json({ error: 'Already checked in for today.' });
    }

    await db.run(`
      INSERT INTO attendance (employee_id, date, check_in, work_hours, extra_hours, status)
      VALUES (?, ?, ?, '00:00', '00:00', 'Present')
    `, [employeeId, today, nowTime]);

    // Update user status to Present
    await db.run('UPDATE users SET status = ? WHERE id = ?', ['Present', employeeId]);

    return res.json({ success: true, checkInTime: nowTime, message: `Successfully Checked In at ${nowTime}` });
  } catch (err) {
    console.error('Check-in error:', err);
    return res.status(500).json({ error: 'Error processing check-in.' });
  }
});

// 3. Check Out
router.post('/check-out', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required.' });
    }

    const db = await getDb();
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const existing = await db.get(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (!existing) {
      return res.status(400).json({ error: 'No check-in record found for today.' });
    }

    // Compute simple work hours
    const checkInHour = parseInt(existing.check_in.split(':')[0], 10);
    const checkOutHour = parseInt(nowTime.split(':')[0], 10);
    const hoursWorked = Math.max(0, checkOutHour - checkInHour);
    const workHoursStr = `${String(hoursWorked).padStart(2, '0')}:00`;
    const extraHoursStr = hoursWorked > 8 ? `${String(hoursWorked - 8).padStart(2, '0')}:00` : '00:00';

    await db.run(`
      UPDATE attendance 
      SET check_out = ?, work_hours = ?, extra_hours = ?
      WHERE id = ?
    `, [nowTime, workHoursStr, extraHoursStr, existing.id]);

    return res.json({ success: true, checkOutTime: nowTime, workHours: workHoursStr, message: `Successfully Checked Out at ${nowTime}` });
  } catch (err) {
    console.error('Check-out error:', err);
    return res.status(500).json({ error: 'Error processing check-out.' });
  }
});

export default router;
