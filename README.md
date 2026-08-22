# Dayflow

A multi-tenant HRMS (Human Resource Management System) web application covering
**Employees**, **Attendance**, **Time‑Off / Leaves**, and **Payroll**. Each
company that signs up is fully isolated from every other company — admins and
employees only ever see data belonging to their own company.

---

## Features

- **Employee Management** — add, edit, and view employee profiles (HR / Admin).
- **Attendance** — check‑in / check‑out, day‑wise logs, and company‑wide
  attendance views for HR / Admin.
- **Time‑Off & Leaves** — request leave, approve / reject (HR / Admin), and a
  personal leave calendar for employees.
- **Payroll** — per‑employee payslip calculation.
- **Multi‑tenancy** — every company gets its own isolated workspace. Data is
  scoped by `company_id` derived from a signed auth token, never from
  client‑supplied values.
- **Authentication** — email + password with a simulated 2FA OTP step; signed
  JWT issued on login and on company sign‑up.

---

## Tech Stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS v4, lucide‑react          |
| Backend  | Node.js, Express 5                                      |
| Database | SQLite (`sqlite3`) — file‑based, auto‑seeded            |
| Auth     | HMAC‑signed JWT via Node's built‑in `crypto` (no extra dependency) |

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on current LTS)
- npm

### Installation

```bash
npm install
```

### Run in development

```bash
npm run dev
```

This starts both processes concurrently:

- **API server** on `http://localhost:5000`
- **Client (Vite)** on `http://localhost:5173`

### Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serves the built client
```

> The client communicates with the API at `http://localhost:5000/api`
> (see `src/context/DataContext.jsx`). Adjust `API_BASE` if your backend runs
> elsewhere.

---

## Demo Credentials

On first run the database is auto‑seeded with a demo company **"Odoo India"**
and three users (password for all: `admin123`):

| Role       | Login ID         | Name       | Email                   |
| ---------- | --------------- | ---------- | ----------------------- |
| Admin      | `OIADMI20250001`| Padmesh T  | padmesh.t01@gmail.com   |
| HR Officer | `OIHR0120250002`| Gokul M    | mgokul92006@gmail.com   |
| Employee   | `OIEM0120250003`| Subash S   | s8581553@gmail.com     |

### Signing in

1. Enter the **Login ID** (or email) and password → the API returns a simulated
   **OTP** (`otpCode`) in the response (for demo convenience).
2. Submit the OTP to `/api/auth/verify-otp` to receive a JWT `token`.

> **Note:** The OTP is returned in the API response for demo purposes only.
> In production this would be sent by email/SMS and never returned in the
> response body.

### Creating a new company

Use **Sign Up** to register a new company and its first Admin. The new company
is completely isolated — it starts with no employees, attendance, or leave
records of its own.

---

## Project Structure

```
Dayflow/
├── server/                 # Express backend
│   ├── index.js            # App entry, route mounting, CORS, static uploads
│   ├── db.js               # SQLite connection + schema + auto‑seed
│   ├── middleware/
│   │   └── auth.js         # requireAuth — validates JWT, sets req.user
│   ├── utils/
│   │   ├── token.js        # signToken / verifyToken (HMAC, constant‑time)
│   │   ├── idGenerator.js  # Login ID generation (OI + initials + year + serial)
│   │   └── mailer.js       # Simulated OTP "email"
│   └── routes/
│       ├── authRoutes.js       # sign‑in, verify‑otp, sign‑up, change‑password
│       ├── employeeRoutes.js   # company‑scoped employee CRUD
│       ├── attendanceRoutes.js # check‑in/out + logs (company scoped)
│       ├── timeoffRoutes.js    # leave requests (company scoped)
│       └── payrollRoutes.js     # per‑employee payslip (company scoped)
├── src/                    # React frontend
│   ├── main.jsx            # Provider tree: AuthProvider > DataProvider > App
│   ├── App.jsx             # Routing
│   ├── context/
│   │   ├── AuthContext.jsx   # token storage, authHeaders()
│   │   └── DataContext.jsx    # fetches company‑scoped data from the API
│   ├── pages/              # AttendancePage, TimeOffPage, EmployeesPage, ...
│   └── components/         # Modals, Navbar, SignIn, SignUp, ...
└── package.json
```

