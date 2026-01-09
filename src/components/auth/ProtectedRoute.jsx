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
  if (requiredRole) {
    // Support both string and array of allowed roles
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(user?.role)) {
      // Redirect to appropriate fallback
      if (requiredRole === 'admin' || allowedRoles.includes('admin')) {
        return <Navigate to="/" replace />;
      }
      
      // For artist/podcaster routes, redirect to role selection
      if (allowedRoles.includes('artist') || allowedRoles.includes('podcaster')) {
        return <Navigate to="/select-role" replace />;
      }
      
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
