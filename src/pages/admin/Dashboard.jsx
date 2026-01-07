import { Users, Music, Album, TrendingUp, Play, Download } from 'lucide-react';
import GlassCard from '@/components/admin/GlassCard';
import StatCard from '@/components/admin/StatCard';

const Dashboard = () => {
  // Mock data - replace with API calls
  const stats = {
    totalUsers: 12543,
    totalSongs: 1847,
    totalAlbums: 234,
    totalPlays: 458923,
  };

  const recentActivity = [
    {
      id: 1,
      type: 'upload',
      user: 'Admin',
      action: 'uploaded',
      target: 'Sunset Dreams',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'user',
      user: 'John Doe',
      action: 'registered',
      target: 'new account',
      time: '3 hours ago',
    },
    {
      id: 3,
      type: 'play',
      user: 'Sarah Smith',
      action: 'played',
      target: 'Midnight Echo',
      time: '5 hours ago',
    },
  ];

  const topSongs = [
    {
      id: 1,
      title: 'Sunset Dreams',
      artist: 'Luna Wave',
      plays: 15234,
      coverUrl: 'https://via.placeholder.com/100',
    },
    {
      id: 2,
      title: 'Ocean Breeze',
      artist: 'Coral Reef',
      plays: 12456,
      coverUrl: 'https://via.placeholder.com/100',
    },
    {
      id: 3,
      title: 'Midnight Echo',
      artist: 'DJ Shadow',
      plays: 8921,
      coverUrl: 'https://via.placeholder.com/100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={12.5}
          color="blue"
        />
        <StatCard
          title="Total Songs"
          value={stats.totalSongs.toLocaleString()}
          icon={Music}
          trend={8.3}
          color="orange"
        />
        <StatCard
          title="Albums"
          value={stats.totalAlbums.toLocaleString()}
          icon={Album}
          trend={5.2}
          color="purple"
        />
        <StatCard
          title="Total Plays"
          value={stats.totalPlays.toLocaleString()}
          icon={TrendingUp}
          trend={23.1}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Songs */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Top Songs</h2>
            <button className="text-sm text-accent-orange hover:text-accent-red transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {topSongs.map((song, index) => (
              <div
                key={song._id || song.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {song.plays.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  {activity.type === 'upload' && (
                    <Music className="w-4 h-4 text-accent-orange" />
                  )}
                  {activity.type === 'user' && (
                    <Users className="w-4 h-4 text-accent-blue" />
                  )}
                  {activity.type === 'play' && (
                    <Play className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="text-accent-orange">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Upload New Song</p>
              <p className="text-xs text-gray-400">Add music to library</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Album className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Create Album</p>
              <p className="text-xs text-gray-400">Organize your tracks</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Export Data</p>
              <p className="text-xs text-gray-400">Download analytics</p>
            </div>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;
