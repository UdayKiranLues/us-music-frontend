import { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getLocalSongs, localFileSongObject, handleFileInput } from '@/utils/localAudio';
import { Music, Upload, Folder } from 'lucide-react';

/**
 * Local Songs Component
 * Browse and play local audio files from device storage
 */
export default function LocalSongs() {
  const { playSong, replaceQueue } = usePlayer();
  const [localSongs, setLocalSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Browse device storage for local songs
  const browseLocalMusic = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📂 Browsing local music...');
      const songs = await getLocalSongs();
      setLocalSongs(songs);
      console.log(`✅ Found ${songs.length} songs`);
    } catch (err) {
      console.error('❌ Failed to browse local music:', err);
      setError(`Failed to access local files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload from HTML input
  const handleFileUpload = async (event) => {
    try {
      const files = handleFileInput(event);
      console.log(`📂 Selected ${files.length} audio files`);

      const songObjects = await Promise.all(
        files.map((file) => localFileSongObject(file))
      );

      // Add to current list
      setLocalSongs((prev) => [...prev, ...songObjects.map((s) => ({ 
        name: s.title, 
        songObject: s 
      }))]);

      // Play first song from selection if available
      if (songObjects.length > 0) {
        replaceQueue(songObjects);
      }
    } catch (err) {
      console.error('❌ File upload failed:', err);
      setError(`Failed to load files: ${err.message}`);
    }
  };

  // Play a local song
  const playLocalSong = async (songData) => {
    try {
      let song;

      if (songData.songObject) {
        song = songData.songObject;
      } else {
        song = await localFileSongObject(songData);
      }

      console.log('🎵 Playing local song:', song.title);
      await playSong(song);
    } catch (err) {
      console.error('❌ Failed to play local song:', err);
      setError(`Failed to play song: ${err.message}`);
    }
  };

  useEffect(() => {
    // Auto-load local songs on component mount
    browseLocalMusic();
  }, []);

  return (
    <div className="bg-neutral-900 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-accent-orange" />
          <h2 className="text-xl font-bold text-white">Local Songs</h2>
        </div>
        <button
          onClick={browseLocalMusic}
          disabled={isLoading}
          className="px-4 py-2 bg-accent-orange text-black rounded-lg font-semibold hover:bg-accent-orange/90 disabled:opacity-50"
        >
          {isLoading ? 'Scanning...' : 'Scan Device'}
        </button>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="flex items-center gap-2 px-4 py-3 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition-colors">
          <Upload className="w-5 h-5 text-accent-orange" />
          <span className="text-white font-medium">Choose Audio Files</span>
          <input
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-neutral-400">Scanning device storage...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && localSongs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Music className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-neutral-400">No local songs found</p>
          <p className="text-neutral-500 text-sm mt-2">
            Upload audio files or scan your device for music
          </p>
        </div>
      )}

      {/* Songs List */}
      {!isLoading && localSongs.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {localSongs.map((song, idx) => (
            <button
              key={`local-song-${idx}`}
              onClick={() => playLocalSong(song)}
              className="w-full text-left px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Music className="w-4 h-4 text-accent-orange flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {song.name || song.songObject?.title || 'Unknown'}
                  </p>
                  <p className="text-neutral-400 text-sm">
                    {song.directoryName || 'Local File'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
