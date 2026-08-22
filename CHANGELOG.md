# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/) and this project uses a
four-digit `MAJOR.MINOR.PATCH.MICRO` version.

## [1.0.1.0] - 2026-08-22

### Security
- Enforce per-company data isolation across all API routes. Previously employee,
  attendance, time-off, and payroll queries were not consistently scoped by
  `company_id`, which allowed an admin of one company to see another company's
  records. All protected routes now derive `company_id` from the signed auth
  token (`requireAuth` middleware) instead of trusting client-supplied values.
- Use constant-time HMAC signature comparison when verifying auth tokens to
  mitigate timing side-channels.

### Fixed
- Employee creation no longer hardcodes `company_id = 1`; the employee's company
  is taken from the authenticated requester, and per-company employee serials /
  `emp_code` are generated correctly.
- Employee-role users can only read their own attendance and time-off records;
  admins and HR see company-wide data.
- Frontend no longer falls back to the bundled mock dataset (which contained
  cross-company placeholder employees) when an API list returns empty.
  `DataContext` now starts empty and always uses the authenticated company's data,
  so the Attendance and Time-Off pages can never show another company's people.
- Attendance page defaults its date filter to today so company-wide logs are
  visible immediately.

### Added
- Signed JWT auth tokens issued on sign-in (`verify-otp`) and company sign-up,
  using Node's built-in `crypto` (no new runtime dependency).
- `server/middleware/auth.js` `requireAuth` middleware and
  `server/utils/token.js` sign/verify helpers.

## [1.0.0.0] - 2025-01-01

- Initial release: HR, Attendance, Leave (Time-off), and Payroll modules.
