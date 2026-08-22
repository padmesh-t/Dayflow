import express from 'express';
import { getDb } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/payslip/:empId', async (req, res) => {
  try {
    const { empId } = req.params;
    const { monthDays = 30 } = req.query;

    const db = await getDb();
    const emp = await db.get('SELECT * FROM users WHERE id = ? AND company_id = ?', [empId, req.user.companyId]);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const wage = Number(emp.monthly_wage) || 250000;
    const basicPercent = Number(emp.basic_percent) || 50.0;
    const hraPercent = Number(emp.hra_percent) || 50.0;
    const pfPercent = Number(emp.pf_percent) || 12.0;
    const profTax = Number(emp.professional_tax) || 200.0;

    // Calculation Formulas per HRMS_Wireframe_Spec.md:
    // Basic = Wage * (basicPercent / 100)
    // HRA = Basic * (hraPercent / 100)
    // Standard Allowance = 16.67% of wage
    // Performance Bonus = 8.33% of basic
    // LTA = 8.33% of basic
    // Fixed Allowance = Wage - (Basic + HRA + Standard + Bonus + LTA)
    const basic = Math.round((wage * basicPercent) / 100);
    const hra = Math.round((basic * hraPercent) / 100);
    const stdAllowance = Math.round(wage * 0.1667);
    const bonus = Math.round(basic * 0.0833);
    const lta = Math.round(basic * 0.0833);
    const fixedAllowance = Math.max(0, wage - (basic + hra + stdAllowance + bonus + lta));

    // Deductions:
    const pfEmployee = Math.round((basic * pfPercent) / 100);
    const pfEmployer = Math.round((basic * pfPercent) / 100);
    const totalDeductions = pfEmployee + profTax;

    // Attendance & Payable Days Reduction:
    const attList = await db.all('SELECT * FROM attendance WHERE employee_id = ?', [empId]);
    const presentDays = attList.length > 0 ? attList.length : 22;

    const unpaidLeavesList = await db.all(`
      SELECT * FROM time_off_requests 
      WHERE employee_id = ? AND time_off_type = 'Unpaid Leaves' AND status = 'Validated'
    `, [empId]);
    const unpaidLeavesCount = unpaidLeavesList.reduce((acc, curr) => acc + (curr.allocation_days || 1), 0);

    const payableDays = Math.max(0, Number(monthDays) - unpaidLeavesCount);
    const grossEarnings = basic + hra + stdAllowance + bonus + lta + fixedAllowance;
    const netSalary = Math.round((grossEarnings - totalDeductions) * (payableDays / Number(monthDays)));

    return res.json({
      employee: {
        id: emp.id,
        name: emp.name,
        empCode: emp.emp_code,
        loginId: emp.login_id,
        department: emp.department,
        jobPosition: emp.job_position,
        bankAccountNo: emp.bank_account_no,
        bankName: emp.bank_name,
        ifscCode: emp.ifsc_code,
        panNo: emp.pan_no,
        uanNo: emp.uan_no
      },
      wage,
      yearlyWage: emp.yearly_wage || wage * 12,
      components: {
        basic,
        hra,
        stdAllowance,
        bonus,
        lta,
        fixedAllowance
      },
      deductions: {
        pfEmployee,
        pfEmployer,
        profTax,
        totalDeductions
      },
      attendanceSummary: {
        totalDaysInMonth: Number(monthDays),
        presentDays,
        unpaidLeavesCount,
        payableDays
      },
      grossEarnings,
      netSalary
    });
  } catch (err) {
    console.error('Payslip error:', err);
    return res.status(500).json({ error: 'Error generating payslip.' });
  }
});

export default router;
