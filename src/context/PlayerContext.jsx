import { createContext, useContext, useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import axios from 'axios';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null);
  const [urlExpiresAt, setUrlExpiresAt] = useState(null);

  const audioRef = useRef(new Audio());
  const hlsRef = useRef(null);
  const urlRefreshTimerRef = useRef(null);

  /**
   * Fetch secure streaming URL from backend - CloudFront ONLY
   */
  const fetchSecureStreamUrl = async (songId) => {
    try {
      // Validate song ID
      if (!songId || songId === 'undefined' || songId === 'null') {
        throw new Error('Invalid song ID');
      }

      console.log(`🔍 Fetching stream URL for song: ${songId}`);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/songs/${songId}/stream`
      );

      const { streamUrl } = response.data.data;

      if (!streamUrl) {
        throw new Error('No stream URL returned');
      }

      // === VALIDATE STREAMING URL ===
      const isProxyUrl = streamUrl.includes('localhost') || streamUrl.includes('127.0.0.1');
      const isS3Url = streamUrl.includes('s3.amazonaws.com') || streamUrl.match(/s3\.[a-z0-9-]+\.amazonaws/);
      const isCloudFront = streamUrl.includes('cloudfront.net');

      if (!isProxyUrl && !isCloudFront && !isS3Url) {
        console.error('❌ REJECTED: Invalid streaming URL');
        console.error('   URL:', streamUrl.substring(0, 80) + '...');
        throw new Error('Invalid streaming URL format');
      }

      if (isProxyUrl) {
        console.log('✅ Using backend proxy (no CORS issues)');
      } else if (isS3Url && !isCloudFront) {
        console.warn('⚠️  Using S3 URL (development fallback)');
        console.warn('   Configure CloudFront for production!');
      } else if (isCloudFront) {
        console.log('✅ CloudFront URL validated');
      }

      console.log('   URL:', streamUrl.substring(0, 80) + '...');

      setStreamUrl(streamUrl);
      return streamUrl;
    } catch (error) {
      console.error('❌ Failed to fetch stream URL:', error.message);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          throw new Error('Invalid song ID');
        } else if (status === 404) {
          throw new Error('Song not found');
        } else if (status === 422) {
          throw new Error('HLS stream not available');
        } else if (status === 503) {
          throw new Error('Streaming service not configured');
        }
      }
      
      throw error;
    }
  };

  /**
   * Initialize HLS player with error recovery
   */
  const initializeHLS = (url) => {
    const audio = audioRef.current;

    // Cleanup existing HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    // Check HLS support
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
          xhr.timeout = 20000;
        },
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        manifestLoadingRetryDelay: 1000,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 3,
        levelLoadingRetryDelay: 1000,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
      });

      hls.loadSource(url);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest loaded');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('❌ HLS fatal error:', data.type, data.details);
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('🔄 Retrying...');
              hls.startLoad();
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🔄 Recovering media error...');
              hls.recoverMediaError();
              break;
              
            default:
              console.error('💥 Cannot recover from error');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      audio.src = url;
    } else {
      console.error('❌ HLS not supported in this browser');
    }
  };

  /**
   * Play song - validates and plays
   */
  const playSong = async (song, autoPlay = true) => {
    try {
      console.log('\n🎵 Play Song Request');

      // Validate song object
      if (!song) {
        throw new Error('Invalid song: Song object is missing');
      }

      const songId = song._id || song.id;
      if (!songId) {
        throw new Error('Invalid song: Missing ID');
      }

      console.log(`   Song: "${song.title}" by ${song.artist}`);
      console.log(`   ID: ${songId}`);

      setCurrentSong(song);

      // Fetch CloudFront stream URL
      const url = await fetchSecureStreamUrl(songId);

      if (!url) {
        throw new Error('Failed to get stream URL');
      }

      // Initialize HLS player
      initializeHLS(url);

      if (autoPlay) {
        setTimeout(() => {
          audioRef.current.play();
          setIsPlaying(true);
        }, 100);
      }
    } catch (error) {
      console.error('❌ Failed to play song:', error.message);
      setIsPlaying(false);
    }
  };

  /**
   * Play/Pause toggle
   */
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  /**
   * Seek to position
   */
  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  /**
   * Change volume
   */
  const changeVolume = (newVolume) => {
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  /**
   * Play next song
   */
  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playSong(queue[nextIndex]);
    }
  };

  /**
   * Play previous song
   */
  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      playSong(queue[prevIndex]);
    }
  };

  /**
   * Add songs to queue
   */
  const addToQueue = (songs) => {
    setQueue((prev) => [...prev, ...songs]);
  };

  /**
   * Replace queue
   */
  const replaceQueue = (songs, startIndex = 0) => {
    setQueue(songs);
    setCurrentIndex(startIndex);
    if (songs[startIndex]) {
      playSong(songs[startIndex]);
    }
  };

  /**
   * Toggle full-screen player
   */
  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (urlRefreshTimerRef.current) {
        clearTimeout(urlRefreshTimerRef.current);
      }
      audioRef.current.pause();
    };
  }, []);

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    currentIndex,
    isFullScreen,
    playSong,
    togglePlayPause,
    seekTo,
    changeVolume,
    playNext,
    playPrevious,
    addToQueue,
    replaceQueue,
    toggleFullScreen,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
