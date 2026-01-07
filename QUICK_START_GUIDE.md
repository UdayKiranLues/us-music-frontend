# 🚀 Quick Start - Upload & Play Songs

## ⚡ Fast Track (5 minutes)

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend (new terminal)
```bash
npm run dev
```

### 3. Login
- Navigate to: http://localhost:5173/login
- Use admin credentials

### 4. Upload Song
- Go to: http://localhost:5173/admin/upload
- Select MP3 file
- Fill: Title, Artist, Genre, Language
- Click "Upload Song"
- Wait for success message ✅

### 5. Play Song
- Go to: http://localhost:5173/admin/songs
- Click play icon on any song
- Or visit home page: http://localhost:5173

---

## 📋 Prerequisites

- ✅ Node.js 18+
- ✅ MongoDB running
- ✅ FFmpeg installed
- ✅ AWS S3 configured (optional for local test)

### Install FFmpeg

**Windows:** `choco install ffmpeg`
**macOS:** `brew install ffmpeg`
**Linux:** `sudo apt install ffmpeg`

---

## 🔧 Configuration

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/us-music
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=us-music-audio
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
```

---

## ✅ Working Features

✅ **Upload Form** - All fields, file validation, progress
✅ **Backend Processing** - FFmpeg HLS conversion, S3 upload
✅ **Database Storage** - MongoDB with full metadata
✅ **Songs List** - Admin table, search, filter, delete
✅ **Home Page** - Display uploaded songs
✅ **HLS Player** - Secure streaming, queue, controls
✅ **CORS** - Configured for localhost:5173
✅ **Error Handling** - Frontend + backend

---

## 🎯 Test Upload Flow

1. **Login** → Admin dashboard
2. **Upload** → Select MP3 + Fill metadata
3. **Wait** → Progress bar 0-100%
4. **Success** → "Song uploaded successfully!"
5. **View** → Admin songs page
6. **Play** → Click any song

---

## 🐛 Common Issues

### "MongoDB connection failed"
```bash
# Start MongoDB
mongod
```

### "FFmpeg not found"
```bash
# Verify installation
ffmpeg -version
```

### "Upload stuck"
- Check backend console for FFmpeg logs
- Large files take time to convert

### "No songs displayed"
- Check backend logs
- Verify MongoDB connection
- Check API response in Network tab

---

## 📊 Verify Success

✅ Backend console shows: `✅ Song uploaded successfully`
✅ Song appears in admin songs table
✅ Song plays with HLS streaming
✅ Player controls work
✅ No console errors

---

## 🎉 Success!

If upload → display → playback works, integration is complete!

**Full docs:** See [UPLOAD_IMPLEMENTATION.md](./UPLOAD_IMPLEMENTATION.md)

---

## 📞 Need Help?

Check:
1. Backend console logs
2. Browser console (F12)
3. Network tab for API calls
4. MongoDB logs
