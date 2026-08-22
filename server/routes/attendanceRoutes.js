import express from 'express';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// 1. Get Attendance Logs (Scoped to the company; employees see only their own)
router.get('/logs', async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    const db = await getDb();

    // Employees may only view their own records
    let scopedEmployeeId = employeeId;
    if (req.user.role === 'Employee') {
      scopedEmployeeId = req.user.userId;
    }

    let query = `
      SELECT a.*, u.name as employee_name, u.email as employee_email, u.emp_code, u.department 
      FROM attendance a
      JOIN users u ON a.employee_id = u.id
      WHERE u.company_id = ?
    `;
    const params = [req.user.companyId];
    const conditions = [];

    if (scopedEmployeeId) {
      conditions.push('a.employee_id = ?');
      params.push(scopedEmployeeId);
    }
    if (date) {
      conditions.push('a.date = ?');
      params.push(date);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY a.date DESC, a.id DESC`;

    const records = await db.all(query, params);
    return res.json(records);
  } catch (err) {
    console.error('Fetch attendance error:', err);
    return res.status(500).json({ error: 'Error fetching attendance records.' });
  }
});

// Resolve the target employee id, enforcing company isolation.
// Employees can only act on their own record; Admin/HR may target any employee in their company.
function resolveTargetEmployeeId(req, db) {
  return new Promise(async (resolve, reject) => {
    try {
      let targetId = req.body.employeeId;
      if (req.user.role === 'Employee') {
        targetId = req.user.userId;
      }

      if (!targetId) {
        return reject({ status: 400, error: 'Employee ID is required.' });
      }

      const emp = await db.get(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [targetId, req.user.companyId]
      );
      if (!emp) {
        return reject({ status: 404, error: 'Employee not found in your company.' });
      }

      resolve(targetId);
    } catch (err) {
      reject({ status: 500, error: 'Error resolving employee.' });
    }
  });
}

// 2. Check In
router.post('/check-in', async (req, res) => {
  try {
    const db = await getDb();
    const employeeId = await resolveTargetEmployeeId(req, db);

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

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

    await db.run('UPDATE users SET status = ? WHERE id = ? AND company_id = ?', ['Present', employeeId, req.user.companyId]);

    return res.json({ success: true, checkInTime: nowTime, message: `Successfully Checked In at ${nowTime}` });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.error });
    console.error('Check-in error:', err);
    return res.status(500).json({ error: 'Error processing check-in.' });
  }
});

// 3. Check Out
router.post('/check-out', async (req, res) => {
  try {
    const db = await getDb();
    const employeeId = await resolveTargetEmployeeId(req, db);

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const existing = await db.get(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (!existing) {
      return res.status(400).json({ error: 'No check-in record found for today.' });
    }

    const checkInHour = parseInt(existing.check_in.split(':')[0], 10);
    const checkOutHour = parseInt(nowTime.split(':')[0], 10);
    const hoursWorked = Math.max(0, checkOutHour - checkInHour);
    const workHoursStr = `${String(hoursWorked).padStart(2, '0')}:00`;
    const extraHoursStr = hoursWorked > 8 ? `${String(hoursWorked - 8).padStart(2, '0')}:00` : '00:00';

    await db.run(`
      UPDATE attendance 
      SET check_out = ?, work_hours = ?, extra_hours = ?
      WHERE id = ? AND employee_id = ?
    `, [nowTime, workHoursStr, extraHoursStr, existing.id, employeeId]);

    return res.json({ success: true, checkOutTime: nowTime, workHours: workHoursStr, message: `Successfully Checked Out at ${nowTime}` });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.error });
    console.error('Check-out error:', err);
    return res.status(500).json({ error: 'Error processing check-out.' });
  }
});

export default router;
