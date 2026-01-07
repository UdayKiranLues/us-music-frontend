import { motion } from 'framer-motion';
import { usePlayer } from '@/context/PlayerContext';
import { memo } from 'react';

const SongCard = memo(({ song, playlist = [], index = 0 }) => {
  const { playSong, currentSong, isPlaying, replaceQueue } = usePlayer();

  const isCurrentSong = currentSong?._id === song._id;

  const handlePlay = () => {
    if (isCurrentSong) {
      return;
    }
    const songIndex = playlist.findIndex(s => s._id === song._id);
    replaceQueue(playlist, songIndex >= 0 ? songIndex : 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative glass hover-lift rounded-2xl p-4 border border-white/5 hover:border-accent-orange/30 cursor-pointer"
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      aria-label={`Play ${song.title} by ${song.artist}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlay();
        }
      }}
    >
      {/* Badges */}
      {(song.trending || song.recommended) && (
        <div className="absolute top-2 left-2 z-10 flex gap-1.5">
          {song.trending && (
            <span className="badge badge-orange text-[10px] backdrop-blur-md">
              🔥 Trending
            </span>
          )}
          {song.recommended && (
            <span className="badge badge-blue text-[10px] backdrop-blur-md">
              ⭐ Recommended
            </span>
          )}
        </div>
      )}

      {/* Cover Image with enhanced overlay */}
      <div className="relative mb-4 overflow-hidden rounded-xl shadow-lg">
        <img
          src={song.coverImageUrl || 'https://via.placeholder.com/300'}
          alt={`${song.title} album cover`}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-accent-orange to-accent-red flex items-center justify-center shadow-2xl shadow-accent-orange/60 animate-glow"
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
            aria-label={`Play ${song.title}`}
          >
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Currently Playing Indicator - Enhanced */}
        {isCurrentSong && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-3 right-3 bg-gradient-to-r from-accent-orange to-accent-red backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-white font-bold">Now Playing</span>
              {isPlaying && (
                <div className="flex items-center gap-0.5">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['4px', '14px', '4px'] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay }}
                      className="w-0.5 bg-white rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Song Info - Enhanced typography */}
      <div className="space-y-2">
        <h3 className="text-white font-bold text-base truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-accent-orange group-hover:to-accent-red group-hover:bg-clip-text transition-all duration-300">
          {song.title}
        </h3>
        <p className="text-gray-400 text-sm truncate font-medium">{song.artist}</p>
        
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="badge text-[10px] bg-white/5 text-gray-400 border-white/10">
              {Array.isArray(song.genre) ? song.genre[0] : song.genre}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Additional metadata */}
        {(song.mood || song.bpm) && (
          <div className="flex items-center gap-1.5 pt-1">
            {song.mood && (
              <>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  {Array.isArray(song.mood) ? song.mood[0] : song.mood}
                </span>
              </>
            )}
            {song.mood && song.bpm && <span className="text-gray-600">•</span>}
            {song.bpm && (
              <span className="text-[10px] text-gray-500 font-semibold">
                {song.bpm} BPM
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

SongCard.displayName = 'SongCard';

export default SongCard;
