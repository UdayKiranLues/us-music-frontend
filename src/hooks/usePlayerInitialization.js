import { useEffect, useRef } from 'react';
import { NativeAudio } from '@capgo/native-audio';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { requestAllPermissions } from '@/utils/permissions';

/**
 * Hook to initialize mobile player on app startup
 * Handles permissions, background mode setup, and NativeAudio configuration
 */
export function usePlayerInitialization() {
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeApp = async () => {
      try {
        console.log('🎵 Initializing US Music app...');

        // Step 1: Request necessary permissions
        console.log('📋 Requesting permissions...');
        try {
          const permissions = await requestAllPermissions();
          console.log('✅ Permissions granted:', permissions);
        } catch (permErr) {
          console.warn('⚠️ Some permissions were denied:', permErr);
        }

        // Step 2: Initialize NativeAudio
        console.log('🔊 Initializing NativeAudio...');
        try {
          await NativeAudio.configure({
            backgroundPlayback: true,
            background: true,
            focus: true,
            showNotification: true,
          });
          console.log('✅ NativeAudio configured');
        } catch (audioErr) {
          console.warn('⚠️ NativeAudio configuration failed:', audioErr);
        }

        // Step 3: Enable background mode
        console.log('🔄 Enabling background mode...');
        try {
          await BackgroundMode.enable({
            title: 'US Music',
            text: 'Playing music in background',
            channelName: 'Music Playback',
            channelDescription: 'Allows music to continue playing when app is closed',
          });
          console.log('✅ Background mode enabled');
        } catch (bgErr) {
          console.warn('⚠️ Background mode failed:', bgErr);
        }

        console.log('✅ App initialization complete!');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      }
    };

    initializeApp();

    // Cleanup
    return () => {
      // Could disable background mode on unmount if needed
    };
  }, []);

  return null;
}

/**
 * Hook to handle background state changes
 */
export function useBackgroundState() {
  useEffect(() => {
    let bgListener = null;
    let fgListener = null;

    const setupListeners = async () => {
      try {
        bgListener = await BackgroundMode.addListener('appInBackground', async () => {
          console.log('📱 App moved to background');
          try {
            await BackgroundMode.disableWebViewOptimizations();
          } catch (err) {
            console.warn('Failed to disable web view optimizations:', err);
          }
        });

        fgListener = await BackgroundMode.addListener('appInForeground', async () => {
          console.log('📱 App moved to foreground');
          try {
            await BackgroundMode.enableWebViewOptimizations();
          } catch (err) {
            console.warn('Failed to enable web view optimizations:', err);
          }
        });
      } catch (err) {
        console.warn('Failed to setup background listeners:', err);
      }
    };

    setupListeners();

    return () => {
      bgListener?.remove?.();
      fgListener?.remove?.();
    };
  }, []);

  return null;
}
