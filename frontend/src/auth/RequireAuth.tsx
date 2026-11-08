import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../api/types';
import { homePath, useAuth } from './AuthContext';

/** Route guard: the frontend version of JwtAuthGuard + RolesGuard. */
export default function RequireAuth({ role }: { role?: Role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to={homePath(user.role)} replace />;
  return <Outlet />;
}
