/**
 * Local audio file utilities
 * Platform-agnostic local audio handling for web and mobile
 * Works without requiring Capacitor plugins
 */

function isMobileApp() {
  return typeof window !== 'undefined' && !!(window.Capacitor);
}

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.aac'];
const MUSIC_DIRECTORIES = [
  { path: 'Music', name: 'Music' },
  { path: 'Download', name: 'Downloads' },
  { path: 'Documents', name: 'Documents' },
];

/**
 * Check if a file is an audio file
 */
export function isAudioFile(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return AUDIO_EXTENSIONS.includes(ext);
}

/**
 * Get metadata from local audio file (basic)
 * Note: Full metadata requires metadata-reading library like music-metadata-browser
 */
export function getLocalSongMetadata(file) {
  return {
    _id: `local_${Date.now()}_${Math.random()}`,
    id: `local_${Date.now()}_${Math.random()}`,
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
    artist: 'Local File',
    album: 'Local Library',
    duration: 0, // Will be updated when audio loads
    source: 'local',
    path: file.path,
    file: file,
  };
}

/**
 * Convert File object to data URL for playback
 */
export async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Browse local music directory
 */
export async function browseLocalMusic(directoryPath = 'Music') {
  try {
    if (!isMobileApp()) {
      console.warn('Local music browsing only available on mobile');
      return [];
    }

    // Try to use Capacitor Filesystem plugin if available
    if (!window.CapacitorPlugins?.Filesystem) {
      console.warn('⚠️ Filesystem plugin not available');
      return [];
    }

    const { Filesystem, Directory } = window.CapacitorPlugins;
    const result = await Filesystem.readdir({
      path: directoryPath,
      directory: Directory.Documents,
    });

    const audioFiles = result.files
      .filter((file) => isAudioFile(file.name) && !file.type)
      .map((file) => ({
        name: file.name,
        path: `${directoryPath}/${file.name}`,
      }));

    return audioFiles;
  } catch (error) {
    console.error('Error browsing local music:', error);
    return [];
  }
}

/**
 * Get local songs from common music directories
 */
export async function getLocalSongs() {
  try {
    if (!isMobileApp()) {
      console.warn('Local songs browsing only available on mobile');
      return [];
    }

    const allSongs = [];

    for (const dir of MUSIC_DIRECTORIES) {
      try {
        const songs = await browseLocalMusic(dir.path);
        allSongs.push(
          ...songs.map((song) => ({
            ...song,
            directoryName: dir.name,
          }))
        );
      } catch (err) {
        console.warn(`Failed to read ${dir.name}:`, err);
      }
    }

    return allSongs;
  } catch (error) {
    console.error('Error getting local songs:', error);
    return [];
  }
}

/**
 * Read local file and convert to playable format
 */
export async function readLocalAudioFile(filePath) {
  try {
    if (!isMobileApp() || !window.CapacitorPlugins?.Filesystem) {
      throw new Error('Filesystem plugin not available');
    }

    const { Filesystem, Directory } = window.CapacitorPlugins;
    const data = await Filesystem.readFile({
      path: filePath,
      directory: Directory.Documents,
    });

    const blob = new Blob([data.data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error reading local audio file:', error);
    throw error;
  }
}

/**
 * Handle file input from HTML file picker (for web/browser)
 */
export function handleFileInput(event) {
  const files = event.target.files;
  const audioFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (isAudioFile(file.name)) {
      audioFiles.push({
        name: file.name,
        file: file,
        dataUrl: null, // Will be loaded on demand
      });
    }
  }

  return audioFiles;
}

/**
 * Convert local file to song object for player
 */
export async function localFileSongObject(file) {
  let audioUrl = null;

  // For File objects from input, use createObjectURL
  if (file instanceof File) {
    audioUrl = URL.createObjectURL(file);
  } else if (file.dataUrl) {
    audioUrl = file.dataUrl;
  } else {
    // Try to read from filesystem
    try {
      audioUrl = await readLocalAudioFile(file.path);
    } catch (err) {
      console.error('Failed to create audio URL:', err);
      throw err;
    }
  }

  return {
    _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: file.name ? file.name.replace(/\.[^/.]+$/, '') : 'Unknown Track',
    artist: 'Local File',
    album: 'Local Library',
    duration: 0, // Will be set when loaded
    source: 'local',
    audioUrl: audioUrl, // Use audioUrl instead of streamUrl for HTML5 playback
    coverUrl: null,
    isLocal: true,
    originalFile: file,
  };
}
