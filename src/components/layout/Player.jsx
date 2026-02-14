import { usePlayer } from '@/context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '@/utils/imageUrl';

const Player = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    // isShuffle,
    // repeatMode,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    changeVolume,
    // toggleFavorite,
    // isFavorite,
    // toggleShuffle,
    // cycleRepeatMode,
  } = usePlayer();
  // TODO: Add shuffle, repeat, favorite when implemented in PlayerContext

  if (!currentSong) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100 || 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  };

  const handleVolumeChange = (e) => {
    changeVolume(parseFloat(e.target.value));
  };

  /* TODO: Re-enable when repeat mode is implemented
  const getRepeatIcon = () => {
    if (repeatMode === 'one') {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
      </svg>
    );
  };
  */

  const getVolumeIcon = () => {
    if (volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 shadow-2xl"
        role="region"
        aria-label="Music player controls"
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          {/* Progress Bar - Enhanced with better hover state */}
          <div
            className="w-full h-2 bg-white/10 rounded-full cursor-pointer mb-4 relative group hover:h-2.5 transition-all duration-200"
            onClick={handleProgressClick}
            role="progressbar"
            aria-label="Song progress"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-accent-orange via-accent-red to-accent-red rounded-full relative"
              style={{ width: `${progressPercentage}%` }}
              initial={false}
              animate={{ width: `${progressPercentage}%` }}
            >
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-accent-orange/50 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.2 }}
              />
            </motion.div>
          </div>

          <div className="flex items-center justify-between gap-6">
            {/* Song Info - Enhanced */}
            <div className="flex items-center gap-4 min-w-0 flex-1 max-w-sm">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative flex-shrink-0"
              >
                <img
                  src={getImageUrl(currentSong.coverUrl)}
                  alt={`${currentSong.title} album cover`}
                  className="w-16 h-16 rounded-xl object-cover shadow-xl"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-accent-orange/20 to-accent-red/20" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-base truncate mb-1">
                  {currentSong.title}
                </h3>
                <p className="text-gray-400 text-sm truncate font-medium">
                  {currentSong.artist}
                </p>
              </div>
              {/* TODO: Re-enable favorite button when implemented in PlayerContext
              <motion.button
                onClick={() => toggleFavorite(currentSong)}
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                className="text-2xl flex-shrink-0"
                aria-label={isFavorite(currentSong.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite(currentSong.id) ? '❤️' : '🤍'}
              </motion.button>
              */}
            </div>

            {/* Controls - Enhanced */}
            <div className="flex flex-col items-center gap-3 flex-1 max-w-xl">
              <div className="flex items-center gap-5">
                {/* TODO: Re-enable Shuffle when implemented
                <motion.button
                  onClick={toggleShuffle}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-full transition-all ${
                    isShuffle 
                      ? 'bg-accent-orange/20 text-accent-orange' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label={`Shuffle ${isShuffle ? 'on' : 'off'}`}
                  title="Shuffle"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                  </svg>
                </motion.button>
                */}

                {/* Previous */}
                <motion.button
                  onClick={playPrevious}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-300 hover:text-white transition-colors p-2"
                  aria-label="Previous song"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </motion.button>

                {/* Play/Pause - Enhanced */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlayPause}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-accent-orange to-accent-red flex items-center justify-center text-white shadow-2xl shadow-accent-orange/40 hover:shadow-accent-orange/60 transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <AnimatePresence mode="wait">
                    {isPlaying ? (
                      <motion.svg
                        key="pause"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-7 h-7"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                      </motion.svg>
                    ) : (
                      <motion.svg
                        key="play"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-7 h-7 ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Next */}
                <motion.button
                  onClick={playNext}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-300 hover:text-white transition-colors p-2"
                  aria-label="Next song"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 18h2V6h-2zm-11-7l8.5-6v12z" />
                  </svg>
                </motion.button>

                {/* TODO: Re-enable Repeat when implemented
                <motion.button
                  onClick={cycleRepeatMode}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-full transition-all ${
                    repeatMode !== 'off' 
                      ? 'bg-accent-orange/20 text-accent-orange' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label={`Repeat: ${repeatMode}`}
                  title={`Repeat: ${repeatMode}`}
                >
                  {getRepeatIcon()}
                </motion.button>
                */}
              </div>

              {/* Time display */}
              <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold w-full">
                <span className="min-w-[40px] text-right">{formatTime(currentTime)}</span>
                <div className="flex-1" />
                <span className="min-w-[40px]">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume - Enhanced */}
            <div className="hidden md:flex items-center gap-4 flex-1 justify-end max-w-xs">
              <span className="text-2xl">{getVolumeIcon()}</span>
              <div className="relative w-28 group">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full"
                  aria-label="Volume control"
                  aria-valuenow={Math.round(volume * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuetext={`${Math.round(volume * 100)}% volume`}
                />
              </div>
              <span className="text-xs text-gray-400 font-semibold min-w-[35px]">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Player;
