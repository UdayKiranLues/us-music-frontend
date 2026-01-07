# US Music - Feature Guide

## 🎯 Quick Start

The application is now running at **http://localhost:5174**

## 🎵 How to Use

### Navigation
- Use the **left sidebar** to navigate between pages
- On mobile, tap the **☰ menu** icon to open the sidebar

### Home Page
1. **Hero Section** - Welcome banner with exploration CTA
2. **Trending Now** - Most popular tracks displayed as cards
3. **Recommended for You** - Personalized song recommendations
4. **All Songs** - Complete music library in list format

**Actions:**
- Click any song card to start playing
- Hover over cards to see play button
- Click ❤️ to add to favorites

### Search Page
1. **Search Bar** - Type to search songs, artists, or albums in real-time
2. **Genre Filters** - Filter by music genre (Pop, Rock, Hip Hop, etc.)
3. **View Toggle** - Switch between grid and list views
4. **Results** - Shows filtered songs with count

**Tips:**
- Search is case-insensitive
- Combine search text with genre filters
- Clear search with the ✕ button

### Library Page
1. **Liked Songs** - All your favorited tracks
2. **Playlists** - Pre-made playlists with song previews
3. **Statistics** - Visual stats of your music collection

**Features:**
- View all liked songs in one place
- Browse curated playlists
- See total songs, likes, and playlists

### History Page
1. **Listening History** - Recently played songs
2. **Stats Overview** - Music journey statistics
3. **Top Genres** - Most played genres

**Actions:**
- Replay any song from history
- Clear history (button available)
- View genre play counts

### Music Player (Bottom Bar)
**Controls:**
- ▶️ **Play/Pause** - Toggle playback
- ⏮️ **Previous** - Go to previous song
- ⏭️ **Next** - Skip to next song
- **Progress Bar** - Click to seek to specific time
- 🔊 **Volume Slider** - Adjust volume (desktop only)
- ❤️ **Favorite** - Like/unlike current song

**Features:**
- Always visible at the bottom
- Shows current song info and album art
- Displays current time and total duration
- Auto-plays similar songs when current ends

## 🎨 Design Features

### Visual Effects
- **Glassmorphism** - Frosted glass effect on cards
- **Gradients** - Blue, orange, and red color scheme
- **Animations** - Smooth transitions and hover effects
- **Responsive** - Works on desktop, tablet, and mobile

### Color Theme
- Deep blue primary color for premium feel
- Orange and red accents for energy
- Dark navy/black backgrounds
- Translucent overlays with blur effects

## ⌨️ Keyboard Shortcuts
- **Click song card** - Play song
- **Click progress bar** - Seek to position
- **Click genre filter** - Filter by genre
- **Type in search** - Live search

## 📱 Mobile Experience
- Hamburger menu for navigation
- Touch-optimized controls
- Responsive grid layouts
- Swipe-friendly interface

## 🔧 Technical Features

### State Management
- Global player state using React Context
- Persistent favorites list
- Automatic history tracking
- Queue management

### Smart Features
- **Auto-play** - Plays similar songs when current ends
- **Live Search** - Real-time filtering
- **Genre Matching** - Suggests songs from same genre
- **History Tracking** - Automatic play history

### Performance
- Optimized animations with Framer Motion
- Lazy loading for smooth scrolling
- Efficient state updates
- Fast navigation with React Router

## 🚀 Development Features

### Ready for Backend
The app structure is ready for API integration:
- Mock data in `src/data/mockData.js`
- Replace with fetch/axios calls
- Context API ready for async operations
- Modular component structure

### Customization
Easy to customize:
- **Colors** - Edit `tailwind.config.js`
- **Mock Data** - Edit `src/data/mockData.js`
- **Animations** - Modify Framer Motion configs
- **Layout** - Adjust component styling

## 🎯 Best Practices Used

1. **Component Reusability** - SongCard and SongList used across pages
2. **State Management** - Centralized with Context API
3. **Responsive Design** - Mobile-first approach
4. **Accessibility** - Semantic HTML and ARIA labels
5. **Performance** - Optimized renders and animations
6. **Code Organization** - Clear folder structure
7. **Modern React** - Hooks and functional components

## 💡 Tips

1. **Like songs** to build your favorites collection
2. **Explore genres** using search filters
3. **Check history** to replay recent songs
4. **Use playlists** for organized listening
5. **Volume control** available on desktop

## 🐛 Known Limitations

- Audio URLs are demo placeholders (SoundHelix)
- No user authentication (can be added)
- No backend persistence (local state only)
- Limited to mock data (16 songs)

## 🔜 Future Enhancements

Potential features to add:
- User authentication and profiles
- Backend API integration
- Create custom playlists
- Share songs and playlists
- Lyrics display
- Equalizer controls
- Download for offline
- Social features (comments, sharing)
- Artist pages
- Album pages
- Queue management UI
- Shuffle and repeat modes

---

Enjoy your music streaming experience with **US Music**! 🎵🎧
