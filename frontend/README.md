# Frontend (React + TypeScript + Vite)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

Start both backend services first. The browser camera only works on `http://localhost` or HTTPS.

## Pages

| Route | Role | What it does |
|---|---|---|
| `/login` | public | Log in; employees go to `/attendance`, admins to `/admin/employees` |
| `/attendance` | EMPLOYEE | Camera capture and submit today's attendance, plus own history |
| `/admin/employees` | ADMIN | List, add, edit, deactivate/activate employees |
| `/admin/attendance` | ADMIN | Read-only attendance list, filter by employee and dates, view photos |

## Structure

```
src/
  api/          http.ts (fetch wrapper + token + errors), auth.ts, employees.ts, attendance.ts, types.ts
  auth/         AuthContext (login/logout state), RequireAuth (route guard), session.ts (localStorage)
  components/   CameraCapture (custom component), AttendancePhoto, EmployeeForm, Layout
  pages/        LoginPage, EmployeeAttendancePage, AdminEmployeesPage, AdminAttendancePage
```

`src/api` is the only code that talks to the backend. `auth-service` is on :3001 and `attendance-service` is on :3002; change the URLs in `.env`.
