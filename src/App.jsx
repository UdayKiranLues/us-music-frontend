import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import Toast, { useToast } from '@/components/common/Toast';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Library from '@/pages/Library';
import History from '@/pages/History';
import Favourites from '@/pages/Favourites';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/admin/Dashboard';
import Albums from '@/pages/admin/Albums';
import Songs from '@/pages/admin/Songs';
import Upload from '@/pages/admin/Upload';
import Analytics from '@/pages/admin/Analytics';
import Users from '@/pages/admin/Users';

function AppContent() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();
  
  // Toast notifications for shortcuts
  const { toast } = useToast();

  return (
    <>
      <Routes>
        {/* Auth Routes - Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={<Library />} />
          <Route path="history" element={<History />} />
          <Route path="favourites" element={<Favourites />} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="albums" element={<Albums />} />
          <Route path="songs" element={<Songs />} />
          <Route path="upload" element={<Upload />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast toast={toast} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
