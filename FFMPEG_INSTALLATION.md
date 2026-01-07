# FFmpeg Installation Guide

## Problem
Song upload returns 500 error: "Cannot find ffprobe"

This means FFmpeg is not installed on your system.

---

## Solution: Install FFmpeg

### Windows

**Option 1: Using Chocolatey (Recommended)**
```powershell
# Install Chocolatey if not already installed
# Then run:
choco install ffmpeg

# Verify installation
ffmpeg -version
ffprobe -version
```

**Option 2: Manual Installation**
1. Download FFmpeg from: https://ffmpeg.org/download.html
2. Choose "Windows builds by BtbN" or similar
3. Extract to `C:\ffmpeg`
4. Add to PATH:
   - Open System Properties → Advanced → Environment Variables
   - Edit "Path" in System Variables
   - Add: `C:\ffmpeg\bin`
5. Restart terminal/PowerShell
6. Verify:
   ```powershell
   ffmpeg -version
   ffprobe -version
   ```

**Option 3: Using Scoop**
```powershell
scoop install ffmpeg
```

### macOS

**Using Homebrew (Recommended)**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install FFmpeg
brew install ffmpeg

# Verify installation
ffmpeg -version
ffprobe -version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
ffprobe -version
```

### Linux (CentOS/RHEL/Fedora)

```bash
sudo yum install ffmpeg

# Or on newer versions
sudo dnf install ffmpeg

# Verify installation
ffmpeg -version
ffprobe -version
```

---

## After Installation

1. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check startup logs:**
   You should see:
   ```
   ✅ FFmpeg and FFprobe are available
   ```

   If you see a warning:
   ```
   ⚠️  WARNING: FFmpeg is not installed!
   ```
   Then the installation wasn't successful or FFmpeg is not in your PATH.

3. **Test upload:**
   - Navigate to `/admin/upload`
   - Try uploading a song with cover image
   - Should now work without 500 error

---

## Troubleshooting

### "Command not found" after installation

**Windows:**
- Restart PowerShell/Command Prompt
- Check PATH: `$env:Path` (PowerShell) or `echo %PATH%` (CMD)
- Verify FFmpeg bin directory is in PATH

**macOS/Linux:**
- Restart terminal
- Check PATH: `echo $PATH`
- Try: `which ffmpeg`

### Installation successful but server still shows warning

1. **Restart Node.js server** (the check runs on startup)
2. **Check if both ffmpeg AND ffprobe are available:**
   ```bash
   ffmpeg -version
   ffprobe -version
   ```
3. **Check PATH from Node.js:**
   ```javascript
   // In Node.js console
   console.log(process.env.PATH)
   ```

### Different error after installing FFmpeg

If you get a different error like:
- "Audio file is too short" → Your audio file is < 1 second
- "Audio file is too long" → Your audio file is > 10 minutes
- "No audio stream found" → Your file is corrupted or not a valid audio file

---

## Verify Installation

Run this in your terminal:

```bash
ffmpeg -version
```

**Expected output:**
```
ffmpeg version x.x.x Copyright (c) 2000-2024 the FFmpeg developers
built with ...
configuration: ...
```

```bash
ffprobe -version
```

**Expected output:**
```
ffprobe version x.x.x Copyright (c) 2007-2024 the FFmpeg developers
built with ...
configuration: ...
```

---

## What FFmpeg Does

FFmpeg is used by the backend to:

1. **Validate audio files** - Check if uploaded file is valid audio
2. **Extract metadata** - Get duration, bitrate, sample rate, channels
3. **Convert to HLS** - Convert MP3/WAV to HTTP Live Streaming format
4. **Generate segments** - Create .m3u8 playlist and .ts segments for streaming

Without FFmpeg:
- ❌ Song upload will fail with 500 error
- ❌ Cannot process audio files
- ❌ Cannot stream songs

With FFmpeg:
- ✅ Song upload works
- ✅ Audio processing works
- ✅ HLS streaming works

---

## Alternative: Docker (Future Enhancement)

If you're using Docker, FFmpeg can be included in the Docker image:

```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Rest of Dockerfile...
```

This ensures FFmpeg is always available in the container environment.

---

## Support

If you're still having issues after following this guide:

1. Check Node.js can access FFmpeg:
   ```javascript
   // backend/test-ffmpeg.js
   import { exec } from 'child_process';
   import { promisify } from 'util';
   
   const execPromise = promisify(exec);
   
   async function test() {
     try {
       const { stdout } = await execPromise('ffmpeg -version');
       console.log('✅ FFmpeg found:', stdout.split('\n')[0]);
     } catch (error) {
       console.error('❌ FFmpeg not found:', error.message);
     }
   }
   
   test();
   ```
   
   Run: `node backend/test-ffmpeg.js`

2. Check server logs when starting backend
3. Try uploading after restarting the server

---

## Status

After fixing this issue, your upload flow will be:

```
Upload Request
  ↓
Validate files exist ✅
  ↓
Validate FFmpeg installed ✅
  ↓
Validate audio file with FFprobe ✅
  ↓
Extract metadata ✅
  ↓
Convert to HLS with FFmpeg ✅
  ↓
Upload to S3 ✅
  ↓
Save to MongoDB ✅
  ↓
Return success ✅
```

**Current error:** Step 3 (Validate FFmpeg) is failing  
**Solution:** Install FFmpeg following the guide above
