import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Protected Route Component
 * Restricts access based on authentication and user role
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary-500" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect non-admin users trying to access admin routes
    if (requiredRole === 'admin') {
      return <Navigate to="/" replace />;
    }
    
    // Redirect non-artist users trying to access artist routes
    if (requiredRole === 'artist' && user?.role !== 'artist') {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
