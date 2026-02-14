import { Play, Pause, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { mobile } from '../../styles/designTokens';
import { useMemo } from 'react';
import { useSongCoverUrl } from '@/hooks/useSongCoverUrl';
import { getImageUrl } from '@/utils/imageUrl';

/**
 * Mobile Mini Player
 * Compact player shown at bottom of screen (above bottom nav)
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
  const { coverUrl } = useSongCoverUrl(currentSong?._id);

  const displayCoverUrl = useMemo(() => {
    return getImageUrl(coverUrl || currentSong?.coverImageUrl) || 'https://via.placeholder.com/100';
  }, [coverUrl, currentSong?.coverImageUrl]);

  if (!currentSong) return null;

  return (
    <div
      className="lg:hidden fixed left-0 right-0 z-40"
      style={{
        bottom: mobile.bottomNav.heightWithSafeArea,
      }}
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-neutral-800">
        <motion.div
          className="h-full bg-primary-500"
          style={{ width: `${progress}%` }}
          initial={false}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Player content */}
      <div
        onClick={onExpand}
        className="bg-neutral-900/95 backdrop-blur-xl border-t border-white/5 px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-neutral-800/95 transition-colors"
      >
        {/* Album art */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
          <img
            src={displayCoverUrl}
            alt={currentSong.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.target.src !== 'https://via.placeholder.com/100') {
                e.target.src = 'https://via.placeholder.com/100';
              }
            }}
          />
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {currentSong.title}
          </h3>
          <p className="text-xs text-neutral-400 truncate">
            {currentSong.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite();
            }}
            className="p-2 text-neutral-400 hover:text-primary-400 transition-colors"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
          >
            <Heart
              size={20}
              className={isFavorite ? 'text-primary-500 fill-primary-500' : ''}
            />
          </button>

          {/* Play/Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="p-2 text-white"
            style={{ minWidth: mobile.touchTarget.min, minHeight: mobile.touchTarget.min }}
          >
            {isPlaying ? (
              <Pause size={24} fill="white" />
            ) : (
              <Play size={24} fill="white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