---

## Multi‑Tenancy & Security Model

- Every authenticated request passes through `requireAuth`
  (`server/middleware/auth.js`), which verifies the JWT and populates
  `req.user` with `{ userId, companyId, role, ... }`.
- **All** data queries in the protected routes are filtered by
  `req.user.companyId`. Client‑supplied `company_id` values are never trusted.
- **Role‑based visibility:**
  - `Employee` users may only read **their own** attendance and time‑off records.
  - `Admin` / `HR Officer` users see company‑wide data.
- Auth tokens are signed with HMAC‑SHA256 using Node's `crypto` module
  (constant‑time signature comparison). No third‑party JWT library is required.

### Environment variables

| Variable             | Purpose                                  | Default                                  |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| `DAYFLOW_JWT_SECRET` | Secret used to sign auth tokens          | A hardcoded dev secret (change in prod!) |

```bash
# Example (Linux/macOS)
export DAYFLOW_JWT_SECRET="your-strong-secret"
npm run server
```

---

## API Reference

All routes below (except `/api/auth/*` sign‑in/sign‑up) require the header
`Authorization: Bearer <token>`.

### Auth
| Method | Path                    | Body                                              | Notes                          |
| ------ | ----------------------- | ------------------------------------------------- | ------------------------------ |
| POST   | `/api/auth/sign-in`     | `{ loginOrEmail, password }`                      | Returns simulated `otpCode`    |
| POST   | `/api/auth/verify-otp`  | `{ email, otpCode }`                              | Returns `token` + `user`       |
| POST   | `/api/auth/sign-up`     | `{ companyName, name, email, phone, password }`   | Creates company + Admin, returns `token` |
| POST   | `/api/auth/change-password` | `{ userId, oldPassword, newPassword }`        |                                |

### Employees (Admin / HR)
| Method | Path                 | Notes                              |
| ------ | -------------------- | ---------------------------------- |
| GET    | `/api/employees`     | Company‑scoped list                |
| POST   | `/api/employees`     | Create (uses requester's company)  |
| PUT    | `/api/employees/:id` | Update                            |

### Attendance
| Method | Path                      | Body                | Notes                     |
| ------ | ------------------------- | ------------------- | ------------------------- |
| GET    | `/api/attendance/logs`    | `?employeeId=&date=`| Company‑scoped; employees see own |
| POST   | `/api/attendance/check-in`  | `{ employeeId }`  |                           |
| POST   | `/api/attendance/check-out` | `{ employeeId }`  |                           |

### Time‑Off / Leaves
| Method | Path                         | Body                                                        | Notes                     |
| ------ | ---------------------------- | ----------------------------------------------------------- | ------------------------- |
| GET    | `/api/timeoff`               | `?employeeId=`                                              | Company‑scoped            |
| POST   | `/api/timeoff`               | `{ employeeId, timeOffType, startDate, endDate, allocationDays }` |                       |
| PUT    | `/api/timeoff/:id/status`    | `{ status: "Validated" \| "Refused" }`                      | Admin / HR only           |

### Payroll
| Method | Path                           | Notes                                          |
| ------ | ------------------------------ | ---------------------------------------------- |
| GET    | `/api/payroll/payslip/:empId`  | Employee may fetch own; Admin/HR any in company |

---

## Database

Dayflow uses a single SQLite file (`server/dayflow.db`, created automatically).
On first launch the schema is created and, if empty, seeded with the demo
company described above. The database file is git‑ignored — delete it to
re‑seed from scratch.

---

## Notes & Known Limitations

- The OTP step is **simulated** for demo purposes (the code is returned in the
  API response) and should be replaced with real email/SMS delivery before
  production use.
- File uploads (e.g. avatars, leave attachments) are served from
  `server/uploads` (git‑ignored).
- Automated tests are not yet included; API behavior is verified manually
  against the running server.
