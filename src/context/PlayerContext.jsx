import { createContext, useContext, useState, useRef, useEffect } from 'react';
import axios, { getBaseURL } from '../utils/axios';
import { NativeAudio } from '@capgo/native-audio';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';

const PlayerContext = createContext();

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

  /**
   * Fetch secure streaming URL from backend
   */
  const fetchSecureStreamUrl = async (songId) => {
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
  };

  /**
   * Play song via Native ExoPlayer
   */
  const playSong = async (song, autoPlay = true) => {
    try {
      if (!song) throw new Error('Invalid song');
      const songId = song._id || song.id;
      if (!songId) throw new Error('Missing ID');

      setCurrentSong(song);
      const playbackStreamUrl = await fetchSecureStreamUrl(songId);

      // Unload previous
      await NativeAudio.unload({ assetId: 'currentSong' }).catch(() => {});
      
      await NativeAudio.preload({
        assetId: 'currentSong',
        assetPath: playbackStreamUrl,
        isUrl: true,
        audioChannelNum: 1,
        volume: volume,
        notificationMetadata: getNotificationMetadata(song),
      });
      
      if (autoPlay) {
        await ensureBackgroundPlaybackReady(song);
        await NativeAudio.play({ assetId: 'currentSong' });
        setIsPlaying(true);
        startNativeSync();
      }
    } catch (error) {
      console.error('❌ Failed to play song:', error.message);
      setIsPlaying(false);
    }
  };

  /**
   * Play/Pause toggle
   */
  const togglePlayPause = async () => {
    if (currentSong && !streamUrl) {
      await playSong(currentSong, true);
      return;
    }

    if (isPlaying) {
      await NativeAudio.pause({ assetId: 'currentSong' }).catch(() => {});
      setIsPlaying(false);
      stopNativeSync();
    } else {
      await ensureBackgroundPlaybackReady(currentSong);
      await NativeAudio.resume({ assetId: 'currentSong' }).catch(async () => {
        await NativeAudio.play({ assetId: 'currentSong' }).catch(() => {});
      });
      setIsPlaying(true);
      startNativeSync();
    }
  };

  /**
   * Initialize background audio modes for Android ExoPlayer
   */
  const ensureBackgroundPlaybackReady = async (song = currentSong) => {
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
  };

  /**
   * Sync native progress
   */
  const startNativeSync = () => {
     ensureBackgroundPlaybackReady();
     stopNativeSync();
     nativeSyncIntervalRef.current = setInterval(async () => {
        try {
           const timeObj = await NativeAudio.getCurrentTime({ assetId: 'currentSong' });
           if (timeObj && timeObj.currentTime !== undefined) {
              setCurrentTime(timeObj.currentTime);
           }
           const durObj = await NativeAudio.getDuration({ assetId: 'currentSong' }).catch(() => null);
           if (durObj && durObj.duration) {
              setDuration(durObj.duration);
           }
        } catch (e) {}
     }, 1000);
  };

  /**
   * Seek to position
   */
  const seekTo = async (time) => {
    await NativeAudio.setCurrentTime({ assetId: 'currentSong', time }).catch(() => {});
    setCurrentTime(time);
  };

  /**
   * Change volume
   */
  const changeVolume = async (newVolume) => {
    setVolume(newVolume);
    await NativeAudio.setVolume({ assetId: 'currentSong', volume: newVolume }).catch(()=>{});
  };

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playSong(queue[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      playSong(queue[prevIndex]);
    }
  };

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
        if (assetId !== 'currentSong') return;
        setIsPlaying(false);
        playNext();
      });
    };
    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    }
  }, [currentIndex, queue]);

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
      NativeAudio.unload({ assetId: 'currentSong' }).catch(() => {});
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
    if (currentSong && isPlaying) {
      ensureBackgroundPlaybackReady(currentSong);
    }
  }, [currentSong, isPlaying]);

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
    }
  }, [queue, currentIndex, isPlaying, currentSong]);

  const value = {
    currentSong, setCurrentSong, currentPodcast, setCurrentPodcast, currentEpisode, setCurrentEpisode,
    episodeResumePositions, setEpisodeResumePositions, contentType, setContentType,
    isPlaying, currentTime, duration, volume, queue, currentIndex, isFullScreen,
    playSong, playEpisode: playSong, togglePlayPause, seekTo, changeVolume,
    playNext, playPrevious, addToQueue, replaceQueue, toggleFullScreen,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
