# Song Upload & Playback - Implementation Complete ✅

## Overview
Full end-to-end song upload and playback system has been implemented with proper frontend-backend integration.

## Architecture

### Upload Flow
```
User → Upload Form → Backend API → FFmpeg (MP3→HLS) → AWS S3 → MongoDB → Response → Frontend
```

### Playback Flow
```
User → Song List → Click Play → Fetch Secure URL → HLS.js Player → Stream from S3/CloudFront
```

---

## Backend Implementation

### 1. Upload Endpoint
**File**: `backend/src/routes/upload.js`
- **Endpoint**: `POST /api/v1/upload/song-with-cover`
- **Auth**: Required (Bearer token)
- **Access**: Artist/Admin only
- **Middleware**: Multer for multipart/form-data

**Request Body**:
```javascript
{
  audio: File (MP3),        // Required
  cover: File (Image),      // Optional
  title: String,            // Required
  artist: String,           // Required
  album: String,            // Optional
  genre: String,            // Required
  language: String,         // Required
  mood: String,             // Optional
  bpm: Number              // Optional
}
```

**Controller**: `backend/src/controllers/uploadController.js`
- Validates audio file
- Extracts metadata (duration, bitrate, etc.)
- Converts MP3 to HLS using FFmpeg
- Uploads HLS files to S3
- Uploads cover image to S3 (if provided)
- Saves song metadata to MongoDB
- Returns song object with URLs

### 2. Songs List Endpoint
**Endpoint**: `GET /api/v1/songs`
- Returns all uploaded songs
- No authentication required (public)
- Includes pagination support

**Response**:
```json
{
  "success": true,
  "data": {
    "songs": [
      {
        "_id": "...",
        "title": "Song Title",
        "artist": "Artist Name",
        "album": "Album Name",
        "genre": ["Pop"],
        "mood": ["Happy"],
        "bpm": 120,
        "duration": 210,
        "hlsUrl": "https://s3.../playlist.m3u8",
        "coverImageUrl": "https://s3.../cover.jpg",
        "totalPlays": 0,
        "createdAt": "..."
      }
    ]
  }
}
```

### 3. Streaming Endpoint
**Endpoint**: `GET /api/v1/songs/:id/stream`
- Returns secure signed URL for HLS streaming
- CloudFront signed URL (if configured)
- Fallback to S3 presigned URL
- 1-hour expiration

### 4. Database Schema
**Model**: `backend/src/models/Song.js`

```javascript
{
  title: String (required, indexed),
  artist: String (required, indexed),
  album: String (optional, indexed),
  genre: [String] (required, indexed),
  mood: [String] (optional, indexed),
  bpm: Number (0-300),
  language: String (required),
  duration: Number (required, in seconds),
  hlsUrl: String (required, .m3u8 file),
  coverImageUrl: String (required),
  totalPlays: Number (default: 0),
  uniqueListeners: Number (default: 0),
  popularity: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### 5. FFmpeg Service
**File**: `backend/src/services/ffmpegService.js`

**Features**:
- Converts MP3 to HLS format
- AAC audio codec, 128kbps
- 10-second segments
- Compatible with HLS.js
- Extracts metadata (duration, bitrate, sample rate)

### 6. S3 Service
**File**: `backend/src/utils/s3.js`

**Functions**:
- `uploadHLSToS3()` - Upload all HLS files (playlist + segments)
- `uploadToS3()` - Upload cover images
- `getSecureStreamingUrl()` - Generate signed URLs

---

## Frontend Implementation

### 1. Upload Page
**File**: `src/pages/admin/Upload.jsx`

**Features**:
- ✅ Audio file upload (MP3)
- ✅ Cover image upload (optional)
- ✅ Form fields: title, artist, album, genre, language, mood, bpm
- ✅ Multipart/form-data submission
- ✅ Upload progress tracking
- ✅ Success/error notifications
- ✅ Form reset after successful upload

**API Call**:
```javascript
POST /api/v1/upload/song-with-cover
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### 2. Songs Admin Page
**File**: `src/pages/admin/Songs.jsx`

**Features**:
- ✅ Fetch songs from API
- ✅ Display songs in table
- ✅ Search by title/artist
- ✅ Filter by genre
- ✅ Play song on click
- ✅ Delete song
- ✅ Loading/error states
- ✅ Refresh button

### 3. Home Page
**File**: `src/pages/Home.jsx`

**Features**:
- ✅ Fetch songs from API
- ✅ Display trending songs
- ✅ Display recommended songs
- ✅ Grid layout with SongCard components
- ✅ Loading states

### 4. Song Card Component
**File**: `src/components/common/SongCard.jsx`

**Updates**:
- ✅ Uses `song._id` instead of `song.id`
- ✅ Uses `song.coverImageUrl` instead of `song.coverUrl`
- ✅ Formats duration from seconds
- ✅ Handles array genres
- ✅ Integrates with PlayerContext

### 5. Player Context
**File**: `src/context/PlayerContext.jsx`

**Features**:
- ✅ HLS.js integration
- ✅ Fetch secure streaming URLs
- ✅ Auto-refresh URLs before expiration
- ✅ Play/pause/skip controls
- ✅ Queue management
- ✅ Error recovery

**Key Functions**:
```javascript
fetchSecureStreamUrl(songId)   // Get signed URL from backend
initializeHLS(url)             // Setup HLS.js player
playSong(song, autoPlay)       // Play song
replaceQueue(songs, index)     // Replace queue and play
```

---

## API Configuration

### Environment Variables

**Backend** (`.env`):
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/us-music

# JWT
JWT_SECRET=your-secret-key

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=us-music-audio

# CloudFront (Optional)
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=APKA...
CLOUDFRONT_PRIVATE_KEY_PATH=./cloudfront-private-key.pem

