import { useState, useEffect } from 'react';
import { TrendingUp, Users, Music, BarChart3 } from 'lucide-react';
import GlassCard from '@/components/admin/GlassCard';
import StatCard from '@/components/admin/StatCard';
import { getBaseURL } from '@/utils/axios';



const AnalyticsLive = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    fetchDashboard();
  }, [timeRange]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken'); // Your auth token

      const response = await fetch(`${getBaseURL()}/api/v1/analytics/dashboard?days=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setDashboard(data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-400">Failed to load analytics</div>
      </div>
    );
  }

  const { overallStats, topSongs, topAlbums, dailyTrend } = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics (Live Data)</h1>
          <p className="text-gray-400">Real-time insights from your platform</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === days
                ? 'bg-gradient-to-r from-accent-orange to-accent-red text-white'
                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Plays"
          value={overallStats.totalPlays?.toLocaleString() || '0'}
          icon={TrendingUp}
          color="orange"
        />
        <StatCard
          title="Unique Songs"
          value={overallStats.uniqueSongs?.toLocaleString() || '0'}
          icon={Music}
          color="blue"
        />
        <StatCard
          title="Completion Rate"
          value={`${overallStats.completionRate || 0}%`}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="Avg Duration"
          value={`${Math.floor(overallStats.avgDuration / 60) || 0}m`}
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Songs */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Top Songs</h2>
          <div className="space-y-4">
            {topSongs?.slice(0, 5).map((song, index) => (
              <div
                key={song.songId}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <img
                    src={getImageUrl(song.coverImageUrl)}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{song.title}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {song.totalPlays.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {song.totalUniqueListeners} listeners
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Albums */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Top Albums</h2>
          <div className="space-y-4">
            {topAlbums?.slice(0, 5).map((album, index) => (
              <div
                key={album.album}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{album.album}</p>
                    <p className="text-sm text-gray-400">
                      {album.songCount} songs
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {album.totalPlays.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">plays</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Daily Trend Chart */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Daily Trend</h2>
        <div className="space-y-3">
          {dailyTrend?.slice(-10).map((day) => {
            const maxPlays = Math.max(...dailyTrend.map((d) => d.totalPlays));
            const percentage = (day.totalPlays / maxPlays) * 100;

            return (
              <div key={day.date} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-white font-medium">
                    {day.totalPlays.toLocaleString()} plays
                  </span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-orange to-accent-red rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};

export default AnalyticsLive;
