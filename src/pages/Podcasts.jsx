import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/utils/axios';
import PodcastCard from '@/components/common/PodcastCard';



const PodcastHome = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/podcasts`);
        console.log('📻 Fetched podcasts:', response.data);
        setPodcasts(response.data.data || []);
      } catch (err) {
        console.error('❌ Failed to fetch podcasts:', err);
        setError('Failed to load podcasts');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
      {/* Hero Section */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-strong border border-white/10 hover:border-accent-blue/30 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 via-accent-purple/20 to-dark/20 opacity-60" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Discover <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">Podcasts</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg md:text-xl mb-6"
          >
            Listen to the best podcasts, interviews, and stories
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Loading State */}
      {loading && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center py-16"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
                />
              ))}
            </div>
            <p className="text-gray-400">Loading podcasts...</p>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center"
        >
          <p className="text-red-400 font-semibold">{error}</p>
          <p className="text-gray-400 text-sm mt-2">Try refreshing the page</p>
        </motion.div>
      )}

      {/* Podcasts Grid */}
      {!loading && podcasts.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-4xl">🎙️</span>
              <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                All Podcasts
              </span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">
              {podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''} available
            </p>
          </div>

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
        </motion.section>
      )}

      {/* Empty State */}
      {!loading && podcasts.length === 0 && !error && (
        <motion.div
          variants={itemVariants}
          className="text-center py-16 space-y-4"
        >
          <span className="text-6xl">🎙️</span>
          <p className="text-gray-400 text-lg">No podcasts available yet</p>
          <p className="text-gray-500 text-sm">Check back soon for new podcasts</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PodcastHome;
