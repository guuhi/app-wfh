// Plain SQL. Runs on every startup; IF NOT EXISTS makes it safe to repeat.
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS attendances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID         NOT NULL,           -- no FK: employees live in auth-service's database
  employee_name   VARCHAR(150) NOT NULL,           -- snapshot from the JWT
  attendance_date DATE         NOT NULL,           -- local calendar day (APP_TIMEZONE)
  attendance_at   TIMESTAMPTZ  NOT NULL,           -- exact server time of submission
  photo_path      VARCHAR(255) NOT NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, attendance_date)  -- one per day
);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances (attendance_date);
`;
