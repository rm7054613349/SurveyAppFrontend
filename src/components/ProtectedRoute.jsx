
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function ProtectedRoute({ children, allowedRole }) {
  console.log('ProtectedRoute checked', { allowedRole });
  const role = localStorage.getItem('role');
  const isAuthenticated = !!role;
  const isAuthorized = isAuthenticated && (Array.isArray(allowedRole) ? allowedRole.includes(role) : role === allowedRole);

  if (!isAuthenticated) {
    console.log('Redirecting to login: no role found');
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    console.log('Redirecting to login: unauthorized role', { role, allowedRole });
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute passed', { role });
  return children;
}

export default ProtectedRoute;
