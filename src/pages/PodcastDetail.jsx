import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/utils/axios';
import PodcastEpisodeRow from '@/components/common/PodcastEpisodeRow';



const PodcastDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [podcast, setPodcast] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPodcastAndEpisodes = async () => {
      try {
        setLoading(true);

        // Fetch podcast details
        const podcastRes = await api.get(`/api/v1/podcasts/${id}`);
        setPodcast(podcastRes.data.data);
        console.log('📻 Fetched podcast:', podcastRes.data);

        // Fetch episodes
        const episodesRes = await api.get(`/api/v1/podcasts/${id}/episodes`);
        setEpisodes(episodesRes.data.data || []);
        console.log('📼 Fetched episodes:', episodesRes.data);
      } catch (err) {
        console.error('❌ Failed to fetch podcast details:', err);
        setError('Failed to load podcast details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPodcastAndEpisodes();
    }
  }, [id]);

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
          <p className="text-gray-400">Loading podcast...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !podcast) {
    return (
      <motion.div
        className="text-center py-16 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-gray-400 text-lg">{error || 'Podcast not found'}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/podcasts')}
          className="px-6 py-2 bg-gradient-to-r from-accent-blue to-accent-purple text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-blue/40 transition-all"
        >
          Back to Podcasts
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Podcast Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-strong border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 opacity-60" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Podcast Cover */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-accent-blue/20">
              {podcast.coverImage ? (
                <img
                  src={podcast.coverImage}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-blue/30 to-accent-purple/30">
                  <span className="text-8xl">🎙️</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Podcast Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-4"
          >
            <div>
              <p className="text-accent-blue text-sm font-semibold uppercase tracking-wider">
                Podcast
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mt-2">
                {podcast.title}
              </h1>
            </div>

            {/* Host */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎤</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Hosted by</p>
                <p className="text-lg font-semibold text-white">{podcast.host || podcast.artist?.name || 'Unknown'}</p>
              </div>
            </div>

            {/* Description */}
            {podcast.description && (
              <p className="text-gray-300 leading-relaxed">
                {podcast.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-accent-blue">
                  {podcast.episodeCount || 0}
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Episode{podcast.episodeCount !== 1 ? 's' : ''}
                </p>
              </div>
              {podcast.categories && podcast.categories.length > 0 && (
                <div>
                  <p className="text-lg font-semibold text-white">
                    {podcast.categories.join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Categor{podcast.categories.length !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Episodes Section */}
      {episodes.length > 0 ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-4xl">📼</span>
              <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                Episodes
              </span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium">
              {episodes.length} episode{episodes.length !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="space-y-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden">
            {episodes.map((episode, index) => (
              <PodcastEpisodeRow
                key={episode._id}
                episode={episode}
                podcast={podcast}
                index={index}
              />
            ))}
          </div>
        </motion.section>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-4"
        >
          <p className="text-gray-400 text-lg">No episodes available</p>
          <p className="text-gray-500 text-sm">New episodes coming soon</p>
        </motion.div>
      )}

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/podcasts')}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-blue/50 text-white font-semibold rounded-lg transition-all duration-200"
        >
          ← Back to Podcasts
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default PodcastDetail;
