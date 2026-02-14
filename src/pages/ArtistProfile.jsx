import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/utils/axios';
import PodcastCard from '@/components/common/PodcastCard';
import SongCard from '@/components/common/SongCard';



const ArtistProfile = () => {
  const { artistName } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('songs');

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);

        // Fetch artist profile
        const artistResponse = await api.get(`/api/v1/artists/${artistName}`);
        setArtist(artistResponse.data.data);

        // Fetch artist's songs
        const songsResponse = await api.get(`/api/v1/artists/${artistName}/songs`);
        setSongs(songsResponse.data.data || []);

        // Fetch artist's podcasts
        const podcastsResponse = await api.get(`/api/v1/artists/${artistName}/podcasts`);
        setPodcasts(podcastsResponse.data.data || []);

      } catch (err) {
        console.error('❌ Failed to fetch artist data:', err);
        setError('Failed to load artist profile');
      } finally {
        setLoading(false);
      }
    };

    if (artistName) {
      fetchArtistData();
    }
  }, [artistName]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
              />
            ))}
          </div>
          <p className="text-gray-400">Loading artist profile...</p>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
        <p className="text-red-400 font-semibold">{error || 'Artist not found'}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Artist Header */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-strong border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-accent-blue/20 to-dark/20 opacity-60" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Artist Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-accent-purple to-accent-blue rounded-full flex items-center justify-center text-6xl">
              {artist.avatar ? (
                <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                artist.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Artist Info */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              {artist.name}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <p className="text-gray-300 text-lg">
                {artist.bio || 'Artist on US Music'}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
                <span>{songs.length} song{songs.length !== 1 ? 's' : ''}</span>
                <span>{podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''}</span>
                <span>{artist.followers || 0} followers</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Content Tabs */}
      <motion.section variants={itemVariants}>
        <div className="flex border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'songs'
                ? 'text-accent-orange border-b-2 border-accent-orange'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            🎵 Songs ({songs.length})
          </button>
          <button
            onClick={() => setActiveTab('podcasts')}
            className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'podcasts'
                ? 'text-accent-blue border-b-2 border-accent-blue'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            🎙️ Podcasts ({podcasts.length})
          </button>
        </div>

        {/* Songs Tab */}
        {activeTab === 'songs' && (
          <div>
            {songs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {songs.map((song, index) => (
                  <motion.div
                    key={song._id}
                    variants={itemVariants}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SongCard song={song} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <span className="text-6xl">🎵</span>
                <p className="text-gray-400 text-lg">No songs yet</p>
                <p className="text-gray-500 text-sm">Check back soon for new music</p>
              </div>
            )}
          </div>
        )}

        {/* Podcasts Tab */}
        {activeTab === 'podcasts' && (
          <div>
            {podcasts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {podcasts.map((podcast, index) => (
                  <motion.div
                    key={podcast._id}
                    variants={itemVariants}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PodcastCard podcast={podcast} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <span className="text-6xl">🎙️</span>
                <p className="text-gray-400 text-lg">No podcasts yet</p>
                <p className="text-gray-500 text-sm">Check back soon for new episodes</p>
              </div>
            )}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default ArtistProfile;