import { motion } from 'framer-motion';
import { usePlayer } from '@/context/PlayerContext';
import SongList from '@/components/common/SongList';

const Favourites = () => {
  // TODO: Implement favorites in PlayerContext
  const favorites = [];
  // const { favorites } = usePlayer();

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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
          <motion.span 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-4xl"
          >
            ❤️
          </motion.span>
          <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">Favourites</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium">
          {favorites.length} {favorites.length === 1 ? 'song' : 'songs'} you love
        </p>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        variants={itemVariants}
        className="glass-strong rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-red/10 to-accent-orange/10 opacity-60" />
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 rounded-xl glass hover:glass-strong transition-all cursor-default"
          >
            <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
              {favorites.length}
            </div>
            <div className="text-xs md:text-sm text-gray-400 font-medium">Total Tracks</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 rounded-xl glass hover:glass-strong transition-all cursor-default"
          >
            <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
              {Math.floor(favorites.length * 3.5)}
            </div>
            <div className="text-xs md:text-sm text-gray-400 font-medium">Minutes</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 rounded-xl glass hover:glass-strong transition-all cursor-default"
          >
            <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
              {new Set(favorites.map(s => s.artist)).size}
            </div>
            <div className="text-xs md:text-sm text-gray-400 font-medium">Artists</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 rounded-xl glass hover:glass-strong transition-all cursor-default"
          >
            <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
              {new Set(favorites.map(s => s.genre)).size}
            </div>
            <div className="text-xs md:text-sm text-gray-400 font-medium">Genres</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Favourites List */}
      <motion.section variants={itemVariants} className="space-y-4">
        {favorites.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Collection</h2>
              <button
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Sort options"
              >
                Sort by: Recent ▾
              </button>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/10">
              <SongList songs={favorites} showHeader={true} />
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-12 border border-white/10 text-center"
          >
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-2xl font-bold text-white mb-2">No favourites yet</h3>
            <p className="text-gray-400 mb-6">
              Start building your collection by clicking the ❤️ icon on songs you love
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white font-semibold rounded-full hover:shadow-lg hover:shadow-accent-orange/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              Explore Music
            </button>
          </motion.div>
        )}
      </motion.section>

      {/* Quick Actions */}
      {favorites.length > 0 && (
        <motion.div variants={itemVariants} className="flex gap-4 flex-wrap">
          <button
            className="px-6 py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white font-semibold rounded-full hover:shadow-lg hover:shadow-accent-orange/30 transition-all duration-300 hover:-translate-y-0.5"
            aria-label="Play all favourites"
          >
            ▶️ Play All
          </button>
          <button
            className="px-6 py-3 glass-strong text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 border border-white/10"
            aria-label="Shuffle favourites"
          >
            🔀 Shuffle
          </button>
          <button
            className="px-6 py-3 glass-strong text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 border border-white/10"
            aria-label="Create playlist from favourites"
          >
            ➕ Create Playlist
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Favourites;
