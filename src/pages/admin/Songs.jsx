import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Play, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/admin/GlassCard';
import api from '@/utils/axios';

const Songs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { playSong, replaceQueue } = usePlayer();

  const genres = ['all', 'Pop', 'Electronic', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Country'];

  // Fetch songs from API
  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/v1/songs?limit=50`);
      console.log('📥 Admin Songs: Fetched songs:', response.data);
      const fetchedSongs = response.data.data || [];
      setSongs(fetchedSongs);
      if (fetchedSongs.length === 0) console.log("BACKEND RETURNED EMPTY");
    } catch (err) {
      console.error('❌ Admin Songs: Failed to fetch songs:', err);
      setError('Failed to load songs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        // Cookies are sent automatically with axios.defaults.withCredentials
        await api.delete(`/api/v1/songs/${id}`);
        setSongs(songs.filter((song) => song._id !== id));
      } catch (err) {
        console.error('Failed to delete song:', err);
        alert('Failed to delete song');
      }
    }
  };

  const handlePlay = (song) => {
    replaceQueue(filteredSongs, filteredSongs.indexOf(song));
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre =
      filterGenre === 'all' || (song.genre && song.genre.includes(filterGenre));
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Songs</h1>
          <p className="text-gray-400">Manage individual tracks and their details</p>
        </div>
        <button
          onClick={fetchSongs}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs by title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
            />
          </div>

          {/* Genre Filter */}
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-orange/50 transition-colors appearance-none cursor-pointer"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre} className="bg-dark-lighter">
                {genre === 'all' ? 'All Genres' : genre}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Loading State */}
      {loading && (
        <GlassCard className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-12 h-12 text-accent-orange animate-spin" />
            <p className="text-gray-400">Loading songs...</p>
          </div>
        </GlassCard>
      )}

      {/* Error State */}
      {error && !loading && (
        <GlassCard className="p-12 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchSongs}
            className="px-6 py-2 bg-accent-orange/20 hover:bg-accent-orange/30 border border-accent-orange/50 rounded-xl text-white transition-colors"
          >
            Try Again
          </button>
        </GlassCard>
      )}

      {/* Empty State */}
      {!loading && !error && songs.length === 0 && (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-400 mb-2">No songs uploaded yet</p>
          <p className="text-gray-500 text-sm">Upload your first song to get started!</p>
        </GlassCard>
      )}

      {/* Songs Table */}
      {!loading && !error && filteredSongs.length > 0 && (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Song
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Album
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Plays
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSongs.map((song) => (
                  <tr
                    key={song._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="relative group">
                          <img
                            src={song.coverImageUrl || 'https://via.placeholder.com/100'}
                            alt={song.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div
                            onClick={() => handlePlay(song)}
                            className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Play className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{song.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {song.artist}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {song.album || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-accent-orange/20 text-accent-orange text-xs font-medium">
                        {Array.isArray(song.genre) ? song.genre[0] : song.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300 flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatDuration(song.duration)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span>{song.totalPlays?.toLocaleString() || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(song._id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default Songs;
