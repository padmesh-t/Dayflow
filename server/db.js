import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'dayflow.db');

let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await initDb(dbInstance);
  return dbInstance;
}

async function initDb(db) {
  // Foreign keys enabled
  await db.run('PRAGMA foreign_keys = ON;');

  // 1. Companies Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Users / Employees Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      login_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      is_temp_password BOOLEAN DEFAULT 0,
      role TEXT NOT NULL DEFAULT 'Employee',
      avatar_url TEXT DEFAULT '/avatars/default.png',
      department TEXT DEFAULT 'Engineering',
      job_position TEXT DEFAULT 'Software Engineer',
      manager TEXT DEFAULT 'Padmesh T',
      location TEXT DEFAULT 'Chennai, India',
      date_of_joining TEXT,
      status TEXT DEFAULT 'Present',
      
      dob TEXT,
      residing_address TEXT,
      nationality TEXT DEFAULT 'Indian',
      personal_email TEXT,
      gender TEXT DEFAULT 'Male',
      marital_status TEXT DEFAULT 'Single',
      
      bank_account_no TEXT,
      bank_name TEXT,
      ifsc_code TEXT,
      pan_no TEXT,
      uan_no TEXT,
      emp_code TEXT,
      
      monthly_wage REAL DEFAULT 250000,
      yearly_wage REAL DEFAULT 3000000,
      working_days_per_week INTEGER DEFAULT 5,
      break_hours REAL DEFAULT 1.0,
      basic_percent REAL DEFAULT 50.0,
      hra_percent REAL DEFAULT 50.0,
      pf_percent REAL DEFAULT 12.0,
      professional_tax REAL DEFAULT 200.0,
      
      about TEXT,
      love_about_job TEXT,
      hobbies TEXT,
      skills TEXT,
      certifications TEXT,
      
      paid_leave_balance INTEGER DEFAULT 24,
      sick_leave_balance INTEGER DEFAULT 7,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );
  `);

  // 3. OTP Verifications Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL
    );
  `);

  // 4. Attendance Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      work_hours TEXT,
      extra_hours TEXT,
      status TEXT DEFAULT 'Present',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Time Off Requests Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS time_off_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      time_off_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      validity_period TEXT,
      allocation_days REAL DEFAULT 1.0,
      attachment_url TEXT,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed Initial Company & Users if database is empty
  const companyCount = await db.get('SELECT COUNT(*) as count FROM companies');
  if (companyCount.count === 0) {
    const companyRes = await db.run(
      'INSERT INTO companies (name, logo_url) VALUES (?, ?)',
      ['Odoo India', '/logo.svg']
    );
    const companyId = companyRes.lastID;

    const defaultPassword = await bcrypt.hash('admin123', 10);

    // 1. Admin User
    await db.run(`
      INSERT INTO users (
        company_id, login_id, name, email, phone, password_hash, role, 
        department, job_position, emp_code, date_of_joining, monthly_wage,
        bank_account_no, bank_name, ifsc_code, pan_no, uan_no, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      companyId, 'OIADMI20250001', 'Padmesh T', 'padmesh.t01@gmail.com', '+91 98765 43210',
      defaultPassword, 'Admin', 'Engineering', 'System Administrator & Engineer', 'EMP-1001',
      '2023-06-15', 250000, '50100234567890', 'HDFC Bank', 'HDFC0001234', 'ABCDE1234F', '100908070605', 'Present'
    ]);

    // 2. HR Officer User
    await db.run(`
      INSERT INTO users (
        company_id, login_id, name, email, phone, password_hash, role, 
        department, job_position, emp_code, date_of_joining, monthly_wage,
        bank_account_no, bank_name, ifsc_code, pan_no, uan_no, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      companyId, 'OIHR0120250002', 'Gokul M', 'mgokul92006@gmail.com', '+91 98765 43211',
      defaultPassword, 'HR Officer', 'Human Resources', 'Senior HR Manager', 'EMP-1002',
      '2023-07-01', 220000, '60200345678901', 'ICICI Bank', 'ICIC0002345', 'BCDEF2345G', '100908070606', 'Present'
    ]);

    // 3. Employee User
    await db.run(`
      INSERT INTO users (
        company_id, login_id, name, email, phone, password_hash, role, 
        department, job_position, emp_code, date_of_joining, monthly_wage,
        bank_account_no, bank_name, ifsc_code, pan_no, uan_no, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      companyId, 'OIEM0120250003', 'Subash S', 's8581553@gmail.com', '+91 98765 43212',
      defaultPassword, 'Employee', 'Administration', 'Operations Analyst', 'EMP-1003',
      '2022-04-10', 280000, '30300456789012', 'State Bank of India', 'SBIN0003456', 'CDEFG3456H', '100908070607', 'Absent'
    ]);

    // Seed Initial Attendance
    const users = await db.all('SELECT id, name FROM users');
    for (const u of users) {
      await db.run(`
        INSERT INTO attendance (employee_id, date, check_in, check_out, work_hours, extra_hours, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [u.id, '2025-10-28', '10:00', '19:00', '09:00', '01:00', 'Present']);
    }

    // Seed Initial Time Off
    await db.run(`
      INSERT INTO time_off_requests (employee_id, time_off_type, start_date, end_date, validity_period, allocation_days, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [users[0].id, 'Paid time off', '2025-10-28', '2025-10-28', 'Oct 28 to Oct 28', 1.0, 'Validated']);

    await db.run(`
      INSERT INTO time_off_requests (employee_id, time_off_type, start_date, end_date, validity_period, allocation_days, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [users[1].id, 'Sick Leave', '2025-11-05', '2025-11-06', 'Nov 05 to Nov 06', 2.0, 'Pending']);
  }
}
