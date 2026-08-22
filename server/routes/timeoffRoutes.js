import express from 'express';
import { getDb } from '../db.js';

const router = express.Router();

// 1. Get Time Off Requests
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query;
    const db = await getDb();

    let query = `
      SELECT t.*, u.name as employee_name, u.email as employee_email, u.emp_code, u.department
      FROM time_off_requests t
      JOIN users u ON t.employee_id = u.id
    `;
    const params = [];

    if (employeeId) {
      query += ` WHERE t.employee_id = ?`;
      params.push(employeeId);
    }

    query += ` ORDER BY t.id DESC`;

    const requests = await db.all(query, params);
    return res.json(requests);
  } catch (err) {
    console.error('Fetch time-off error:', err);
    return res.status(500).json({ error: 'Error fetching time off requests.' });
  }
});

// 2. Submit Time Off Request
router.post('/', async (req, res) => {
  try {
    const { employeeId, timeOffType, startDate, endDate, allocationDays, attachmentUrl } = req.body;
    if (!employeeId || !timeOffType || !startDate || !endDate) {
      return res.status(400).json({ error: 'Employee ID, Time Off Type, Start Date and End Date are required.' });
    }

    const db = await getDb();
    const validityPeriod = `${startDate} to ${endDate}`;

    const result = await db.run(`
      INSERT INTO time_off_requests (
        employee_id, time_off_type, start_date, end_date, validity_period, allocation_days, attachment_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    `, [employeeId, timeOffType, startDate, endDate, validityPeriod, allocationDays || 1.0, attachmentUrl || null]);

    const created = await db.get('SELECT * FROM time_off_requests WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, request: created, message: 'Time off request submitted successfully.' });
  } catch (err) {
    console.error('Submit time-off error:', err);
    return res.status(500).json({ error: 'Error submitting time off request.' });
  }
});

// 3. Update Status (Approve / Reject)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Validated' or 'Refused'

    if (!['Validated', 'Refused', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const db = await getDb();
    const mappedStatus = (status === 'Approved' || status === 'Validated') ? 'Validated' : 'Refused';

    await db.run('UPDATE time_off_requests SET status = ? WHERE id = ?', [mappedStatus, id]);

    const reqRecord = await db.get('SELECT * FROM time_off_requests WHERE id = ?', [id]);
    if (reqRecord && mappedStatus === 'Validated') {
      // Update employee status if on leave today
      const today = new Date().toISOString().split('T')[0];
      if (reqRecord.start_date <= today && reqRecord.end_date >= today) {
        await db.run('UPDATE users SET status = ? WHERE id = ?', ['On Leave', reqRecord.employee_id]);
      }
    }

    return res.json({ success: true, status: mappedStatus, message: `Time off request marked as ${mappedStatus}` });
  } catch (err) {
    console.error('Update time-off status error:', err);
    return res.status(500).json({ error: 'Error updating request status.' });
  }
});

export default router;
