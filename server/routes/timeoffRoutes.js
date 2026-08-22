import express from 'express';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// 1. Get Time Off Requests (Scoped to company; employees see only their own)
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query;
    const db = await getDb();

    let query = `
      SELECT t.*, u.name as employee_name, u.email as employee_email, u.emp_code, u.department
      FROM time_off_requests t
      JOIN users u ON t.employee_id = u.id
      WHERE u.company_id = ?
    `;
    const params = [req.user.companyId];

    if (req.user.role === 'Employee') {
      query += ` AND t.employee_id = ?`;
      params.push(req.user.userId);
    } else if (employeeId) {
      query += ` AND t.employee_id = ?`;
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

// 2. Submit Time Off Request (Employee submits for self; Admin/HR may submit for anyone in company)
router.post('/', async (req, res) => {
  try {
    const { employeeId, timeOffType, startDate, endDate, allocationDays, attachmentUrl } = req.body;
    const db = await getDb();

    let targetId = employeeId;
    if (req.user.role === 'Employee') {
      targetId = req.user.userId;
    }

    if (!targetId || !timeOffType || !startDate || !endDate) {
      return res.status(400).json({ error: 'Employee ID, Time Off Type, Start Date and End Date are required.' });
    }

    const emp = await db.get(
      'SELECT id FROM users WHERE id = ? AND company_id = ?',
      [targetId, req.user.companyId]
    );
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found in your company.' });
    }

    const validityPeriod = `${startDate} to ${endDate}`;

    const result = await db.run(`
      INSERT INTO time_off_requests (
        employee_id, time_off_type, start_date, end_date, validity_period, allocation_days, attachment_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    `, [targetId, timeOffType, startDate, endDate, validityPeriod, allocationDays || 1.0, attachmentUrl || null]);

    const created = await db.get('SELECT * FROM time_off_requests WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, request: created, message: 'Time off request submitted successfully.' });
  } catch (err) {
    console.error('Submit time-off error:', err);
    return res.status(500).json({ error: 'Error submitting time off request.' });
  }
});

// 3. Update Status (Approve / Reject) — Admin/HR only, must belong to same company
router.put('/:id/status', async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'HR Officer') {
      return res.status(403).json({ error: 'Only Admin or HR Officer can update request status.' });
    }

    const { id } = req.params;
    const { status } = req.body; // 'Validated' or 'Refused'

    if (!['Validated', 'Refused', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const db = await getDb();
    const reqRecord = await db.get(`
      SELECT t.* FROM time_off_requests t
      JOIN users u ON t.employee_id = u.id
      WHERE t.id = ? AND u.company_id = ?
    `, [id, req.user.companyId]);

    if (!reqRecord) {
      return res.status(404).json({ error: 'Time off request not found.' });
    }

    const mappedStatus = (status === 'Approved' || status === 'Validated') ? 'Validated' : 'Refused';

    await db.run('UPDATE time_off_requests SET status = ? WHERE id = ?', [mappedStatus, id]);

    if (mappedStatus === 'Validated') {
      const today = new Date().toISOString().split('T')[0];
      if (reqRecord.start_date <= today && reqRecord.end_date >= today) {
        await db.run('UPDATE users SET status = ? WHERE id = ? AND company_id = ?', ['On Leave', reqRecord.employee_id, req.user.companyId]);
      }
    }

    return res.json({ success: true, status: mappedStatus, message: `Time off request marked as ${mappedStatus}` });
  } catch (err) {
    console.error('Update time-off status error:', err);
    return res.status(500).json({ error: 'Error updating request status.' });
  }
});

export default router;
