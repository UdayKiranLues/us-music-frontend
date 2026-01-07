import { motion } from 'framer-motion';
import { usePlayer } from '@/context/PlayerContext';
import SongList from '@/components/common/SongList';

const History = () => {
  // TODO: Implement history in PlayerContext
  const history = [];
  // const { history } = usePlayer();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
          <span className="text-4xl">🕐</span>
          <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">Listening History</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium">Recently played tracks</p>
      </div>

      {/* Stats Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-3xl p-8 border border-white/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 via-accent-orange/20 to-accent-red/20 opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Music Journey</h2>
            <p className="text-gray-300 font-medium">
              You've played <span className="text-accent-orange font-bold text-xl">{history.length}</span> {history.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
          {history.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl mb-1">🎧</div>
                <div className="text-xs text-gray-400">Listening</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">🔥</div>
                <div className="text-xs text-gray-400">Trending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-1">⭐</div>
                <div className="text-xs text-gray-400">Premium</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* History List */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {history.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Recent Plays</h2>
              <button className="text-sm text-gray-400 hover:text-accent-orange transition-colors">
                Clear History
              </button>
            </div>
            <div className="bg-dark-lighter/30 backdrop-blur-sm rounded-xl p-4 border border-white/5">
              <SongList songs={history} showIndex={false} />
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-dark-lighter/30 backdrop-blur-sm rounded-xl border border-white/5">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold text-white mb-2">No listening history yet</h3>
            <p className="text-gray-400 mb-6">Start playing songs to see them here</p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-accent-orange to-accent-red text-white font-semibold shadow-lg shadow-accent-orange/30"
            >
              Explore Music
            </motion.a>
          </div>
        )}
      </motion.section>

      {/* Recently Played Genres */}
      {history.length > 0 && (
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Your Top Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from(new Set(history.map(song => song.genre))).slice(0, 4).map((genre, index) => {
              const count = history.filter(song => song.genre === genre).length;
              return (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-dark-lighter/50 backdrop-blur-sm rounded-xl p-6 border border-white/5 hover:border-accent-orange/30 transition-all text-center cursor-pointer"
                >
                  <div className="text-3xl mb-2">🎸</div>
                  <h3 className="text-lg font-bold text-white mb-1">{genre}</h3>
                  <p className="text-sm text-gray-400">{count} {count === 1 ? 'play' : 'plays'}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};

export default History;
