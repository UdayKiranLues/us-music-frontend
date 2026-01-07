import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { songs } from '@/data/mockData';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  // Core player state
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('us-music-volume');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [isShuffle, setIsShuffle] = useState(() => {
    const saved = localStorage.getItem('us-music-shuffle');
    return saved === 'true';
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    const saved = localStorage.getItem('us-music-repeat');
    return saved || 'off';
  }); // 'off', 'all', 'one'
  
  // User data state with localStorage persistence
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('us-music-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('us-music-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [playCount, setPlayCount] = useState(() => {
    const saved = localStorage.getItem('us-music-playcount');
    return saved ? JSON.parse(saved) : {};
  }); // Track play counts for recommendations
  
  const audioRef = useRef(new Audio());

  // ==================== PERSISTENCE EFFECTS ====================
  useEffect(() => {
    localStorage.setItem('us-music-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('us-music-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('us-music-playcount', JSON.stringify(playCount));
  }, [playCount]);

  useEffect(() => {
    localStorage.setItem('us-music-volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('us-music-shuffle', isShuffle.toString());
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem('us-music-repeat', repeatMode);
  }, [repeatMode]);

  // ==================== AUDIO EVENT LISTENERS ====================
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => handleSongEnd();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, queue, queueIndex]);

  // ==================== AUDIO SYNC EFFECTS ====================
  useEffect(() => {
    if (currentSong) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // ==================== SIMILARITY CALCULATION ====================
  /**
   * Calculate similarity score between two songs (0-100)
   * Factors: genre match, mood match, BPM proximity, artist match
   */
  const calculateSimilarity = useCallback((song1, song2) => {
    if (!song1 || !song2 || song1.id === song2.id) return 0;

    let score = 0;

    // Genre match (40 points)
    if (song1.genre === song2.genre) score += 40;

    // Mood match (30 points)
    if (song1.mood === song2.mood) score += 30;

    // BPM proximity (20 points)
    const bpmDiff = Math.abs(song1.bpm - song2.bpm);
    if (bpmDiff <= 10) score += 20;
    else if (bpmDiff <= 20) score += 15;
    else if (bpmDiff <= 30) score += 10;
    else if (bpmDiff <= 50) score += 5;

    // Artist match (10 points bonus)
    if (song1.artist === song2.artist) score += 10;

    return score;
  }, []);

  // ==================== SMART RECOMMENDATION ENGINE ====================
  /**
   * Find next best song based on current song, history, and user preferences
   */
  const findNextSimilarSong = useCallback((currentSong) => {
    if (!currentSong) return null;

    // Get recently played song IDs (last 10 songs)
    const recentIds = history.slice(0, 10).map(s => s.id);
    
    // Filter available songs (exclude current and recently played)
    const availableSongs = songs.filter(song => 
      song.id !== currentSong.id && !recentIds.includes(song.id)
    );

    if (availableSongs.length === 0) {
      // If all songs were recently played, just exclude current song
      const fallbackSongs = songs.filter(song => song.id !== currentSong.id);
      return fallbackSongs[Math.floor(Math.random() * fallbackSongs.length)];
    }

    // Calculate similarity scores for all available songs
    const scoredSongs = availableSongs.map(song => ({
      song,
      similarityScore: calculateSimilarity(currentSong, song),
      popularityScore: song.popularity || 50,
      playCountScore: (playCount[song.id] || 0) * 2, // User preference
      isFavorite: favorites.some(fav => fav.id === song.id)
    }));

    // Weighted scoring algorithm
    const rankedSongs = scoredSongs.map(item => ({
      ...item,
      finalScore: (
        item.similarityScore * 0.5 +      // 50% weight on similarity
        item.popularityScore * 0.2 +       // 20% weight on popularity
        item.playCountScore * 0.2 +        // 20% weight on user's listening history
        (item.isFavorite ? 10 : 0)        // 10 bonus points for favorites
      )
    }));

    // Sort by final score descending
    rankedSongs.sort((a, b) => b.finalScore - a.finalScore);

    // Use weighted random selection from top candidates
    // 60% chance of picking top song, 25% for second, 15% for third
    const rand = Math.random();
    let selectedSong;
    
    if (rand < 0.6 && rankedSongs.length > 0) {
      selectedSong = rankedSongs[0].song;
    } else if (rand < 0.85 && rankedSongs.length > 1) {
      selectedSong = rankedSongs[1].song;
    } else if (rankedSongs.length > 2) {
      selectedSong = rankedSongs[2].song;
    } else {
      selectedSong = rankedSongs[0]?.song;
    }

    return selectedSong || availableSongs[0];
  }, [calculateSimilarity, favorites, history, playCount]);

  // ==================== HISTORY MANAGEMENT ====================
  const addToHistory = useCallback((song) => {
    if (!song) return;
    
    setHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(s => s.id !== song.id);
      // Add to front and keep last 100
      return [{ ...song, playedAt: Date.now() }, ...filtered].slice(0, 100);
    });

    // Update play count
    setPlayCount(prev => ({
      ...prev,
      [song.id]: (prev[song.id] || 0) + 1
    }));
  }, []);

  // ==================== CORE PLAYBACK FUNCTIONS ====================
  const playSong = useCallback((song, newQueue = null) => {
    if (!song) return;

    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
    addToHistory(song);

    if (newQueue) {
      setQueue(newQueue);
      const index = newQueue.findIndex(s => s.id === song.id);
      setQueueIndex(index >= 0 ? index : 0);
    } else if (queue.length === 0) {
      // If no queue, create one starting with this song
      setQueue([song]);
      setQueueIndex(0);
    } else {
      // Update index in existing queue
      const index = queue.findIndex(s => s.id === song.id);
      if (index >= 0) {
        setQueueIndex(index);
      }
    }
  }, [queue, addToHistory]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (repeatMode === 'one') {
      // Replay current song
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (queue.length === 0) {
      // No queue, find similar song
      const nextSong = findNextSimilarSong(currentSong);
      if (nextSong) playSong(nextSong);
      return;
    }

    let nextIndex;
    
    if (isShuffle) {
      // Random song from queue (excluding current)
      const availableIndices = queue
        .map((_, idx) => idx)
        .filter(idx => idx !== queueIndex);
      nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      nextIndex = queueIndex + 1;
      
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // End of queue, find similar song
          const nextSong = findNextSimilarSong(currentSong);
          if (nextSong) playSong(nextSong);
          return;
        }
      }
    }

    setQueueIndex(nextIndex);
    playSong(queue[nextIndex], queue);
  }, [queue, queueIndex, isShuffle, repeatMode, currentSong, playSong, findNextSimilarSong]);

  const playPrevious = useCallback(() => {
    // If more than 3 seconds into the song, restart it
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIndex;
    
    if (isShuffle) {
      // Random song from queue (excluding current)
      const availableIndices = queue
        .map((_, idx) => idx)
        .filter(idx => idx !== queueIndex);
      prevIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      prevIndex = queueIndex - 1;
      
      if (prevIndex < 0) {
        prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
      }
    }

    setQueueIndex(prevIndex);
    playSong(queue[prevIndex], queue);
  }, [queue, queueIndex, isShuffle, repeatMode, currentTime, playSong]);

  const handleSongEnd = useCallback(() => {
    playNext();
  }, [playNext]);

  // ==================== QUEUE MANAGEMENT ====================
  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue(prev => {
      const newQueue = [...prev];
      newQueue.splice(index, 1);
      
      // Adjust queue index if needed
      if (index < queueIndex) {
        setQueueIndex(queueIndex - 1);
      } else if (index === queueIndex && newQueue.length > 0) {
        // If removing current song, play next in queue
        const nextIndex = Math.min(queueIndex, newQueue.length - 1);
        setQueueIndex(nextIndex);
        playSong(newQueue[nextIndex], newQueue);
      }
      
      return newQueue;
    });
  }, [queueIndex, playSong]);

  const clearQueue = useCallback(() => {
    setQueue(currentSong ? [currentSong] : []);
    setQueueIndex(0);
  }, [currentSong]);

  // ==================== FAVORITES MANAGEMENT ====================
  const toggleFavorite = useCallback((song) => {
    setFavorites(prev => {
      const exists = prev.find(s => s.id === song.id);
      if (exists) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  }, []);

  const isFavorite = useCallback((songId) => {
    return favorites.some(s => s.id === songId);
  }, [favorites]);

  // ==================== PLAYBACK CONTROLS ====================
  const seekTo = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const setVolumeLevel = useCallback((newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);

  // ==================== CONTEXT VALUE ====================
  const value = {
    // State
    currentSong,
    isPlaying,
    queue,
    queueIndex,
    currentTime,
    duration,
    volume,
    favorites,
    history,
    isShuffle,
    repeatMode,
    playCount,
    
    // Playback controls
    playSong,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    
    // Queue management
    addToQueue,
    removeFromQueue,
    clearQueue,
    
    // Favorites
    toggleFavorite,
    isFavorite,
    
    // Playback modes
    toggleShuffle,
    cycleRepeatMode,
    
    // Utility functions (for debugging or advanced features)
    findNextSimilarSong,
    calculateSimilarity,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
