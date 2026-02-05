import { useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { useToast } from '@/context/ToastContext';

/**
 * Custom hook for global keyboard shortcuts
 * Spotify-style shortcuts for music player control
 * 
 * Shortcuts:
 * - Space: Play/Pause
 * - ArrowRight: Next song
 * - ArrowLeft: Previous song
 * - F: Toggle favorite (TODO: Implement with PlayerContext)
 * 
 * Smart detection: Disabled when typing in input fields
 */
export const useKeyboardShortcuts = () => {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    // toggleFavorite,
    // isFavorite,
  } = usePlayer();

  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.isContentEditable;

      if (isTyping) return;

      // Check for modifier keys - don't trigger if user is using browser shortcuts
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      switch (event.code) {
        case 'Space':
          event.preventDefault(); // Prevent page scroll
          togglePlayPause();
          if (currentSong) {
            showToast(isPlaying ? 'Paused' : 'Playing', isPlaying ? '⏸️' : '▶️');
          }
          break;

        case 'ArrowRight':
          event.preventDefault();
          playNext();
          showToast('Next track', '⏭️');
          break;

        case 'ArrowLeft':
          event.preventDefault();
          playPrevious();
          showToast('Previous track', '⏮️');
          break;

        // TODO: Re-enable when favorite functionality is added to PlayerContext
        // case 'KeyF':
        //   if (currentSong) {
        //     event.preventDefault();
        //     const wasLiked = isFavorite(currentSong.id);
        //     toggleFavorite(currentSong);
        //     showToast(
        //       wasLiked ? 'Removed from favourites' : 'Added to favourites',
        //       wasLiked ? '💔' : '❤️'
        //     );
        //   }
        //   break;

        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSong, isPlaying, togglePlayPause, playNext, playPrevious]);
};
