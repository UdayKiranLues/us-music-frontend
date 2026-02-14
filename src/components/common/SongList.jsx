import { motion } from 'framer-motion';
import { usePlayer } from '@/context/PlayerContext';
import { memo, useMemo } from 'react';
import { useSongCoverUrl } from '@/hooks/useSongCoverUrl';

const SongList = memo(({ songs, showIndex = false }) => {
  const { playSong, currentSong, isPlaying, replaceQueue } = usePlayer();
  // TODO: Add toggleFavorite, isFavorite when implemented in PlayerContext

  const handlePlay = (song) => {
    const songIndex = songs.findIndex(s => (s._id || s.id) === (song._id || song.id));
    replaceQueue(songs, songIndex >= 0 ? songIndex : 0);
  };

  return (
    <div className="space-y-1.5">
      {songs.map((song, index) => (
        <SongListItem
          key={song._id || song.id}
          song={song}
          index={index}
          isCurrentSong={currentSong?._id === song._id || currentSong?.id === song.id}
          isPlaying={isPlaying}
          showIndex={showIndex}
          onPlay={handlePlay}
        />
      ))}
    </div>
  );
});

const SongListItem = memo(({ song, index, isCurrentSong, isPlaying, showIndex, onPlay }) => {
  const { coverUrl } = useSongCoverUrl(song._id || song.id);

  const displayCoverUrl = useMemo(() => {
    return getImageUrl(coverUrl || song.coverUrl) || 'https://via.placeholder.com/100';
  }, [coverUrl, song.coverUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.3 }}
      whileHover={{ x: 6, scale: 1.01 }}
      className={`group relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${isCurrentSong
        ? 'glass-strong shadow-lg shadow-accent-orange/10 border border-accent-orange/30'
        : 'glass hover-lift border border-white/5'
        }`}
      onClick={() => onPlay(song)}
      role="button"
      tabIndex={0}
      aria-label={`Play ${song.title} by ${song.artist}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay(song);
        }
      }}
    >
      {/* Active indicator bar */}
      {isCurrentSong && (
        <motion.div
          layoutId="activeSong"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-accent-orange to-accent-red rounded-r-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {/* Index or Play Button */}
      <div className="w-10 flex items-center justify-center">
        {isCurrentSong && isPlaying ? (
          <div className="flex items-center gap-0.5">
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ height: ['8px', '18px', '8px'] }}
                transition={{ repeat: Infinity, duration: 0.8, delay }}
                className="w-1 bg-gradient-to-t from-accent-orange to-accent-red rounded-full"
              />
            ))}
          </div>
        ) : (
          <>
            {showIndex && (
              <span className="text-gray-500 text-sm font-semibold group-hover:hidden">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`${showIndex ? 'hidden group-hover:flex' : 'flex'} items-center justify-center w-8 h-8 rounded-full bg-accent-orange/20 text-white`}
            >
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
          </>
        )}
      </div>

      {/* Cover Image - Enhanced */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative flex-shrink-0"
      >
        <img
          src={displayCoverUrl}
          alt={`${song.title} album cover`}
          className="w-14 h-14 rounded-lg object-cover shadow-lg"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== 'https://via.placeholder.com/100') {
              e.target.src = 'https://via.placeholder.com/100';
            }
          }}
        />
        {isCurrentSong && (
          <div className="absolute inset-0 bg-gradient-to-tr from-accent-orange/30 to-accent-red/30 rounded-lg" />
        )}
      </motion.div>

      {/* Song Info - Enhanced typography */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-[15px] truncate mb-0.5 transition-colors ${isCurrentSong
          ? 'bg-gradient-to-r from-accent-orange to-accent-red bg-clip-text text-transparent'
          : 'text-white group-hover:text-accent-orange'
          }`}>
          {song.title}
        </h4>
        <p className="text-gray-400 text-sm truncate font-medium">{song.artist}</p>
      </div>

      {/* Album - Responsive */}
      <div className="hidden md:block flex-1 min-w-0 max-w-[200px]">
        <p className="text-gray-400 text-sm truncate font-medium">{song.album}</p>
      </div>

      {/* Metadata badges - Responsive */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="badge text-[11px] bg-white/5 text-gray-400 border-white/10">
          {song.genre}
        </span>
        {song.mood && (
          <span className="badge text-[10px] bg-accent-blue/10 text-accent-blue border-accent-blue/20">
            {song.mood}
          </span>
        )}
      </div>

      {/* Duration & Actions */}
      <div className="flex items-center gap-4">
        {/* TODO: Re-enable favorite button when implemented in PlayerContext
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song);
          }}
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          className={`text-xl transition-all duration-200 ${
            isFavorite(song.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          aria-label={isFavorite(song.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite(song.id) ? '❤️' : '🤍'}
        </motion.button>
        */}

        <span className="text-gray-500 text-sm font-semibold min-w-[45px] text-right">
          {song.duration}
        </span>

        {/* More options button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full"
          onClick={(e) => e.stopPropagation()}
          aria-label="More options"
        >
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
});
SongListItem.displayName = 'SongListItem';


SongList.displayName = 'SongList';

export default SongList;
