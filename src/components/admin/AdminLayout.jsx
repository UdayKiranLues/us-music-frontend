import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Album, 
  Music, 
  Upload, 
  BarChart3, 
  Users, 
  Menu, 
  X,
  LogOut,
  Settings
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Albums', icon: Album, path: '/admin/albums' },
    { name: 'Songs', icon: Music, path: '/admin/songs' },
    { name: 'Upload', icon: Upload, path: '/admin/upload' },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Users', icon: Users, path: '/admin/users' },
  ];

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-dark via-dark-light to-dark-lighter">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-dark-lighter/80 backdrop-blur-xl border-r border-white/5`}
        style={{ width: '280px' }}
      >
        <div className="flex flex-col h-full px-3 py-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8 px-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-gray-400">US Music</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-accent-orange/20 to-accent-red/20 text-white border border-accent-orange/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-6 space-y-2 flex-shrink-0">
            <button className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'ml-[280px]' : 'ml-0'
        }`}
      >
        {/* Top Bar */}
        <header className="flex-shrink-0 bg-dark-lighter/80 backdrop-blur-xl border-b border-white/5">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-400" />
              )}
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@usmusic.com</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
