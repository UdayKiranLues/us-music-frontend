import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ArtistDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('podcasts');
  const [myPodcasts, setMyPodcasts] = useState([]);
  const [mySongs, setMySongs] = useState([]);
  const [myAlbums, setMyAlbums] = useState([]);
  const [loadingPodcasts, setLoadingPodcasts] = useState(true);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch artist's podcasts
        const podcastRes = await axios.get(`${API_URL}/api/v1/artist/podcasts`);
        setMyPodcasts(podcastRes.data.data || []);
        console.log('📻 Fetched my podcasts:', podcastRes.data.data);
      } catch (err) {
        console.error('❌ Failed to fetch podcasts:', err);
      } finally {
        setLoadingPodcasts(false);
      }

      try {
        // Fetch artist's songs
        const songsRes = await axios.get(`${API_URL}/api/v1/artist/songs`);
        setMySongs(songsRes.data.data || []);
        console.log('🎵 Fetched my songs:', songsRes.data.data);
      } catch (err) {
        console.error('❌ Failed to fetch songs:', err);
      } finally {
        setLoadingSongs(false);
      }

      try {
        // Fetch artist's albums
        const albumsRes = await axios.get(`${API_URL}/api/v1/artist/albums`);
        setMyAlbums(albumsRes.data.data || []);
        console.log('💿 Fetched my albums:', albumsRes.data.data);
      } catch (err) {
        console.error('❌ Failed to fetch albums:', err);
      } finally {
        setLoadingAlbums(false);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-strong border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-accent-blue/20 to-dark/20 opacity-60" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Welcome back, <span className="bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">{user?.name}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg md:text-xl"
          >
            � Create, record, and share your music & podcasts
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Quick Actions */}
      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Create Podcast */}
        <Link to="/artist/podcasts/new">
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="h-full bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 hover:from-accent-purple/30 hover:to-accent-blue/30 border border-accent-purple/50 hover:border-accent-purple rounded-2xl p-8 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-purple transition-colors">
              Create Podcast
            </h3>
            <p className="text-gray-400 text-sm">
              Start a new podcast series
            </p>
          </motion.div>
        </Link>

        {/* Upload Song */}
        <Link to="/artist/songs/new">
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="h-full bg-gradient-to-br from-accent-orange/20 to-accent-red/20 hover:from-accent-orange/30 hover:to-accent-red/30 border border-accent-orange/50 hover:border-accent-orange rounded-2xl p-8 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4">📤</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-orange transition-colors">
              Upload Song
            </h3>
            <p className="text-gray-400 text-sm">
              Upload existing music file
            </p>
          </motion.div>
        </Link>

        {/* Record Podcast */}
        <Link to="/artist/record?type=podcast">
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="h-full bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 hover:from-accent-blue/30 hover:to-accent-purple/30 border border-accent-blue/50 hover:border-accent-blue rounded-2xl p-8 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4">🎙️</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-blue transition-colors">
              Record Podcast
            </h3>
            <p className="text-gray-400 text-sm">
              Record directly in browser
            </p>
          </motion.div>
        </Link>

        {/* Record Song */}
        <Link to="/artist/record?type=song">
          <motion.div
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="h-full bg-gradient-to-br from-accent-red/20 to-accent-orange/20 hover:from-accent-red/30 hover:to-accent-orange/30 border border-accent-red/50 hover:border-accent-red rounded-2xl p-8 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4">🎤</div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-red transition-colors">
              Record Song
            </h3>
            <p className="text-gray-400 text-sm">
              Sing and record your music
            </p>
          </motion.div>
        </Link>
      </motion.section>

      {/* Content Tabs */}
      <motion.section
        variants={itemVariants}
        className="space-y-6"
      >
        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10">
          {[
            { id: 'podcasts', label: 'Podcasts', icon: '🎙️', count: myPodcasts.length },
            { id: 'songs', label: 'Songs', icon: '🎵', count: mySongs.length },
            { id: 'albums', label: 'Albums', icon: '💿', count: myAlbums.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-dark shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activeTab === tab.id ? 'bg-dark-lighter text-white' : 'bg-white/20 text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'podcasts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🎙️</span>
                My Podcasts
              </h2>
              <Link
                to="/artist/podcasts"
                className="px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 transition-all"
              >
                Record Podcast
              </Link>
            </div>

            {loadingPodcasts ? (
              <div className="flex justify-center py-12">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                    />
                  ))}
                </div>
              </div>
            ) : myPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPodcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast._id}
                    variants={itemVariants}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Link to={`/artist/podcasts/${podcast._id}`}>
                      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-accent-purple/50 transition-all duration-300">
                        {/* Cover Image */}
                        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-accent-purple/20 to-accent-blue/20">
                          {podcast.coverImage ? (
                            <img src={podcast.coverImage} alt={podcast.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-6xl">🎙️</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4 space-y-2">
                          <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-accent-purple transition-colors">
                            {podcast.title}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {podcast.episodeCount || 0} episodes
                          </p>
                          <div className="flex gap-2 pt-2">
                            <button className="flex-1 px-3 py-1.5 text-xs bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple rounded transition-colors">
                              Edit
                            </button>
                            <button className="flex-1 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
                              Episodes
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-gray-400">No podcasts yet</p>
                <Link
                  to="/artist/podcasts"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 transition-all"
                >
                  Create your first podcast
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'songs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🎵</span>
                My Songs
              </h2>
              <Link
                to="/artist/songs/new"
                className="px-4 py-2 bg-gradient-to-r from-accent-orange to-accent-red text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-orange/40 transition-all"
              >
                Upload Song
              </Link>
            </div>

            {loadingSongs ? (
              <div className="flex justify-center py-12">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-orange to-accent-red"
                    />
                  ))}
                </div>
              </div>
            ) : mySongs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySongs.map((song, index) => (
                  <motion.div
                    key={song._id}
                    variants={itemVariants}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-accent-orange/50 transition-all duration-300">
                      {/* Cover Image */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent-orange/20 to-accent-red/20">
                        {song.coverImage ? (
                          <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">🎵</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-accent-orange transition-colors">
                          {song.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {song.duration || '0:00'}
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button className="flex-1 px-3 py-1.5 text-xs bg-accent-orange/20 hover:bg-accent-orange/30 text-accent-orange rounded transition-colors">
                            Edit
                          </button>
                          <button className="flex-1 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
                            Play
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-gray-400">No songs yet</p>
                <Link
                  to="/artist/songs/new"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-accent-orange to-accent-red text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-orange/40 transition-all"
                >
                  Upload your first song
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">💿</span>
                My Albums
              </h2>
              <button className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-blue/40 transition-all">
                Create Album
              </button>
            </div>

            {loadingAlbums ? (
              <div className="flex justify-center py-12">
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
                    />
                  ))}
                </div>
              </div>
            ) : myAlbums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myAlbums.map((album, index) => (
                  <motion.div
                    key={album._id}
                    variants={itemVariants}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-accent-blue/50 transition-all duration-300">
                      {/* Cover Image */}
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent-blue/20 to-accent-purple/20">
                        {album.coverImage ? (
                          <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">💿</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-accent-blue transition-colors">
                          {album.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {album.songCount || 0} songs
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button className="flex-1 px-3 py-1.5 text-xs bg-accent-blue/20 hover:bg-accent-blue/30 text-accent-blue rounded transition-colors">
                            Edit
                          </button>
                          <button className="flex-1 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-gray-400">No albums yet</p>
                <button className="inline-block px-6 py-2 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-blue/40 transition-all">
                  Create your first album
                </button>
              </div>
            )}
          </div>
        )}
      </motion.section>

      {/* My Songs */}
      <motion.section
        variants={itemVariants}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🎵</span>
            My Songs
          </h2>
          <span className="text-sm text-gray-400 font-medium">
            {mySongs.length} song{mySongs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loadingSongs ? (
          <div className="flex justify-center py-12">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-orange to-accent-red"
                />
              ))}
            </div>
          </div>
        ) : mySongs.length > 0 ? (
          <div className="space-y-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden">
            {mySongs.slice(0, 5).map((song, index) => (
              <motion.div
                key={song._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 hover:bg-white/5 rounded transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white line-clamp-1 group-hover:text-accent-orange transition-colors">
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-500">{song.artist}</p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded transition-colors ml-4">
                  Edit
                </button>
              </motion.div>
            ))}
            {mySongs.length > 5 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{mySongs.length - 5} more songs
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <p className="text-gray-400">No songs uploaded yet</p>
            <Link
              to="/artist/songs/new"
              className="inline-block px-6 py-2 bg-gradient-to-r from-accent-orange to-accent-red text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all"
            >
              Upload your first song
            </Link>
          </div>
        )}
      </motion.section>

      {/* Analytics Preview */}
      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400 mt-2">Total Listens</p>
        </div>
        <div className="bg-gradient-to-br from-accent-orange/20 to-accent-red/20 border border-accent-orange/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400 mt-2">Followers</p>
        </div>
        <div className="bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-2xl p-6 text-center">
          <p className="text-3xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400 mt-2">Published Content</p>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default ArtistDashboard;
