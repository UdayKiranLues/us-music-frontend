import { motion } from 'framer-motion';
import { getImageUrl } from '@/utils/imageUrl';
import { usePlayer } from '@/context/PlayerContext';
import { playlists, songs } from '@/data/mockData';
import SongCard from '@/components/common/SongCard';
import SongList from '@/components/common/SongList';

const Library = () => {
  // TODO: Implement favorites in PlayerContext
  const favorites = [];
  // const { favorites } = usePlayer();

  const likedSongs = favorites;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
          <span className="text-4xl">📚</span>
          <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">Your Library</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium">All your playlists and favorite songs</p>
      </div>

      {/* Liked Songs */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-strong rounded-3xl p-8 border border-white/10 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-red/20 to-accent-orange/20 opacity-60" />
          <div className="relative z-10 flex items-center gap-6 mb-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-red via-accent-orange to-accent-orange flex items-center justify-center text-4xl shadow-2xl shadow-accent-orange/40 animate-glow"
            >
              ❤️
            </motion.div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-1 flex items-center gap-2">
                Liked Songs
              </h2>
              <p className="text-gray-300 font-medium">{likedSongs.length} songs</p>
            </div>
          </div>
        </div>

        {likedSongs.length > 0 ? (
          <div className="bg-dark-lighter/30 backdrop-blur-sm rounded-xl p-4 border border-white/5">
            <SongList songs={likedSongs} showIndex={true} />
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-2xl border border-white/5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl mb-4"
            >
              💔
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">No liked songs yet</h3>
            <p className="text-gray-400 mb-6">Start liking songs to see them here</p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-accent-orange to-accent-red text-white font-semibold shadow-lg shadow-accent-orange/30"
            >
              Discover Music
            </motion.a>
          </div>
        )}
      </motion.section>

      {/* Playlists */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">📝 Your Playlists</h2>
          <p className="text-gray-400">Curated collections of your favorite tracks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, index) => {
            const playlistSongs = songs.filter(song => playlist.songs.includes(song.id));

            return (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-dark-lighter/50 backdrop-blur-sm rounded-xl p-6 border border-white/5 hover:border-accent-orange/30 transition-all cursor-pointer"
              >
                <img
                  src={getImageUrl(playlist.coverUrl)}
                  alt={playlist.name}
                  className="w-full aspect-square object-cover rounded-lg mb-4 shadow-lg"
                />
                <h3 className="text-xl font-bold text-white mb-2">{playlist.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{playlist.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{playlistSongs.length} songs</span>
                  {playlistSongs.length > 0 && (
                    <button className="text-accent-orange hover:text-accent-red transition-colors font-medium">
                      Play →
                    </button>
                  )}
                </div>

                {/* Preview songs */}
                {playlistSongs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    {playlistSongs.slice(0, 3).map(song => (
                      <div key={song.id} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">♪</span>
                        <span className="text-gray-300 truncate">{song.title}</span>
                      </div>
                    ))}
                    {playlistSongs.length > 3 && (
                      <p className="text-xs text-gray-500">+{playlistSongs.length - 3} more</p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-accent-blue/20 to-accent-blue/10 backdrop-blur-sm rounded-xl p-6 border border-accent-blue/20">
          <div className="text-3xl mb-2">🎵</div>
          <div className="text-2xl font-bold text-white mb-1">{songs.length}</div>
          <div className="text-sm text-gray-400">Total Songs</div>
        </div>
        <div className="bg-gradient-to-br from-accent-orange/20 to-accent-orange/10 backdrop-blur-sm rounded-xl p-6 border border-accent-orange/20">
          <div className="text-3xl mb-2">❤️</div>
          <div className="text-2xl font-bold text-white mb-1">{likedSongs.length}</div>
          <div className="text-sm text-gray-400">Liked Songs</div>
        </div>
        <div className="bg-gradient-to-br from-accent-red/20 to-accent-red/10 backdrop-blur-sm rounded-xl p-6 border border-accent-red/20">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-white mb-1">{playlists.length}</div>
          <div className="text-sm text-gray-400">Playlists</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="text-3xl mb-2">🎸</div>
          <div className="text-2xl font-bold text-white mb-1">12</div>
          <div className="text-sm text-gray-400">Artists</div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Library;
