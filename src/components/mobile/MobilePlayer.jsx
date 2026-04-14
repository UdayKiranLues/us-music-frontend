import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Share2,
  ChevronDown,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  ListMusic,
  MoreVertical,
} from 'lucide-react';
import { mobile, colors, glassmorphism } from '../../styles/designTokens';
import { useSongCoverUrl } from '@/hooks/useSongCoverUrl';
import { getImageUrl } from '@/utils/imageUrl';

/**
 * Mobile Full-Screen Player
 * Modern Spotify-style player with improved layout, controls, and interactivity
 */
export default function MobilePlayer({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  currentTime = 0,
  duration = 0,
  volume = 0.7,
  onSeek,
  onSeekBackward,
  onSeekForward,
  onVolumeChange,
  onToggleFavorite,
  isFavorite = false,
}) {
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // off, one, all
  const [showQueue, setShowQueue] = useState(false);
  
  const { coverUrl } = useSongCoverUrl(currentSong?._id, currentSong?.coverImageUrl || currentSong?.coverImage || currentSong?.coverUrl);

  const displayCoverUrl = useMemo(() => {
    return getImageUrl(coverUrl || currentSong?.coverImageUrl || currentSong?.coverImage || currentSong?.coverUrl) || 'https://placehold.co/400';
  }, [coverUrl, currentSong?.coverImageUrl, currentSong?.coverImage, currentSong?.coverUrl]);


  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedDown: (event) => {
      if (event.velocity > 0.5 && !showQueue) {
        onClose();
      }
    },
    onSwipedLeft: (event) => {
      if (event.velocity > 0.5 && onNext && !showQueue) {
        onNext();
      }
    },
    onSwipedRight: (event) => {
      if (event.velocity > 0.5 && onPrevious && !showQueue) {
        onPrevious();
      }
    },
    onSwipedUp: (event) => {
      if (event.velocity > 0.5) {
        setShowQueue(true);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const safeDuration = duration || currentSong?.duration || 0;
  const progress = safeDuration > 0 ? (currentTime / safeDuration) * 100 : 0;

  // Handle repeat mode cycling
  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  if (!isOpen || !currentSong) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: isOpen ? 0 : '100%' }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[1050] bg-gradient-to-b from-neutral-900 via-neutral-950 to-black lg:hidden overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      {...swipeHandlers}
    >
      <div className="flex flex-col h-full">
        {/* HEADER - Minimal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label="Close player"
          >
            <ChevronDown size={28} strokeWidth={2} />
          </button>

          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">NOW PLAYING</span>

          <button
            className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label="More options"
          >
            <MoreVertical size={20} />
          </button>
        </div>

        {/* ALBUM ART - Large and centered */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-hidden">
          <motion.div
            className="relative w-full max-w-xs aspect-square rounded-3xl overflow-hidden shadow-2xl"
            drag="y"
            dragElastic={0.2}
            dragConstraints={{ top: 0, bottom: 100 }}
            onDragEnd={(event, info) => {
              if (info.velocity.y > 500) {
                onClose();
              }
            }}
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={displayCoverUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (e.target.src !== 'https://placehold.co/400') {
                  e.target.src = 'https://placehold.co/400';
                }
              }}
            />

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Pulse animation when playing */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 border-4 border-white/20 rounded-3xl"
                animate={{ 
                  boxShadow: [
                    'inset 0 0 0 0px rgba(255,255,255,0.3)',
                    'inset 0 0 0 20px rgba(255,255,255,0)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        </div>

        {/* SONG INFO - Clean typography */}
        <div className="px-6 pb-4 text-center">
          <h1 className="text-2xl font-bold text-white mb-2 line-clamp-2">
            {currentSong.title}
          </h1>
          <p className="text-sm text-neutral-400 line-clamp-1">
            {currentSong.artist}
          </p>
        </div>

        {/* PROGRESS BAR - Improved interactivity */}
        <div className="px-6 pb-4">
          <div 
            className="relative h-1.5 bg-neutral-800 rounded-full overflow-hidden cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              onSeek?.(percent * safeDuration);
            }}
          >
            {/* Background track */}
            <div className="absolute inset-0 bg-neutral-700/30 rounded-full" />
            
            {/* Progress fill */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
              style={{ width: `${progress}%` }}
              initial={false}
              animate={{ width: `${progress}%` }}
              layoutId="progress"
            />

            {/* Draggable thumb (hidden but functional) */}
            <input
              type="range"
              min="0"
              max={safeDuration || 1}
              value={Math.min(currentTime, safeDuration || currentTime || 0)}
              onChange={(e) => onSeek?.(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ zIndex: 10 }}
              aria-label="Seek slider"
            />

            {/* Visual feedback on hover */}
            <div className="absolute top-0 h-1.5 bg-white/20 rounded-full group-hover:opacity-100 opacity-0 transition-opacity pointer-events-none" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          {/* Time labels */}
          <div className="flex justify-between text-xs text-neutral-500 mt-2 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(safeDuration)}</span>
          </div>
        </div>

        {/* PRIMARY CONTROLS - Main playback controls */}
        <div className="flex items-center justify-between px-4 pb-6">
          {/* Shuffle */}
          <motion.button
            onClick={() => setShuffleMode(!shuffleMode)}
            className={`p-3 rounded-full transition-all ${ 
              shuffleMode 
                ? 'bg-primary-500/20 text-primary-400' 
                : 'text-neutral-400 hover:text-white'
            }`}
            whileTap={{ scale: 0.9 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label="Shuffle"
            title={shuffleMode ? 'Shuffle: On' : 'Shuffle: Off'}
          >
            <Shuffle size={22} />
          </motion.button>

          {/* Previous */}
          <motion.button
            onClick={onPrevious}
            className="p-3 text-white hover:scale-110 transition-transform"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.1 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label="Previous track"
          >
            <SkipBack size={28} fill="white" />
          </motion.button>

          {/* Play/Pause - Main control */}
          <motion.button
            onClick={onPlayPause}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl text-white"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
            transition={isPlaying ? { duration: 2, repeat: Infinity } : {}}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={40} fill="white" stroke="white" />
            ) : (
              <Play size={40} fill="white" stroke="white" className="ml-2" />
            )}
          </motion.button>

          {/* Next */}
          <motion.button
            onClick={onNext}
            className="p-3 text-white hover:scale-110 transition-transform"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.1 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label="Next track"
          >
            <SkipForward size={28} fill="white" />
          </motion.button>

          {/* Repeat */}
          <motion.button
            onClick={toggleRepeat}
            className={`p-3 rounded-full transition-all relative ${ 
              repeatMode === 'off'
                ? 'text-neutral-400 hover:text-white'
                : 'bg-primary-500/20 text-primary-400'
            }`}
            whileTap={{ scale: 0.9 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label={`Repeat: ${repeatMode}`}
            title={`Repeat: ${repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One'}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 size={22} />
            ) : (
              <Repeat size={22} />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                {repeatMode === 'one' ? '1' : '∞'}
              </span>
            )}
          </motion.button>
        </div>

        {/* SEEK CONTROLS - explicit 15s skip buttons */}
        <div className="flex items-center justify-center gap-4 px-6 pb-5">
          <button
            onClick={onSeekBackward}
            className="px-4 py-2 rounded-full bg-white/5 text-sm font-semibold text-neutral-200 hover:bg-white/10 transition-colors"
            aria-label="Back 15 seconds"
          >
            -15s
          </button>
          <button
            onClick={onSeekForward}
            className="px-4 py-2 rounded-full bg-white/5 text-sm font-semibold text-neutral-200 hover:bg-white/10 transition-colors"
            aria-label="Forward 15 seconds"
          >
            +15s
          </button>
        </div>

        {/* SECONDARY CONTROLS - Actions and settings */}
        <div className="flex items-center justify-between px-6 pb-4 border-t border-white/5 pt-4">
          {/* Like/Favorite */}
          <motion.button
            onClick={onToggleFavorite}
            className="p-3 rounded-full hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={24}
              className={isFavorite ? 'text-primary-500 fill-primary-500' : 'text-neutral-400'}
            />
          </motion.button>

          {/* Queue */}
          <motion.button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-3 rounded-full transition-colors ${ 
              showQueue 
                ? 'bg-primary-500/20 text-primary-400' 
                : 'text-neutral-400 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.9 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label="Show queue"
          >
            <ListMusic size={24} />
          </motion.button>

          {/* Share */}
          <motion.button
            className="p-3 rounded-full text-neutral-400 hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label="Share song"
          >
            <Share2 size={24} />
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 px-3 bg-white/5 rounded-full">
            <button
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              onClick={() => onVolumeChange?.(volume === 0 ? 0.5 : 0)}
              style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
              aria-label="Toggle mute"
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange?.(parseFloat(e.target.value))}
              className="w-16 h-1 bg-neutral-600 rounded-full appearance-none cursor-pointer"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* QUEUE PANEL - Swipe up to see */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-[1051] bg-gradient-to-b from-neutral-900 via-neutral-950 to-black"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="flex flex-col h-full">
              {/* Queue Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">Queue</h2>
                <button
                  onClick={() => setShowQueue(false)}
                  className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Close queue"
                >
                  <ChevronDown size={28} strokeWidth={2} />
                </button>
              </div>

              {/* Queue content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="text-center py-8 text-neutral-500">
                  <p className="text-sm">Queue feature coming soon</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
