import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Music } from 'lucide-react';
import GlassCard from '@/components/admin/GlassCard';

const Albums = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data - replace with API call
  const [albums, setAlbums] = useState([
    {
      id: 1,
      title: 'Summer Vibes 2024',
      artist: 'Various Artists',
      tracks: 12,
      releaseDate: '2024-06-15',
      coverUrl: 'https://via.placeholder.com/300',
      status: 'Published',
    },
    {
      id: 2,
      title: 'Midnight Sessions',
      artist: 'DJ Shadow',
      tracks: 8,
      releaseDate: '2024-03-20',
      coverUrl: 'https://via.placeholder.com/300',
      status: 'Published',
    },
  ]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this album?')) {
      setAlbums(albums.filter((album) => album.id !== id));
    }
  };

  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Albums</h1>
          <p className="text-gray-400">Manage your music albums and collections</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white rounded-xl hover:shadow-lg hover:shadow-accent-orange/20 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create Album</span>
        </button>
      </div>

      {/* Search Bar */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search albums by title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
          />
        </div>
      </GlassCard>

      {/* Albums Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Album
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Tracks
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Release Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAlbums.map((album) => (
                <tr
                  key={album.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-white font-medium">{album.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {album.artist}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Music className="w-4 h-4" />
                      <span>{album.tracks}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {new Date(album.releaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      {album.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(album.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

      {/* Create Album Modal */}
      {showCreateModal && (
        <CreateAlbumModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

// Create Album Modal Component
const CreateAlbumModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    releaseDate: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to create album
    console.log('Creating album:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl p-8 m-4">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Album</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Album Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
              placeholder="Enter album title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Artist Name
            </label>
            <input
              type="text"
              required
              value={formData.artist}
              onChange={(e) =>
                setFormData({ ...formData, artist: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
              placeholder="Enter artist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Release Date
            </label>
            <input
              type="date"
              required
              value={formData.releaseDate}
              onChange={(e) =>
                setFormData({ ...formData, releaseDate: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
              placeholder="Enter album description (optional)"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white rounded-xl hover:shadow-lg hover:shadow-accent-orange/20 transition-all duration-300"
            >
              Create Album
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default Albums;
