import { getBaseURL } from './axios';

/**
 * Resolves the full URL for an image.
 * If the URL is relative (starts with /), it prepends the backend API URL.
 * Otherwise, it returns the URL as is.
 *
 * @param {string} url - The image URL to resolve.
 * @returns {string} - The resolved absolute URL.
 */
export const getImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  // If it's already an absolute URL (http/https), check for localhost in production
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const apiUrl = getBaseURL();
    // Fallback for mixed content: if we have a localhost:5000 URL in a non-localhost environment, replace it
    if (url.includes('localhost:5000') && !window.location.hostname.includes('localhost')) {
      return url.replace('http://localhost:5000', apiUrl);
    }
    return url;
  }

  // If it's a data URI (base64), return it
  if (url.startsWith('data:')) {
    return url;
  }

  const apiUrl = getBaseURL();

  // If the URL already includes the API URL, don't prepend it again
  if (url.startsWith(apiUrl)) {
    return url;
  }

  // Ensure url starts with / if it doesn't
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  return `${apiUrl}${normalizedPath}`;
};

/**
 * Resolves the cover image URL for both Songs and Podcasts.
 * Handles backend field name inconsistencies (coverImageUrl vs coverImage).
 * 
 * @param {Object} content - The song or podcast object.
 * @returns {string} - The resolved absolute URL or null.
 */
export const resolveCoverUrl = (content) => {
  if (!content) return null;

  // Try common field names
  const rawUrl = content.coverImageUrl || content.coverImage || content.coverUrl;

  return getImageUrl(rawUrl);
};