# CORS
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000
```

---

## Testing the Flow

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

Backend should be running on `http://localhost:5000`

### 2. Start Frontend
```bash
cd ../
npm install
npm run dev
```

Frontend should be running on `http://localhost:5173`

### 3. Login as Admin
Navigate to: `http://localhost:5173/login`
- Use admin credentials from your database

### 4. Upload a Song
Navigate to: `http://localhost:5173/admin/upload`

**Steps**:
1. Click "Drop audio file here" and select an MP3 file
2. Fill in metadata:
   - Title: "Test Song"
   - Artist: "Test Artist"
   - Genre: "Pop"
   - Language: "English"
   - (Optional) Album, Mood, BPM
3. (Optional) Upload cover image
4. Click "Upload Song"
5. Wait for upload progress to complete
6. Success message should appear

### 5. View Uploaded Songs

**Admin Page**:
- Navigate to: `http://localhost:5173/admin/songs`
- Should see uploaded song in table
- Click play icon to test playback

**Home Page**:
- Navigate to: `http://localhost:5173`
- Should see song in "Trending Now" or "Recommended for You"
- Click song card to play

### 6. Test Playback
- Click any song to play
- Should see player controls at bottom
- Audio should stream using HLS.js
- Check browser console for HLS events

---

## CORS Configuration

**Backend**: `backend/src/app.js`
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**Frontend API calls**: All use `${API_URL}/api/v1/...`

---

## Error Handling

### Backend Errors
- ✅ File validation (audio/mpeg only)
- ✅ Missing required fields
- ✅ FFmpeg conversion errors
- ✅ S3 upload errors
- ✅ Database errors
- ✅ Multer errors (file size, type)

### Frontend Errors
- ✅ Network errors
- ✅ Invalid file types
- ✅ Missing required fields
- ✅ API errors with user-friendly messages
- ✅ Upload progress tracking

---

## Production Checklist

### Backend
- [ ] Set production environment variables
- [ ] Configure AWS S3 bucket (private ACL)
- [ ] Set up CloudFront distribution
- [ ] Generate CloudFront key pair
- [ ] Configure MongoDB Atlas
- [ ] Enable rate limiting
- [ ] Set up file size limits
- [ ] Configure CORS for production domain
- [ ] Set up logging and monitoring
- [ ] Add Redis for caching

### Frontend
- [ ] Update VITE_API_URL to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Deploy to hosting (Vercel/Netlify)
- [ ] Configure CDN
- [ ] Enable gzip compression
- [ ] Add error tracking (Sentry)
- [ ] Test on mobile devices

### AWS Setup
- [ ] Create S3 bucket with private access
- [ ] Enable S3 bucket versioning
- [ ] Set up S3 lifecycle policies
- [ ] Create CloudFront distribution
- [ ] Configure CloudFront signed URLs
- [ ] Set up CloudFront SSL certificate
- [ ] Configure CloudFront caching

---

## File Structure

```
us-music/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── uploadController.js      ✅ Upload logic
│   │   ├── routes/
│   │   │   ├── upload.js                ✅ Upload routes
│   │   │   └── songRoutes.js            ✅ Song CRUD
│   │   ├── models/
│   │   │   └── Song.js                  ✅ MongoDB schema
│   │   ├── services/
│   │   │   ├── ffmpegService.js         ✅ MP3→HLS
│   │   │   └── cloudFrontService.js     ✅ Signed URLs
│   │   ├── utils/
│   │   │   └── s3.js                    ✅ S3 operations
│   │   └── middleware/
│   │       └── upload.js                ✅ Multer config
│   └── uploads/                         (temp HLS files)
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Upload.jsx               ✅ Upload form
│   │   │   └── Songs.jsx                ✅ Songs list
│   │   └── Home.jsx                     ✅ Homepage
│   ├── components/
│   │   └── common/
│   │       └── SongCard.jsx             ✅ Song display
│   └── context/
│       └── PlayerContext.jsx            ✅ HLS.js player
└── docs/
    └── UPLOAD_IMPLEMENTATION.md         ✅ This file
```

---

## Known Issues & Solutions

### Issue 1: FFmpeg not installed
**Error**: `FFmpeg not found`
**Solution**: Install FFmpeg
```bash
# Windows (using Chocolatey)
choco install ffmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

### Issue 2: AWS credentials not configured
**Error**: `Missing AWS credentials`
**Solution**: Add to `.env` file:
```env
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
```

### Issue 3: MongoDB connection failed
**Error**: `Failed to connect to MongoDB`
**Solution**: Ensure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS/Linux
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### Issue 4: CORS errors
**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`
**Solution**: Check backend CORS config matches frontend URL

### Issue 5: Upload stuck at 100%
**Possible cause**: FFmpeg conversion taking time (large files)
**Solution**: Check backend console for FFmpeg progress logs

---

## Next Steps

1. **Test Upload**:
   - Upload test MP3 file
   - Verify S3 upload
   - Verify MongoDB entry

2. **Test Playback**:
   - Play song from admin page
   - Play song from home page
   - Verify HLS streaming

3. **Production Setup**:
   - Configure AWS S3/CloudFront
   - Set production environment variables
   - Deploy backend and frontend

4. **Enhancements**:
   - Add batch upload
   - Add progress for FFmpeg conversion
   - Add audio waveform visualization
   - Add metadata extraction from MP3 tags
   - Add album art extraction
   - Add duplicate detection

---

## Support

For issues, check:
1. Backend console logs
2. Frontend browser console
3. Network tab in DevTools
4. MongoDB logs
5. AWS S3 bucket access

## Status: ✅ READY FOR TESTING

All components are implemented and integrated. Follow the testing steps above to verify end-to-end functionality.
