# Mobile-First Design Guide
## US Music - Responsive Music Streaming Platform

Complete guide to the mobile-optimized user experience.

---

## Overview

US Music is designed mobile-first with a focus on touch interactions, performance, and a premium Spotify-style UI.

### Key Features
- **Bottom Navigation**: Easy one-handed navigation
- **Full-Screen Player**: Immersive playback experience
- **Swipe Gestures**: Intuitive controls
- **Touch-Friendly**: 44px minimum touch targets
- **Safe Area Support**: Works with iPhone notches
- **Glassmorphism UI**: Modern, premium aesthetics

---

## Components

### 1. Bottom Navigation (`BottomNav.jsx`)

Mobile-only navigation bar shown at bottom of screen.

**Features**:
- 4 tabs: Home, Search, Library, Profile
- Active state indicator (top border)
- Icon + label design
- Smooth animations
- Auto-hides on admin routes

**Usage**:
```jsx
import BottomNav from './components/mobile/BottomNav';

function App() {
  return (
    <>
      <Routes>...</Routes>
      <BottomNav />
    </>
  );
}
```

**Styling**:
- Height: 64px + safe-area-inset-bottom
- Hidden on screens > 1024px (lg breakpoint)
- Glass background with blur
- Z-index: 50

---

### 2. Mobile Player (`MobilePlayer.jsx`)

Full-screen player with swipe gestures.

**Features**:
- Swipe down to minimize
- Swipe left/right to change songs
- Large album art
- Progress bar with seek
- Play/pause, skip controls
- Volume control
- Favorite button

**Props**:
```typescript
interface MobilePlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}
```

**Swipe Gestures**:
- **Down**: Minimize player (velocity > 0.5)
- **Left**: Next song (velocity > 0.5)
- **Right**: Previous song (velocity > 0.5)

**Usage**:
```jsx
const { 
  currentSong, 
  isPlaying, 
  togglePlayPause, 
  playNext, 
  playPrevious 
} = usePlayer();

<MobilePlayer
  isOpen={isFullScreen}
  onClose={() => setIsFullScreen(false)}
  currentSong={currentSong}
  isPlaying={isPlaying}
  onPlayPause={togglePlayPause}
  onNext={playNext}
  onPrevious={playPrevious}
  currentTime={currentTime}
  duration={duration}
  onSeek={seekTo}
/>
```

---

### 3. Mini Player (`MiniPlayer.jsx`)

Compact player shown at bottom (above bottom nav).

**Features**:
- Album art thumbnail
- Song title & artist
- Play/pause button
- Favorite button
- Progress bar
- Tap to expand to full-screen

**Position**:
- Bottom: `calc(64px + env(safe-area-inset-bottom))`
- Above bottom navigation
- Z-index: 40

**Usage**:
```jsx
<MiniPlayer
  currentSong={currentSong}
  isPlaying={isPlaying}
  onPlayPause={togglePlayPause}
  onExpand={() => setIsFullScreen(true)}
  progress={progress}
  isFavorite={isFavorite}
  onToggleFavorite={toggleFavorite}
/>
```

---

## Design Tokens

### Mobile Constants

```javascript
export const mobile = {
  // Safe area insets (for notch devices)
  safeArea: {
    top: 'env(safe-area-inset-top)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
    right: 'env(safe-area-inset-right)',
  },
  
  // Bottom navigation height
  bottomNav: {
    height: '64px',
    heightWithSafeArea: 'calc(64px + env(safe-area-inset-bottom))',
  },
  
  // Player heights
  player: {
    mini: '72px',
    full: '100vh',
  },
  
  // Touch target minimum size (iOS/Android guidelines)
  touchTarget: {
    min: '44px',
  },
};
```

### Breakpoints

```javascript
export const breakpoints = {
  xs: '375px',    // Mobile small
  sm: '640px',    // Mobile
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Desktop large
  '2xl': '1536px', // Desktop extra large
};
```

**Show mobile UI**: `< 1024px` (lg breakpoint)  
**Show desktop UI**: `>= 1024px`

---

## Responsive Layout

### Page Structure

```jsx
<div className="pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0">
  {/* Page content */}
</div>

<MiniPlayer />
<BottomNav />
```

**Explanation**:
- Content has bottom padding to prevent overlap with mini player + bottom nav
- Mini player and bottom nav are fixed at bottom
- On desktop (lg+), no bottom padding needed

### Safe Area Insets

For iPhone X+ with notches:

```css
.mobile-header {
  padding-top: env(safe-area-inset-top);
}

.mobile-footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

**Apply to**:
- Top of full-screen player
- Bottom of bottom navigation
- Any fixed/absolute positioned elements at screen edges

---

## Touch Interactions

### Minimum Touch Target

Apple & Google guidelines: **44x44px minimum**

```jsx
<button
  style={{ 
    minWidth: mobile.touchTarget.min, 
    minHeight: mobile.touchTarget.min 
  }}
>
  <Icon size={24} />
</button>
```

### Gesture Zones

**Full-Screen Player**:
- **Header** (top 20%): Swipe down to minimize
- **Album Art** (center 60%): No gestures (prevent accidental swipes)
- **Controls** (bottom 20%): Tap interactions only

---

## Performance Optimization

### Mobile-Specific Optimizations

1. **Lazy Load Images**:
```jsx
<img 
  src={song.coverImageUrl} 
  loading="lazy"
  alt={song.title}
