import { BarChart3, TrendingUp, Users, Music, Calendar } from 'lucide-react';
import GlassCard from '@/components/admin/GlassCard';

const Analytics = () => {
  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', plays: 12400, users: 890 },
    { month: 'Feb', plays: 15600, users: 1120 },
    { month: 'Mar', plays: 18900, users: 1450 },
    { month: 'Apr', plays: 22300, users: 1780 },
    { month: 'May', plays: 26700, users: 2100 },
    { month: 'Jun', plays: 31200, users: 2560 },
  ];

  const topGenres = [
    { name: 'Pop', percentage: 35, count: 642 },
    { name: 'Electronic', percentage: 28, count: 518 },
    { name: 'Rock', percentage: 18, count: 332 },
    { name: 'Hip Hop', percentage: 12, count: 221 },
    { name: 'Other', percentage: 7, count: 134 },
  ];

  const maxPlays = Math.max(...monthlyData.map((d) => d.plays));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Track your platform's performance and insights</p>
      </div>

      {/* Time Period Selector */}
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-gradient-to-r from-accent-orange to-accent-red text-white rounded-lg text-sm font-medium">
          Last 6 Months
        </button>
        <button className="px-4 py-2 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
          Last Year
        </button>
        <button className="px-4 py-2 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
          All Time
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plays & Users Chart */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Plays & User Growth</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-orange to-accent-red" />
                <span className="text-gray-400">Plays</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-accent-blue" />
                <span className="text-gray-400">Users</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 w-12">{data.month}</span>
                  <div className="flex-1 mx-4 space-y-1">
                    {/* Plays Bar */}
                    <div className="relative h-6 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-orange to-accent-red rounded-full"
                        style={{ width: `${(data.plays / maxPlays) * 100}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs text-white font-medium">
                        {data.plays.toLocaleString()}
                      </span>
                    </div>
                    {/* Users Bar */}
                    <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-accent-blue rounded-full"
                        style={{ width: `${(data.users / 3000) * 100}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs text-white font-medium">
                        {data.users.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Genres */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Top Genres</h2>
          <div className="space-y-4">
            {topGenres.map((genre, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">{genre.name}</span>
                  <span className="text-sm text-gray-400">{genre.percentage}%</span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-orange to-accent-red rounded-full transition-all duration-500"
                    style={{ width: `${genre.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{genre.count} songs</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Avg. Plays per Song</p>
          <p className="text-2xl font-bold text-white">248</p>
          <p className="text-xs text-green-400 mt-2">+15% from last month</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Active Users</p>
          <p className="text-2xl font-bold text-white">8,542</p>
          <p className="text-xs text-green-400 mt-2">+23% from last month</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Avg. Session Time</p>
          <p className="text-2xl font-bold text-white">45m</p>
          <p className="text-xs text-green-400 mt-2">+8% from last month</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-white">$12.5K</p>
          <p className="text-xs text-green-400 mt-2">+31% from last month</p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Analytics;
