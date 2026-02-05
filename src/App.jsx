import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleRoute from '@/components/auth/RoleRoute';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Library from '@/pages/Library';
import History from '@/pages/History';
import Favourites from '@/pages/Favourites';
import Podcasts from '@/pages/Podcasts';
import PodcastDetail from '@/pages/PodcastDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/admin/Dashboard';
import Albums from '@/pages/admin/Albums';
import Songs from '@/pages/admin/Songs';
import Upload from '@/pages/admin/Upload';
import Analytics from '@/pages/admin/Analytics';
import Users from '@/pages/admin/Users';
import RoleSelection from '@/components/auth/RoleSelection';
import ArtistDashboard from '@/pages/artist/Dashboard';
import CreatePodcast from '@/pages/artist/CreatePodcast';
import CreateEpisode from '@/pages/artist/CreateEpisode';
import Record from '@/pages/artist/Record';
import RecordSong from '@/pages/artist/RecordSong';
import RecordPodcast from '@/pages/artist/RecordPodcast';
import Publish from '@/pages/artist/Publish';
import CreateSong from '@/pages/artist/CreateSong';
import ArtistProfile from '@/pages/ArtistProfile';
import PodcastStudio from '@/pages/artist/PodcastStudio';
import ChangeUsername from '@/pages/settings/ChangeUsername';

function AppContent() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  // Toast notifications for shortcuts
  const { toast } = useToast();

  // Check if user needs role selection on app load
  const { isAuthenticated, isLoading, needsRoleSelection } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && needsRoleSelection() && location.pathname !== '/select-role') {
      navigate('/select-role', { replace: true });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  return (
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
        <Route path="podcasts" element={<Podcasts />} />
        <Route path="podcasts/:id" element={<PodcastDetail />} />
        <Route path="artist/:artistName" element={<ArtistProfile />} />
        <Route path="settings/username" element={<ChangeUsername />} />
      </Route>

      {/* Admin Routes - Protected */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRole="admin">
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="albums" element={<Albums />} />
        <Route path="songs" element={<Songs />} />
        <Route path="upload" element={<Upload />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* Artist Routes - Protected */}
      <Route
        path="/artist"
        element={
          <RoleRoute allowedRole="artist">
            <Layout />
          </RoleRoute>
        }
      >
        <Route path="dashboard" element={<ArtistDashboard />} />
        <Route path="podcasts" element={<PodcastStudio />} />
        <Route path="record" element={<Record />} />
        <Route path="record/song" element={<RecordSong />} />
        <Route path="record/podcast" element={<RecordPodcast />} />
        <Route path="publish/:type" element={<Publish />} />
        <Route path="songs/new" element={<CreateSong />} />
        <Route path="podcasts/new" element={<CreatePodcast />} />
        <Route path="podcasts/:podcastId/new-episode" element={<CreateEpisode />} />
      </Route>

      {/* Role Selection - For users who just logged in */}
      <Route path="/select-role" element={<RoleSelection />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
