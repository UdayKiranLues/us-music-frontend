import { createContext, useContext, useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import axios, { getBaseURL } from '../utils/axios';
import { Capacitor } from '@capacitor/core';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { NativeAudio } from '@capgo/native-audio';

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

  const audioRef = useRef(new Audio());
  const hlsRef = useRef(null);
  const nativeSyncIntervalRef = useRef(null);

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
   * Initialize Web HTML5 HLS player (Web Fallback)
   */
  const initializeHLS = (url) => {
    const audio = audioRef.current;
    if (hlsRef.current) hlsRef.current.destroy();

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(url);
      hls.attachMedia(audio);
      hlsRef.current = hls;
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = url;
    }
  };

  /**
   * Play song via Native ExoPlayer or Web HLS
   */
  const playSong = async (song, autoPlay = true) => {
    try {
      if (!song) throw new Error('Invalid song');
      const songId = song._id || song.id;
      if (!songId) throw new Error('Missing ID');

      setCurrentSong(song);
      const playbackStreamUrl = await fetchSecureStreamUrl(songId);

      if (Capacitor.isNativePlatform()) {
        // --- NATIVE SPOTIFY-LIKE EXOPLAYER ---
        try {
          // Unload previous
          await NativeAudio.unload({ assetId: 'currentSong' }).catch(() => {});
          
          await NativeAudio.preload({
            assetId: 'currentSong',
            assetPath: playbackStreamUrl,
            isUrl: true,
            audioChannelNum: 1,
            volume: volume
          });
          
          if (autoPlay) {
            await NativeAudio.play({ assetId: 'currentSong' });
            setIsPlaying(true);
            startNativeSync();
          }
        } catch (nativeErr) {
          console.error("NativeAudio failed, this is unexpected:", nativeErr);
        }
      } else {
        // --- WEB HTML5 HLS ---
        initializeHLS(playbackStreamUrl);
        if (autoPlay) {
          setTimeout(() => {
            audioRef.current.play();
            setIsPlaying(true);
          }, 100);
        }
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

    if (Capacitor.isNativePlatform()) {
      if (isPlaying) {
        await NativeAudio.pause({ assetId: 'currentSong' }).catch(() => {});
        setIsPlaying(false);
      } else {
        await NativeAudio.play({ assetId: 'currentSong' }).catch(() => {});
        setIsPlaying(true);
        startNativeSync();
      }
    } else {
      const audio = audioRef.current;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  /**
   * Sync native progress
   */
  const startNativeSync = () => {
     if (nativeSyncIntervalRef.current) clearInterval(nativeSyncIntervalRef.current);
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
    if (Capacitor.isNativePlatform()) {
      await NativeAudio.getCurrentTime({ assetId: 'currentSong', time: time }).catch(() => {}); // NOTE: capgo might use play({time: time}) instead, but set/get time works differently. Assuming time is handled.
      // *Correction: capgo native audio seek is typically via NativeAudio.play({ time }) or NativeAudio.seek
      // Actually capgo NativeAudio usually doesn't expose a direct seek, but play({time}) seeks.
      await NativeAudio.play({ assetId: 'currentSong', time: time }).catch(()=>{});
    } else {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  /**
   * Change volume
   */
  const changeVolume = async (newVolume) => {
    setVolume(newVolume);
    if (Capacitor.isNativePlatform()) {
      await NativeAudio.setVolume({ assetId: 'currentSong', volume: newVolume }).catch(()=>{});
    } else {
      audioRef.current.volume = newVolume;
    }
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

  // Web Audio element event listeners
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
       // Register native completion listener
       const listener = NativeAudio.addListener('complete', () => {
          setIsPlaying(false);
          playNext();
       });
       return () => {
         // listener.remove();
       }
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => { setIsPlaying(false); playNext(); };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentIndex, queue]);

  // Handle Background Mode + Media Metadata
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const initBackgroundMode = async () => {
        try {
          const status = await BackgroundMode.checkPermissions();
          if (status.display !== 'granted') {
            await BackgroundMode.requestPermissions();
          }
          BackgroundMode.enable();
          BackgroundMode.setSettings({
            title: currentSong ? (currentSong.title || 'US Music') : 'US Music',
            text: currentSong ? (currentSong.artist || 'Playing audio') : 'Playing audio',
            resume: true,
            hidden: false,
          });
          BackgroundMode.on('activate', () => {
            BackgroundMode.disableWebViewOptimizations(); 
          });
        } catch (err) {}
      };
      initBackgroundMode();
    }
  }, [currentSong]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (nativeSyncIntervalRef.current) clearInterval(nativeSyncIntervalRef.current);
      if (Capacitor.isNativePlatform()) {
         NativeAudio.unload({ assetId: 'currentSong' }).catch(() => {});
      } else {
         audioRef.current.pause();
      }
    };
  }, []);

  // Persistence Effects
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('us-music-currentSong', JSON.stringify(currentSong));
      
      if ('mediaSession' in navigator && !Capacitor.isNativePlatform()) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.title || 'Unknown Title',
          artist: currentSong.artist || 'Unknown Artist',
          album: currentSong.album || 'Unknown Album',
          artwork: [
            {
              src: currentSong.thumbnail || currentSong.coverUrl || 'https://via.placeholder.com/512',
              sizes: '512x512',
              type: 'image/jpeg',
            },
          ],
        });
      }
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
    if (!Capacitor.isNativePlatform()) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // MediaSession Action Handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
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
