import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import SongCard from '@/components/common/SongCard';
import SongList from '@/components/common/SongList';

const API_URL = import.meta.env.VITE_API_URL || 'https://us-music-backend.vercel.app';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/songs`);
        console.log('📥 Home: Fetched songs:', response.data);
        setSongs(response.data.data || []);
      } catch (error) {
        console.error('❌ Home: Failed to fetch songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const trendingSongs = songs.filter(song => song.totalPlays > 0).slice(0, 10);
  const recommendedSongs = songs.slice(0, 10);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-strong border border-white/10 hover:border-accent-orange/30 transition-all duration-500 shimmer">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 via-accent-orange/20 to-accent-red/20 opacity-60" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Welcome to <span className="bg-gradient-to-r from-accent-orange to-accent-red bg-clip-text text-transparent">US Music</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg md:text-xl mb-6"
          >
            Discover unlimited music streaming with premium quality
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-accent-orange via-accent-red to-accent-red text-white font-bold shadow-2xl shadow-accent-orange/40 hover:shadow-accent-orange/60 transition-all duration-300 text-base animate-glow"
          >
            Explore Now
          </motion.button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-red/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Trending Songs */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-4xl animate-pulse-slow">🔥</span>
              <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">Trending Now</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">Most popular tracks this week</p>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading songs...</div>
        ) : trendingSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {trendingSongs.map(song => (
              <SongCard key={song._id} song={song} playlist={trendingSongs} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No trending songs available</div>
        )}
      </motion.section>

      {/* Recommended Songs */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">✨ Recommended for You</h2>
            <p className="text-gray-400">Handpicked based on your taste</p>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading songs...</div>
        ) : recommendedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recommendedSongs.map(song => (
              <SongCard key={song._id} song={song} playlist={recommendedSongs} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No songs available. Upload some songs to get started!</div>
        )}
      </motion.section>

      {/* All Songs */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">🎵 All Songs</h2>
            <p className="text-gray-400">Browse the complete collection</p>
          </div>
        </div>
        <div className="bg-dark-lighter/30 backdrop-blur-sm rounded-xl p-4 border border-white/5">
          <SongList songs={songs} showIndex={true} />
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Home;
