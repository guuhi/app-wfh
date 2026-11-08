import { Navigate, Route, Routes } from 'react-router-dom';
import { homePath, useAuth } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import Layout from './components/Layout';
import AdminAttendancePage from './pages/AdminAttendancePage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import EmployeeAttendancePage from './pages/EmployeeAttendancePage';
import LoginPage from './pages/LoginPage';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homePath(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route element={<RequireAuth role="EMPLOYEE" />}>
            <Route path="/attendance" element={<EmployeeAttendancePage />} />
          </Route>
          <Route element={<RequireAuth role="ADMIN" />}>
            <Route path="/admin/employees" element={<AdminEmployeesPage />} />
            <Route path="/admin/attendance" element={<AdminAttendancePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
