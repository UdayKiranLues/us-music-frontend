import { Play, Pause, Heart, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { mobile } from '../../styles/designTokens';
import { useMemo } from 'react';
import { useSongCoverUrl } from '@/hooks/useSongCoverUrl';
import { getImageUrl } from '@/utils/imageUrl';

/**
 * Mobile Mini Player
 * Modern compact player shown at bottom of screen (above bottom nav)
 * Swipe up to expand to full player
 */
export default function MiniPlayer({
  currentSong,
  isPlaying,
  onPlayPause,
  onExpand,
  onToggleFavorite,
  isFavorite = false,
  progress = 0,
}) {
  const { coverUrl } = useSongCoverUrl(currentSong?._id, currentSong?.coverImageUrl || currentSong?.coverImage || currentSong?.coverUrl);

  const displayCoverUrl = useMemo(() => {
    return getImageUrl(coverUrl || currentSong?.coverImageUrl || currentSong?.coverImage || currentSong?.coverUrl) || 'https://placehold.co/400';
  }, [coverUrl, currentSong?.coverImageUrl, currentSong?.coverImage, currentSong?.coverUrl]);

  if (!currentSong) return null;

  return (
    <motion.div
      className="lg:hidden fixed left-0 right-0 z-40"
      style={{
        bottom: mobile.bottomNav.heightWithSafeArea,
      }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {/* Progress bar - thin line at top */}
      <div className="h-0.5 bg-neutral-800/50">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
          style={{ width: `${progress}%` }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Player content */}
      <motion.div
        onClick={onExpand}
        className="bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 backdrop-blur-2xl border-t border-white/10 px-3 py-2 flex items-center gap-3 cursor-pointer active:bg-neutral-700/80 transition-colors"
        whileHover={{ backgroundColor: 'rgba(23, 23, 23, 0.95)' }}
        drag="y"
        dragElastic={0.2}
        dragConstraints={{ top: 0, bottom: 20 }}
        onDragEnd={(event, info) => {
          if (info.velocity.y < -500) {
            onExpand?.();
          }
        }}
      >
        {/* Album art with animation */}
        <motion.div 
          className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg ring-1 ring-white/10"
          animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
          transition={isPlaying ? { duration: 2, repeat: Infinity } : {}}
        >
          <img
            src={displayCoverUrl}
            alt={currentSong.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.target.src !== 'https://placehold.co/100') {
                e.target.src = 'https://placehold.co/100';
              }
            }}
          />
        </motion.div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate leading-tight">
            {currentSong.title}
          </h3>
          <p className="text-xs text-neutral-400 truncate leading-tight">
            {currentSong.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Favorite */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="p-2 text-neutral-400 hover:text-primary-400 transition-colors rounded-lg hover:bg-white/5"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label="Toggle favorite"
          >
            <Heart
              size={20}
              className={isFavorite ? 'text-primary-500 fill-primary-500' : ''}
            />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause?.();
            }}
            className="p-2 text-white rounded-lg hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </motion.button>

          {/* Expand hint */}
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-2 text-neutral-500"
          >
            <ChevronUp size={18} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
