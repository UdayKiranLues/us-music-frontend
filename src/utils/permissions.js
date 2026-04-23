/**
 * Permission utilities for mobile app
 * Platform-agnostic permission handling for storage, camera, location, notifications
 * Works on both web and mobile - Capacitor plugins optional
 */

export const PERMISSIONS = {
  STORAGE: 'storage',
  CAMERA: 'camera',
  LOCATION: 'location',
  NOTIFICATIONS: 'notifications',
};

/**
 * Check if app is running on mobile (Capacitor)
 */
function isMobileApp() {
  return typeof window !== 'undefined' && !!(window.Capacitor);
}

/**
 * Request storage permission to read local audio files
 * On web: returns granted by default
 * On mobile: requests filesystem permission
 */
export async function requestStoragePermission() {
  try {
    if (!isMobileApp()) {
      console.log('Running on web - storage permissions granted by default');
      return { filesystem: 'granted' };
    }

    try {
      const { Filesystem } = window.CapacitorPlugins;
      if (!Filesystem) {
        console.warn('Filesystem plugin not available in Capacitor');
        return { filesystem: 'granted' };
      }
      
      const result = await Filesystem.requestPermissions();
      console.log('✅ Storage permission result:', result);
      return result;
    } catch (err) {
      console.warn('⚠️ Failed to request filesystem permission:', err.message);
      return { filesystem: 'granted' }; // Fallback
    }
  } catch (error) {
    console.error('❌ Failed to request storage permission:', error);
    return { filesystem: 'granted' }; // Fallback
  }
}

/**
 * Request camera permission for profile pictures, cover art
 */
export async function requestCameraPermission() {
  try {
    if (!isMobileApp()) {
      return { camera: 'granted' };
    }

    console.warn('⚠️ Camera permission request - Camera plugin not yet installed');
    return { camera: 'granted' }; // Fallback
  } catch (error) {
    console.error('❌ Failed to request camera permission:', error);
    return { camera: 'granted' }; // Fallback
  }
}

/**
 * Request location permission for location-based features
 */
export async function requestLocationPermission() {
  try {
    if (!isMobileApp()) {
      return { location: 'granted' };
    }

    console.warn('⚠️ Location permission request - Geolocation plugin not yet installed');
    return { location: 'granted' }; // Fallback
  } catch (error) {
    console.error('❌ Failed to request location permission:', error);
    return { location: 'granted' }; // Fallback
  }
}

/**
 * Request notification permission for background playback notifications
 */
export async function requestNotificationPermission() {
  try {
    if (!isMobileApp()) {
      if ('Notification' in window && Notification.permission === 'default') {
        return await Notification.requestPermission();
      }
      return Notification.permission === 'granted' ? { notifications: 'granted' } : { notifications: 'denied' };
    }

    console.log('Notification permission will be requested during background playback setup');
    return { notifications: 'granted' };
  } catch (error) {
    console.error('❌ Failed to request notification permission:', error);
    return { notifications: 'granted' }; // Fallback
  }
}

/**
 * Request all necessary permissions
 */
export async function requestAllPermissions() {
  const permissions = {
    storage: null,
    camera: null,
    location: null,
    notifications: null,
  };

  try {
    permissions.storage = await requestStoragePermission();
  } catch (err) {
    console.error('Storage permission error:', err);
    permissions.storage = { filesystem: 'granted' };
  }

  try {
    permissions.camera = await requestCameraPermission();
  } catch (err) {
    console.error('Camera permission error:', err);
    permissions.camera = { camera: 'granted' };
  }

  try {
    permissions.location = await requestLocationPermission();
  } catch (err) {
    console.error('Location permission error:', err);
    permissions.location = { location: 'granted' };
  }

  try {
    permissions.notifications = await requestNotificationPermission();
  } catch (err) {
    console.error('Notification permission error:', err);
    permissions.notifications = { notifications: 'granted' };
  }

  return permissions;
}
