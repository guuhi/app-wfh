# PRD: WFH Attendance & Employee Monitoring App

## 1. Overview

A web application that lets employees log in and record work-from-home (WFH) attendance by capturing the date/time and taking a camera photo as proof of working from home. HRD admins manage employee master data and monitor submitted attendance (view only).

The project also serves as a skill test, so it should demonstrate: sound database design, API-based CRUD, a microservices-style backend, and a React frontend with at least one custom component.

## 2. Goals

- Employees can log in and submit WFH attendance with a timestamp and photo.
- HRD admins can add and update employee data.
- HRD admins can view attendance submitted by employees, without editing it.
- Backend and frontend communicate fully through APIs.

## 3. Users

| Role | Description |
| --- | --- |
| Employee | Logs in, submits own WFH attendance. |
| HRD Admin | Manages employee master data, views all attendance. |

## 4. Functional Requirements

### 4.1 Authentication (both roles)

- FR-1: Users log in with credentials (e.g., email/employee ID + password).
- FR-2: Access is role-based; employees cannot reach admin pages and vice versa.
- FR-3: Users can log out; unauthenticated requests are rejected.

### 4.2 WFH Attendance (Employee)

- FR-4: Employee captures a photo with the browser camera (live capture, no file picker) and submits it as attendance proof.
- FR-5: The date and time are captured automatically at submission (server-side time), not entered by the user.
- FR-6: Employee can view their own attendance history.
- FR-7: A captured photo is required; the submission is rejected without it.

### 4.3 Employee Master Data (HRD Admin)

- FR-8: Admin can create an employee (name, email, position, phone, photo optional, login credentials).
- FR-9: Admin can view the employee list and details.
- FR-10: Admin can update employee data.
- FR-11: Delete is covered by the test's CRUD objective; implement as soft delete / deactivate (see Assumptions).

### 4.4 Attendance Monitoring (HRD Admin)

- FR-12: Admin can view all submitted attendance (employee, date/time, photo).
- FR-13: Admin can filter by employee and date.
- FR-14: Attendance records are read-only for admins.

## 5. Technical Requirements

| Area | Requirement |
| --- | --- |
| Backend language | JavaScript / TypeScript (TypeScript preferred) |
| Backend framework | NestJS |
| Database | PostgreSQL or MySQL (PostgreSQL is the working choice for this build) |
| Architecture | Microservices concept: two separate NestJS services over plain REST, no message broker: Auth/Employee service and Attendance service, each with its own API |
| Frontend | React.js, with at least one custom reusable component (e.g., photo uploader, data table) |
| API | REST, JSON; full create/read/update/delete for employee data |
| Security | Hashed passwords, token-based auth (JWT), input validation, file type/size checks on uploads |

## 6. High-Level Data Model

- **employees**: id, name, email, position, phone, password\_hash, role (EMPLOYEE / ADMIN), is\_active, created\_at, updated\_at
- **attendances**: id, employee\_id (FK), attendance\_at (timestamp), photo\_url, created\_at

## 7. Key API Endpoints (indicative)

| Method | Endpoint | Role |
| --- | --- | --- |
| POST | /auth/login | All |
| POST | /attendances | Employee |
| GET | /attendances/me | Employee |
| GET | /attendances | Admin (filter by employee, date) |
| GET / POST | /employees | Admin |
| GET / PUT / DELETE | /employees/:id | Admin |

## 8. Acceptance Criteria

- An employee can log in, capture a photo with the camera, and see the new record with an auto-captured timestamp in their history.
- An admin can create and edit an employee, and that employee can then log in.
- An admin can see employees' submissions with photos and cannot modify them.
- Backend runs as separate services with a working database connection.
- Frontend consumes the APIs end to end, including one custom component.

## 9. Assumptions

- Two roles only: Employee and HRD Admin. Admin accounts are seeded; no self-registration.
- Employees are created by admins, who set the initial password.
- One check-in per employee per day (confirmed); a second submission on the same day is rejected. No separate check-out.
- Photo comes from live browser camera capture (getUserMedia), stored on local disk or object storage; the database stores the path. The app runs on HTTPS or localhost, since browsers block camera access otherwise.
- Timestamp uses server time in a single timezone (e.g., WIB).
- "Delete" for employees is a soft delete to preserve attendance history.
- Desktop and mobile browsers are supported; no native app.
- Deployment is local or Docker; hosted deployment is not required.
- UI language is English.

## 10. Out of Scope

- Native mobile apps.
- Check-out, work hours calculation, overtime, or late rules.
- Leave, sick, or permission requests.
- Admin editing, approving, or rejecting attendance.
- Geolocation, face recognition, or tamper-proof photo verification (a forged API request cannot be fully prevented; server time is the source of truth).
- Payroll integration, reports export (CSV/PDF), notifications.
- Password reset by email, SSO, or multi-factor authentication.
- Multiple admin roles or granular permissions.
- Advanced analytics dashboards.

## 11. Decisions

- Database: PostgreSQL or MySQL.
- Photo: browser camera capture, not file upload.
- Attendance: one per day.
- Services: separate REST services, no message broker.