/>
```

2. **Virtual Lists** (for long song lists):
```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={window.innerHeight - 64}
  itemCount={songs.length}
  itemSize={80}
>
  {SongRow}
</FixedSizeList>
```

3. **Reduce Animations on Low-End Devices**:
```jsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

<motion.div
  animate={prefersReducedMotion ? {} : { scale: 1.1 }}
/>
```

4. **Compress Images**:
```html
<picture>
  <source srcset="cover-300.webp" type="image/webp" />
  <source srcset="cover-300.jpg" type="image/jpeg" />
  <img src="cover-300.jpg" alt="Album Cover" />
</picture>
```

---

## Testing

### Device Testing Matrix

| Device | Screen Size | Browser | Priority |
|--------|-------------|---------|----------|
| iPhone 14 Pro | 393×852 | Safari | High |
| iPhone SE | 375×667 | Safari | High |
| Samsung Galaxy S23 | 360×800 | Chrome | High |
| iPad Pro | 1024×1366 | Safari | Medium |
| Google Pixel 7 | 412×915 | Chrome | Medium |
| OnePlus 11 | 450×1000 | Chrome | Low |

### Test Cases

1. **Navigation**
   - [ ] Tap all bottom nav items
   - [ ] Active state shows correctly
   - [ ] Navigation transitions smooth

2. **Player**
   - [ ] Tap mini player to expand
   - [ ] Full-screen player animates in
   - [ ] Swipe down to minimize
   - [ ] Swipe left/right to change songs
   - [ ] Play/pause works
   - [ ] Seek bar draggable
   - [ ] Volume control works

3. **Gestures**
   - [ ] Swipe velocity threshold (>0.5)
   - [ ] No accidental swipes
   - [ ] Gesture conflicts with scroll resolved

4. **Layout**
   - [ ] No content behind notch
   - [ ] Bottom nav doesn't cover content
   - [ ] Mini player visible above nav
   - [ ] Safe area insets applied

5. **Performance**
   - [ ] Smooth 60fps animations
   - [ ] No jank on scroll
   - [ ] Images load progressively
   - [ ] Audio playback uninterrupted

---

## Common Issues & Solutions

### Issue: Content Hidden Behind Bottom Nav

**Solution**:
```jsx
<div className="pb-[calc(128px+env(safe-area-inset-bottom))] lg:pb-0">
  {/* Add padding for mini player (72px) + bottom nav (64px) */}
</div>
```

### Issue: Swipe Conflicts with Scroll

**Solution**: Use `preventScrollOnSwipe: true` in swipeable config:
```jsx
const swipeHandlers = useSwipeable({
  onSwipedDown: handleClose,
  preventScrollOnSwipe: true,
  trackMouse: false, // Disable on desktop
});
```

### Issue: Audio Playback Stops on iOS

**Solution**: Use native HLS support:
```jsx
if (audio.canPlayType('application/vnd.apple.mpegurl')) {
  // Safari native HLS
  audio.src = hlsUrl;
} else if (Hls.isSupported()) {
  // HLS.js for other browsers
  const hls = new Hls();
  hls.loadSource(hlsUrl);
  hls.attachMedia(audio);
}
```

### Issue: Notch Overlays Content

**Solution**: Add safe area CSS:
```css
.mobile-header {
  padding-top: max(20px, env(safe-area-inset-top));
}
```

---

## Progressive Web App (PWA)

### Manifest Configuration

```json
{
  "name": "US Music",
  "short_name": "US Music",
  "description": "Premium Music Streaming",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0ea5e9",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Offline Support)

```javascript
// Cache audio segments for offline playback
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('.ts')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

---

## Accessibility

### ARIA Labels

```jsx
<button aria-label="Play song" onClick={onPlay}>
  <Play size={24} />
</button>

<button aria-label="Add to favorites" onClick={onFavorite}>
  <Heart size={20} />
</button>
```

### Screen Reader Support

```jsx
<div role="region" aria-label="Music player">
  <h2 className="sr-only">Now Playing</h2>
  {/* Player content */}
</div>
```

### Focus Management

```jsx
// Trap focus in full-screen player
useEffect(() => {
  if (isOpen) {
    const firstButton = playerRef.current.querySelector('button');
    firstButton?.focus();
  }
}, [isOpen]);
```

---

## Future Enhancements

### Phase 1 (Q1 2024)
- [ ] Offline mode (PWA with Service Worker)
- [ ] Background audio playback
- [ ] Lock screen controls
- [ ] Share functionality

### Phase 2 (Q2 2024)
- [ ] Voice search
- [ ] Shake to shuffle
- [ ] Haptic feedback
- [ ] Dark/Light theme toggle

### Phase 3 (Q3 2024)
- [ ] Android native app
- [ ] iOS native app
- [ ] CarPlay integration
- [ ] Wear OS support

---

## Resources

- **React Swipeable**: https://github.com/FormidableLabs/react-swipeable
- **Framer Motion**: https://www.framer.com/motion/
- **HLS.js**: https://github.com/video-dev/hls.js/
- **iOS Design Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Material Design**: https://m3.material.io/

---

**Last Updated**: January 2024  
**Version**: 1.0.0
