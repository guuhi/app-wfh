import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <header className="topbar">
        <strong className="brand">WFH Attendance</strong>
        <nav>
          {user?.role === 'EMPLOYEE' && (
            <NavLink to="/attendance">My attendance</NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <NavLink to="/admin/employees">Employees</NavLink>
              <NavLink to="/admin/attendance">Attendance</NavLink>
            </>
          )}
        </nav>
        <div className="who">
          <span>{user?.name}</span>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
