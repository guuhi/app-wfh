# WFH Attendance & Employee Monitoring App

## 1. Overview and assumptions

Employees log in and record work-from-home attendance with a live camera photo. The server sets the timestamp. HRD admins manage employee data and view submitted attendance (read-only). Built as a skill test: NestJS microservices-style backend, PostgreSQL, React frontend with custom components. See the full [PRD](<PRD WFH Attendance & Employee Monitoring App.md>).

Assumptions (from the PRD):
- Two roles only: Employee and HRD Admin. Admin is seeded (`admin@company.com` / `Admin12345`); no self-registration.
- Admins create employees and set the initial password.
- One check-in per employee per day; no check-out.
- Photo comes from live browser camera capture (`getUserMedia`), so the app must run on HTTPS or localhost.
- Server time in a single timezone (`APP_TIMEZONE`).
- "Delete" employee = soft delete (deactivate) to keep attendance history.
- Deployment is local or Docker only. English UI.

## 2. Setup and run

Requires Node.js and Docker.

```bash
# 1. Database (Postgres on host port 5437, creates auth_db and attendance_db)
docker compose up -d postgres

# 2. Auth service (:3001, seeds the admin)
cd auth-service
cp .env.example .env
npm install
npm run start:dev

# 3. Attendance service (:3002), JWT_SECRET must match auth-service
cd ../attendance-service
cp .env.example .env
npm install
npm run start:dev

# 4. Frontend (http://localhost:5173)
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Everything in Docker instead: create both service `.env` files as above, then `docker compose up --build` and open http://localhost:5173.

Quick API check:

```bash
curl -s localhost:3001/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@company.com","password":"Admin12345"}'
```

## 3. What was built

| Area | Delivered |
|---|---|
| `auth-service` (:3001) | Login, `/auth/me`, JWT, role guards, employee CRUD (bcrypt-hashed passwords, delete = deactivate) |
| `attendance-service` (:3002) | Check-in with photo, own history, admin list with filters (`employeeId`, `dateFrom`, `dateTo`), protected photo endpoint |
| `frontend` (React + Vite) | Login, employee attendance page, admin employee management, admin attendance monitoring |
| Custom components | `CameraCapture` (live capture), `AttendancePhoto`, `EmployeeForm`, `Layout` |
| Infra | `docker-compose.yml` (Postgres + both services + nginx-served frontend), DB init script |

| Method | Path | Role |
|---|---|---|
| POST | `/auth/login` | public |
| GET | `/auth/me` | any |
| GET / POST | `/employees` | ADMIN |
| GET / PUT / DELETE | `/employees/:id` | ADMIN |
| POST | `/attendances` (multipart `photo`) | EMPLOYEE |
| GET | `/attendances/me` | EMPLOYEE |
| GET | `/attendances` | ADMIN |
| GET | `/attendances/:id/photo` | ADMIN or owner |

Security: hashed passwords, JWT, DTO validation, photo limited to 5 MB and checked by magic bytes (JPEG/PNG/WebP), not extension.

## 4. What was deferred and why

Per the PRD's out-of-scope list, plus pragmatic cuts:

- Check-out, work hours, overtime, late rules: not in the test objective.
- Admin edit/approve/reject of attendance: records are read-only by requirement.
- Geolocation, face recognition, tamper-proof photos: a forged API request can't be fully prevented; server time is the source of truth.
- Leave requests, CSV/PDF export, notifications, password reset, multiple admin roles, analytics.
- Shared auth library and automated tests: not built, to keep the scope small.

## 5. Architecture (system design)

```
React (nginx :5173)
   |  REST + JWT                 |  REST + JWT
   v                             v
auth-service :3001          attendance-service :3002
   |                             |
 auth_db (employees)       attendance_db (attendances)  + photo files on disk
              \_______ one Postgres instance _______/
```
