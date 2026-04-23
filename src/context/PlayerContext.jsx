import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import axios, { getBaseURL } from '../utils/axios';
import { NativeAudio } from '@capgo/native-audio';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';

const PlayerContext = createContext();
const PLAYER_ASSET_ID = 'currentSong';
const SEEK_STEP_SECONDS = 15;
const STALL_TIMEOUT_MS = 15000;
const PREMATURE_COMPLETION_TOLERANCE_SECONDS = 3;

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export function PlayerProvider({ children }) {
  // Song playback
  const [currentSong, setCurrentSong] = useState(() => {
    const saved = localStorage.getItem('us-music-currentSong');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  // Podcast playback
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [episodeResumePositions, setEpisodeResumePositions] = useState({}); 

  const [contentType, setContentType] = useState('song');

  // Common playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    const saved = localStorage.getItem('us-music-currentTime');
    return saved ? parseFloat(saved) : 0;
  });
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('us-music-volume');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [queue, setQueue] = useState(() => {
    const saved = localStorage.getItem('us-music-queue');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('us-music-currentIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null);

  const nativeSyncIntervalRef = useRef(null);
  const backgroundModeEnabledRef = useRef(false);
  const backgroundListenersRef = useRef([]);
  const currentTimeRef = useRef(currentTime);
  const durationRef = useRef(duration);
  const currentSongRef = useRef(currentSong);
  const lastNativeProgressRef = useRef(0);
  const stallRecoveringRef = useRef(false);
  const loadedAssetRef = useRef({
    songId: null,
    streamUrl: null,
  });

  const getSongId = useCallback((song) => song?._id || song?.id || null, []);

  const getArtworkUrl = (song) => {
    if (!song) return undefined;

    const cover =
      song.coverUrl ||
      song.coverImageUrl ||
      song.coverImage ||
      song.artworkUrl;

    if (!cover) return undefined;

    try {
      return new URL(cover, getBaseURL()).toString();
    } catch {
      return cover;
    }
  };

  const getNotificationMetadata = (song) => ({
    title: song?.title || 'US Music',
    artist: song?.artist || 'Unknown Artist',
    album: song?.album || 'US Music',
    artworkUrl: getArtworkUrl(song),
  });

  const stopNativeSync = () => {
    if (nativeSyncIntervalRef.current) {
      clearInterval(nativeSyncIntervalRef.current);
      nativeSyncIntervalRef.current = null;
    }
  };

  const getNativePlaybackState = useCallback(async () => {
    const preloadState = await NativeAudio.isPreloaded({ assetId: PLAYER_ASSET_ID }).catch(() => ({ found: false }));
    if (!preloadState?.found) {
      return {
        isLoaded: false,
        isPlaying: false,
      };
    }

    const playingState = await NativeAudio.isPlaying({ assetId: PLAYER_ASSET_ID }).catch(() => ({ isPlaying: false }));
    return {
      isLoaded: true,
      isPlaying: Boolean(playingState?.isPlaying),
    };
  }, []);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  /**
   * Fetch secure streaming URL from backend
   */
  const fetchSecureStreamUrl = useCallback(async (songId) => {
    try {
      if (!songId || songId === 'undefined' || songId === 'null') {
        throw new Error('Invalid song ID');
      }

      console.log(`🔍 Fetching stream URL for song: ${songId}`);
      const response = await axios.get(`${getBaseURL()}/api/v1/songs/${songId}/stream`);
      const { streamUrl } = response.data.data;

      if (!streamUrl) throw new Error('No stream URL returned');

      const fallbackBase = getBaseURL();
      let finalStreamUrl = streamUrl;

      try {
        if (finalStreamUrl.startsWith('/')) {
          finalStreamUrl = `${fallbackBase}${finalStreamUrl}`;
        } else {
          const parsed = new URL(finalStreamUrl, fallbackBase);
          if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            const pathAndSearch = parsed.pathname + (parsed.search || '');
            finalStreamUrl = `${fallbackBase}${pathAndSearch}`;
          }
        }
      } catch (e) {
        finalStreamUrl = streamUrl;
      }

      setStreamUrl(finalStreamUrl);
      return finalStreamUrl;
    } catch (error) {
      console.error('❌ Failed to fetch stream URL:', error.message);
      throw error;
    }
  }, []);

  const ensureSongAssetLoaded = useCallback(async (song) => {
    if (!song) {
      throw new Error('Invalid song');
    }

    const songId = getSongId(song);
    if (!songId) {
      throw new Error('Missing ID');
    }

    const { songId: loadedSongId, streamUrl: loadedStreamUrl } = loadedAssetRef.current;
    const preloadState = await NativeAudio.isPreloaded({ assetId: PLAYER_ASSET_ID }).catch(() => ({ found: false }));

    if (loadedSongId === songId && preloadState?.found && loadedStreamUrl) {
      setStreamUrl(loadedStreamUrl);
      return loadedStreamUrl;
    }

    const playbackStreamUrl = await fetchSecureStreamUrl(songId);

    await NativeAudio.unload({ assetId: PLAYER_ASSET_ID }).catch(() => {});

    await NativeAudio.preload({
      assetId: PLAYER_ASSET_ID,
      assetPath: playbackStreamUrl,
      isUrl: true,
      audioChannelNum: 1,
      volume: volume,
      notificationMetadata: getNotificationMetadata(song),
    });

    loadedAssetRef.current = {
      songId,
      streamUrl: playbackStreamUrl,
    };

    setStreamUrl(playbackStreamUrl);
    return playbackStreamUrl;
  }, [fetchSecureStreamUrl, getSongId, volume]);

  const getExpectedDuration = useCallback((song = currentSongRef.current) => {
    const songDuration = Number(song?.duration) || 0;
    const playerDuration = Number(durationRef.current) || 0;
    return Math.max(songDuration, playerDuration);
  }, []);

  /**
   * Play song via Native ExoPlayer - Enhanced with better error handling
   */
  const playSong = useCallback(async (song, autoPlay = true, options = {}) => {
    try {
      if (!song) throw new Error('Invalid song');
      const songId = getSongId(song);
      if (!songId) throw new Error('Missing ID');
      
      const {
        startTime = 0,
        skipHistory = false,
      } = options;

      console.log(`🎵 playSong: id=${songId}, title="${song.title}", duration=${song.duration}, startTime=${startTime}`);

      // Validate duration
      if (!song.duration || song.duration < 1) {
        console.warn(`⚠️ Invalid duration for song: ${song.duration}s. This might cause playback issues.`);
      }

      setCurrentSong(song);
      await ensureSongAssetLoaded(song);

      // Ensure we have a valid duration
      const songDuration = Math.max(Number(song.duration) || 0, Number(durationRef.current) || 0);
      if (songDuration > 0) {
        setDuration(songDuration);
        console.log(`✅ Duration set to: ${songDuration}s`);
      } else {
        console.warn('⚠️ No valid duration found for song');
      }

      setCurrentTime(startTime || 0);
      
      if (autoPlay) {
        await ensureBackgroundPlaybackReady(song);
        await NativeAudio.play({
          assetId: PLAYER_ASSET_ID,
          time: startTime || 0,
        }).catch((err) => {
          console.error('❌ Native play failed:', err.message);
          throw err;
        });
        setIsPlaying(true);
        startNativeSync(song);
        console.log(`✅ Started playing: ${song.title}`);
      }

      if (!skipHistory) {
        lastNativeProgressRef.current = Date.now();
      }
    } catch (error) {
      console.error('❌ Failed to play song:', error.message);
      loadedAssetRef.current = {
        songId: null,
        streamUrl: null,
      };
      setStreamUrl(null);
      setIsPlaying(false);
      throw error; // Re-throw for caller to handle
    }
  }, [ensureBackgroundPlaybackReady, ensureSongAssetLoaded, getSongId]);

  const resumeCurrentSong = useCallback(async (startTime = currentTimeRef.current) => {
    const song = currentSongRef.current;
    if (!song) return;

    await playSong(song, true, {
      startTime,
      skipHistory: true,
    });
  }, [playSong]);

  /**
   * Play/Pause toggle - Improved with immediate UI feedback
   */
  const togglePlayPause = useCallback(async () => {
    try {
      if (!currentSong) {
        console.warn('⚠️ togglePlayPause: No current song');
        return;
      }

      const songId = getSongId(currentSong);
      console.log(`🎮 togglePlayPause: songId=${songId}, currentlyPlaying=${isPlaying}`);

      const nativeState = await getNativePlaybackState();
      const isLoaded = loadedAssetRef.current.songId === songId && nativeState.isLoaded;
      
      // Immediately update UI state for responsive feedback
      const targetPlayingState = !isPlaying;
      setIsPlaying(targetPlayingState);

      // If not loaded, need to load and play
      if (!isLoaded) {
        console.log('📥 Loading song asset...');
        await ensureSongAssetLoaded(currentSong);
        
        if (targetPlayingState) {
          await ensureBackgroundPlaybackReady(currentSong);
          await NativeAudio.play({ 
            assetId: PLAYER_ASSET_ID,
            time: currentTimeRef.current 
          }).catch((err) => {
            console.error('❌ Failed to play loaded song:', err.message);
            setIsPlaying(false); // Revert UI on error
            throw err;
          });
          startNativeSync(currentSong);
        }
        return;
      }

      // If currently playing, pause it
      if (nativeState.isPlaying) {
        console.log('⏸️  Pausing...');
        await NativeAudio.pause({ assetId: PLAYER_ASSET_ID }).catch((err) => {
          console.error('❌ Failed to pause:', err.message);
          setIsPlaying(true); // Revert UI on error
          throw err;
        });
      } else {
        // If paused, resume it
        console.log('▶️  Resuming...');
        await ensureBackgroundPlaybackReady(currentSong);
        
        try {
          await NativeAudio.resume({ assetId: PLAYER_ASSET_ID });
          console.log('✅ Resumed successfully');
        } catch (resumeErr) {
          console.warn('Resume failed, falling back to play:', resumeErr.message);
          // Fallback: use play instead of resume if resume fails
          await NativeAudio.play({ 
            assetId: PLAYER_ASSET_ID,
            time: currentTimeRef.current 
          }).catch((playErr) => {
            console.error('❌ Fallback play also failed:', playErr.message);
            setIsPlaying(false); // Revert UI on error
            throw playErr;
          });
        }
        startNativeSync(currentSong);
      }

      console.log(`✅ togglePlayPause completed: now ${targetPlayingState ? 'playing' : 'paused'}`);
    } catch (error) {
      console.error('❌ togglePlayPause error:', error.message);
      // Ensure UI state matches reality after error
      const nativeState = await getNativePlaybackState();
      setIsPlaying(nativeState.isPlaying);
    }
  }, [currentSong, isPlaying, ensureBackgroundPlaybackReady, ensureSongAssetLoaded, getNativePlaybackState, getSongId, playSong]);

  /**
   * Initialize background audio modes for Android ExoPlayer
   */
  async function ensureBackgroundPlaybackReady(song = currentSong) {
    try {
      const status = await BackgroundMode.checkNotificationsPermission().catch(() => null);
      if (status && status.notifications !== 'granted') {
        await BackgroundMode.requestNotificationsPermission().catch(() => null);
      }

      await NativeAudio.configure({
        backgroundPlayback: true,
        background: true,
        focus: true,
        showNotification: true,
      }).catch(console.error);

      const notificationSettings = {
        title: song?.title || 'US Music',
        text: song?.artist || 'Playing music',
        channelName: 'Music playback',
        channelDescription: 'Keeps audio playing in the background',
        disableWebViewOptimization: true,
        resume: true,
        hidden: false,
      };

      if (!backgroundModeEnabledRef.current) {
        await BackgroundMode.enable(notificationSettings).catch(console.error);
        backgroundModeEnabledRef.current = true;
      } else {
        await BackgroundMode.updateNotification(notificationSettings).catch(console.error);
      }
    } catch (e) {
      console.error('Background mode init failed', e);
    }
  }

  /**
   * Sync native progress - Enhanced with better state tracking
   */
  const startNativeSync = (song = currentSongRef.current) => {
     ensureBackgroundPlaybackReady(song);
     stopNativeSync();
     
     let consecutiveStallCount = 0;
     
     nativeSyncIntervalRef.current = setInterval(async () => {
        try {
           const nativeState = await getNativePlaybackState();
           setIsPlaying(nativeState.isPlaying);

           const durObj = await NativeAudio.getDuration({ assetId: PLAYER_ASSET_ID }).catch(() => null);
           const nextDuration = Math.max(
             Number(song?.duration) || 0,
             Number(durObj?.duration) || 0,
             Number(durationRef.current) || 0
           );

           if (nextDuration > 0) {
              setDuration(nextDuration);
           }

           // Detect stalled playback (no progress for 3+ seconds while playing)
           if (nativeState.isPlaying) {
             const timeSinceLastUpdate = Date.now() - lastNativeProgressRef.current;
             if (timeSinceLastUpdate > 3000) {
               consecutiveStallCount++;
               if (consecutiveStallCount >= 2 && !stallRecoveringRef.current) {
                 console.warn(`⚠️ Playback stalled detected (${consecutiveStallCount}x), attempting recovery...`);
                 stallRecoveringRef.current = true;
                 try {
                   await resumeCurrentSong(currentTimeRef.current);
                 } catch (err) {
                   console.error('Recovery failed:', err.message);
                 } finally {
                   stallRecoveringRef.current = false;
                   consecutiveStallCount = 0;
                 }
               }
             } else {
               consecutiveStallCount = 0;
             }
           } else {
             consecutiveStallCount = 0;
           }
        } catch (e) {
          console.error('Sync error:', e.message);
        }
     }, 1000);
  };

  /**
   * Seek to position - Enhanced with validation and recovery
   */
  const seekTo = useCallback(async (time) => {
    try {
      if (!currentSong) {
        console.warn('⚠️ seekTo: No current song');
        return;
      }

      const maxDuration = duration || currentSong?.duration || 0;
      const clampedTime = Math.max(0, Math.min(time, maxDuration));
      
      console.log(`⏩ seekTo: ${clampedTime.toFixed(2)}s of ${maxDuration}s`);

      const preloadState = await NativeAudio.isPreloaded({ assetId: PLAYER_ASSET_ID }).catch(() => ({ found: false }));

      if (loadedAssetRef.current.songId !== getSongId(currentSong) || !preloadState?.found) {
        console.log('📥 Song not loaded for seeking, loading now...');
        await playSong(currentSong, isPlaying, {
          startTime: clampedTime,
          skipHistory: true,
        });
        return;
      }

      // Set position in native player
      await NativeAudio.setCurrentTime({ 
        assetId: PLAYER_ASSET_ID, 
        time: clampedTime 
      }).catch((err) => {
        console.error('❌ setCurrentTime failed:', err.message);
        throw err;
      });

      // Update local state
      setCurrentTime(clampedTime);
      lastNativeProgressRef.current = Date.now();
      
      console.log(`✅ Seeked to ${clampedTime.toFixed(2)}s`);
    } catch (error) {
      console.error('❌ seekTo error:', error.message);
      // Still try to update local state if seek fails
      setCurrentTime(Math.max(0, Math.min(time, duration || 0)));
    }
  }, [currentSong, duration, getSongId, isPlaying, playSong]);

  /**
   * Change volume
   */
  const changeVolume = async (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, Number(newVolume) || 0));
    setVolume(clampedVolume);
    await NativeAudio.setVolume({ assetId: PLAYER_ASSET_ID, volume: clampedVolume }).catch(()=>{});
  };

  const skipBy = useCallback(async (delta) => {
    await seekTo(currentTimeRef.current + delta);
  }, [seekTo]);

  const playNext = useCallback(async () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      await playSong(queue[nextIndex]);
    }
  }, [currentIndex, playSong, queue]);

  const playPrevious = useCallback(async () => {
    if (currentTimeRef.current > 3) {
      await seekTo(0);
      return;
    }

    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      await playSong(queue[prevIndex]);
      return;
    }

    if (queue.length > 0) {
      setCurrentIndex(0);
      await playSong(queue[0]);
      return;
    }

    if (currentSong) {
      await playSong(currentSong, true, { startTime: 0, skipHistory: true });
    }
  }, [currentIndex, currentSong, playSong, queue, seekTo]);

  const addToQueue = (songs) => setQueue((prev) => [...prev, ...songs]);

  const replaceQueue = (songs, startIndex = 0) => {
    setQueue(songs);
    setCurrentIndex(startIndex);
    if (songs[startIndex]) playSong(songs[startIndex]);
  };

  const toggleFullScreen = () => setIsFullScreen((prev) => !prev);

  // Native Audio completion listener
  useEffect(() => {
    let listener = null;
    const setupListener = async () => {
      listener = await NativeAudio.addListener('complete', ({ assetId }) => {
        if (assetId !== PLAYER_ASSET_ID) return;

        const expectedDuration = getExpectedDuration();
        const completionTime = currentTimeRef.current;

        if (
          currentSongRef.current &&
          expectedDuration > 0 &&
          completionTime + PREMATURE_COMPLETION_TOLERANCE_SECONDS < expectedDuration
        ) {
          console.warn(
            `Ignoring premature completion at ${completionTime}s for expected duration ${expectedDuration}s`
          );
          void resumeCurrentSong(completionTime);
          return;
        }

        setIsPlaying(false);
        void playNext();
      });
    };
    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    }
  }, [getExpectedDuration, playNext, resumeCurrentSong]);

  useEffect(() => {
    let listener = null;

    const setupListener = async () => {
      listener = await NativeAudio.addListener('currentTime', ({ assetId, currentTime: nextTime }) => {
        if (assetId !== PLAYER_ASSET_ID) return;
        setCurrentTime(nextTime);
        lastNativeProgressRef.current = Date.now();
      });
    };

    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, []);

  // Cleanup
  useEffect(() => {
    let cancelled = false;

    const setupBackgroundListeners = async () => {
      const backgroundListener = await BackgroundMode.addListener('appInBackground', () => {
        BackgroundMode.disableWebViewOptimizations().catch(() => {});
      }).catch(() => null);

      const foregroundListener = await BackgroundMode.addListener('appInForeground', () => {
        BackgroundMode.enableWebViewOptimizations().catch(() => {});
      }).catch(() => null);

      if (cancelled) {
        await backgroundListener?.remove?.().catch(() => {});
        await foregroundListener?.remove?.().catch(() => {});
        return;
      }

      backgroundListenersRef.current = [backgroundListener, foregroundListener].filter(Boolean);
    };

    setupBackgroundListeners();

    return () => {
      cancelled = true;
      backgroundListenersRef.current.forEach((listener) => {
        listener?.remove?.().catch(() => {});
      });
      backgroundListenersRef.current = [];
    };
  }, []);

  useEffect(() => {
    return () => {
      stopNativeSync();
      if (backgroundModeEnabledRef.current) {
        BackgroundMode.disable().catch(() => {});
        backgroundModeEnabledRef.current = false;
      }
      loadedAssetRef.current = {
        songId: null,
        streamUrl: null,
      };
      NativeAudio.unload({ assetId: PLAYER_ASSET_ID }).catch(() => {});
    };
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('us-music-currentSong', JSON.stringify(currentSong));
    }
  }, [currentSong]);

  useEffect(() => {
    if (queue && queue.length > 0) {
      localStorage.setItem('us-music-queue', JSON.stringify(queue));
    }
  }, [queue]);

  useEffect(() => {
    localStorage.setItem('us-music-currentIndex', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('us-music-volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('us-music-currentTime', currentTime.toString());
  }, [currentTime]);

  useEffect(() => {
    if (currentSong?.duration) {
      setDuration((prev) => prev || currentSong.duration);
    }
  }, [currentSong]);

  useEffect(() => {
    if (currentSong && isPlaying) {
      ensureBackgroundPlaybackReady(currentSong);
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!isPlaying || !currentSong) return undefined;

    const stallInterval = setInterval(async () => {
      const lastTick = lastNativeProgressRef.current;
      if (!lastTick || Date.now() - lastTick < STALL_TIMEOUT_MS || stallRecoveringRef.current) {
        return;
      }

      stallRecoveringRef.current = true;

      try {
        await resumeCurrentSong(currentTimeRef.current);
      } catch (error) {
        console.error('Failed to recover stalled playback:', error);
      } finally {
        stallRecoveringRef.current = false;
      }
    }, 5000);

    return () => clearInterval(stallInterval);
  }, [currentSong, isPlaying, resumeCurrentSong]);

  // MediaSession Action Handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (currentSong) {
        navigator.mediaSession.metadata = new MediaMetadata(getNotificationMetadata(currentSong));
      }
      navigator.mediaSession.setActionHandler('play', togglePlayPause);
      navigator.mediaSession.setActionHandler('pause', togglePlayPause);
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', (d) => seekTo(d.seekTime || 0));
      navigator.mediaSession.setActionHandler('seekbackward', () => skipBy(-SEEK_STEP_SECONDS));
      navigator.mediaSession.setActionHandler('seekforward', () => skipBy(SEEK_STEP_SECONDS));
    }
  }, [queue, currentIndex, isPlaying, currentSong, playNext, playPrevious, seekTo, skipBy, togglePlayPause]);

  const value = {
    currentSong, setCurrentSong, currentPodcast, setCurrentPodcast, currentEpisode, setCurrentEpisode,
    episodeResumePositions, setEpisodeResumePositions, contentType, setContentType,
    isPlaying, currentTime, duration, volume, queue, currentIndex, isFullScreen,
    playSong, playEpisode: playSong, togglePlayPause, seekTo, changeVolume,
    playNext, playPrevious, addToQueue, replaceQueue, toggleFullScreen, skipBy,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
