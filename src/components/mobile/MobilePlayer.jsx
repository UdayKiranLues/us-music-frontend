import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  MoreVertical,
  ChevronDown,
  Repeat,
  Shuffle,
  Volume2,
} from 'lucide-react';
import { mobile, colors, glassmorphism } from '../../styles/designTokens';
import { useSongCoverUrl } from '@/hooks/useSongCoverUrl';
import { getImageUrl } from '@/utils/imageUrl';

/**
 * Mobile Full-Screen Player
 * Spotify-style full-screen player with swipe gestures
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
  onSeek,
  onToggleFavorite,
  isFavorite = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const controls = useAnimation();
  const constraintsRef = useRef(null);
  const { coverUrl } = useSongCoverUrl(currentSong?._id);

  const displayCoverUrl = useMemo(() => {
    return getImageUrl(coverUrl || currentSong?.coverImageUrl) || 'https://via.placeholder.com/400';
  }, [coverUrl, currentSong?.coverImageUrl]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedDown: (event) => {
      if (event.velocity > 0.5) {
        onClose();
      }
    },
    onSwipedLeft: (event) => {
      if (event.velocity > 0.5 && onNext) {
        onNext();
      }
    },
    onSwipedRight: (event) => {
      if (event.velocity > 0.5 && onPrevious) {
        onPrevious();
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
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!isOpen || !currentSong) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: isOpen ? 0 : '100%' }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[1050] bg-gradient-to-b from-neutral-900 via-black to-black lg:hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      {...swipeHandlers}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
          style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
        >
          <ChevronDown size={28} strokeWidth={2} />
        </button>

        <div className="text-center">
          <p className="text-xs text-neutral-400 uppercase tracking-wider">Playing from</p>
          <p className="text-sm font-medium text-white">{currentSong.album || 'Library'}</p>
        </div>

        <button
          className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
          style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
        >
          <MoreVertical size={24} />
        </button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <motion.div
          className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl"
          animate={{
            scale: isDragging ? 0.95 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <img
            src={displayCoverUrl}
            alt={currentSong.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.target.src !== 'https://via.placeholder.com/400') {
                e.target.src = 'https://via.placeholder.com/400';
              }
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>
      </div>

      {/* Song Info & Controls */}
      <div className="px-8 pb-8 space-y-6">
        {/* Song Title & Artist */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1 truncate">
            {currentSong.title}
          </h1>
          <p className="text-base text-neutral-400 truncate">
            {currentSong.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-1 bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
              style={{ width: `${progress}%` }}
              initial={false}
              animate={{ width: `${progress}%` }}
            />

            {/* Draggable thumb */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              style={{ zIndex: 10 }}
            />
          </div>

          {/* Time labels */}
          <div className="flex justify-between text-xs text-neutral-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Shuffle */}
          <button
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
          >
            <Shuffle size={20} />
          </button>

          {/* Previous */}
          <button
            onClick={onPrevious}
            className="p-3 text-white hover:scale-110 transition-transform"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
          >
            <SkipBack size={32} fill="white" />
          </button>

          {/* Play/Pause */}
          <motion.button
            onClick={onPlayPause}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {isPlaying ? (
              <Pause size={32} fill="black" stroke="black" />
            ) : (
              <Play size={32} fill="black" stroke="black" className="ml-1" />
            )}
          </motion.button>

          {/* Next */}
          <button
            onClick={onNext}
            className="p-3 text-white hover:scale-110 transition-transform"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
          >
            <SkipForward size={32} fill="white" />
          </button>

          {/* Repeat */}
          <button
            className="p-2 text-neutral-400 hover:text-white transition-colors"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
          >
            <Repeat size={20} />
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={onToggleFavorite}
            className="p-2 transition-colors"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
          >
            <Heart
              size={24}
              className={isFavorite ? 'text-primary-500 fill-primary-500' : 'text-neutral-400'}
            />
          </button>

          <div className="flex items-center gap-2">
            <Volume2 size={20} className="text-neutral-400" />
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="70"
              className="w-24 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Swipe hint (show on first use) */}
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: -10 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-neutral-500 pointer-events-none"
      >
        Swipe down to minimize • Swipe left/right to change song
      </motion.div>
    </motion.div>
  );
}
