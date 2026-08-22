import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import timeoffRoutes from './routes/timeoffRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import { getDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timeoff', timeoffRoutes);
app.use('/api/payroll', payrollRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', system: 'Dayflow HRMS Node.js SQLite API Engine' });
});

// Initialize Database & Start Express Server
getDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Dayflow Backend Running on http://localhost:${PORT}`);
      console.log(`💾 Connected to SQLite Database (server/dayflow.db)`);
      console.log(`==================================================\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize SQLite Database:', err);
  });
