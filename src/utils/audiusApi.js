import axios from 'axios';

let audiusHost = null;

/**
 * Fetch the first available Audius API host.
 * This should be called once when the app loads or on demand.
 */
export const getAudiusHost = async () => {
  if (audiusHost) return audiusHost;

  try {
    const response = await axios.get('https://api.audius.co');
    if (response.data && response.data.data && response.data.data.length > 0) {
      audiusHost = response.data.data[0];
      return audiusHost;
    }
    throw new Error('No Audius host found');
  } catch (error) {
    console.error('Failed to fetch Audius host:', error);
    // Fallback host if dynamic resolution fails
    return 'https://discoveryprovider.audius.co';
  }
};

/**
 * Fetch trending tracks from Audius API.
 */
export const getTrendingTracks = async () => {
  const host = await getAudiusHost();
  try {
    const response = await axios.get(`${host}/v1/tracks/trending`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch trending Audius tracks:', error);
    return [];
  }
};

/**
 * Search tracks on Audius API.
 * @param {string} query Search query string
 */
export const searchTracks = async (query) => {
  if (!query) return [];
  
  const host = await getAudiusHost();
  try {
    const response = await axios.get(`${host}/v1/tracks/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to search Audius tracks:', error);
    return [];
  }
};

/**
 * Format an Audius track so it matches the app's Song model locally.
 * This makes it easier to inject into existing UI components.
 */
export const formatAudiusTrack = (track) => {
  let coverImage = 'https://via.placeholder.com/300';
  if (track.artwork && track.artwork['480x480']) {
    coverImage = track.artwork['480x480'];
  } else if (track.artwork && track.artwork['150x150']) {
    coverImage = track.artwork['150x150'];
  }
  
  return {
    _id: `audius-${track.id}`, // prefix ID so we know it's an Audius track
    taskId: track.id,          // the raw string ID for API requests
    title: track.title,
    artist: track.user?.name || 'Unknown Artist',
    album: 'Single',
    duration: track.duration,
    coverImageUrl: coverImage,
    genre: [track.genre || 'Other'],
    isAudius: true             // flag for the player
  };
};

/**
 * Get direct stream URL for an Audius track.
 * @param {string} trackId 
 */
export const getAudiusStreamUrl = async (trackId) => {
  const host = await getAudiusHost();
  return `${host}/v1/tracks/${trackId}/stream`;
};
