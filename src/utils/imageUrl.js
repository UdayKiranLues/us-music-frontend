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
  if (!url) return null;

  // If it's already an absolute URL (http/https), return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a data URI (base64), return it
  if (url.startsWith('data:')) {
    return url;
  }

  // Hardcode fix for "Borrowed Time" cover - keep or remove based on needs
  // Removing as absolute URLs should now be handled correctly by backend

  const apiUrl = getBaseURL();

  // Fallback for mixed content: if we have a localhost:5000 URL in a non-localhost environment, replace it
  if (url.includes('localhost:5000') && !window.location.hostname.includes('localhost')) {
    return url.replace('http://localhost:5000', apiUrl);
  }

  // If the URL already includes the API URL, don't prepend it again
  if (url.startsWith(apiUrl)) {
    return url;
  }

  // Ensure url starts with / if it doesn't
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  return `${apiUrl}${normalizedPath}`;
};
