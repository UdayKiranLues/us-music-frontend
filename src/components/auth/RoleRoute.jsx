import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const RoleRoute = ({ allowedRole, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" />;

  if (user.role !== allowedRole && user.role !== 'admin') {
    return <Navigate to="/home" />;
  }

  return children;
};

export default RoleRoute;