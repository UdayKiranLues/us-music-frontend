# CloudFront Setup Required for Song Playback

## Current Issue
Song playback is now configured to **REQUIRE CloudFront** for streaming.

## Quick Fix (Development)

Add this to `backend/.env`:

```bash
# CloudFront CDN (REQUIRED)
CLOUDFRONT_DOMAIN=https://us-music.s3.eu-north-1.amazonaws.com
```

**Note**: This temporarily uses S3 as a fallback in development mode only.

## Production Setup (Recommended)

### Step 1: Create CloudFront Distribution

1. Go to AWS CloudFront Console
2. Click "Create Distribution"
3. Configure:
   - **Origin Domain**: `us-music.s3.eu-north-1.amazonaws.com`
   - **Origin Path**: Leave empty
   - **Name**: `us-music-cdn`
   - **Origin Access**: Public
   - **Viewer Protocol**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS
   - **Cache Policy**: CachingOptimized
   - **Price Class**: Use all edge locations (or choose based on your users)

4. Click "Create Distribution"
5. Wait 10-15 minutes for deployment
6. Copy the distribution domain (e.g., `d123abc456def.cloudfront.net`)

### Step 2: Update .env

```bash
CLOUDFRONT_DOMAIN=https://d123abc456def.cloudfront.net
```

### Step 3: Configure CORS on S3

Run this command:
```bash
cd backend/config
./apply-s3-cors.ps1
```

Or manually add CORS policy in S3 console.

### Step 4: Restart Server

```bash
cd backend
npm run dev
```

## What Changed

**Backend (`songController.js`)**:
- Now builds CloudFront URLs: `${CLOUDFRONT_DOMAIN}/${song.hlsUrl}`
- Rejects requests if CloudFront not configured (production)
- Falls back to S3 in development mode only

**Frontend (`PlayerContext.jsx`)**:
- Validates all stream URLs
- **REJECTS any S3 URLs** (`s3.amazonaws.com`)
- Only accepts CloudFront URLs (`cloudfront.net`)
- Fails playback if non-CloudFront URL received

**Config (`config/index.js`)**:
- Validates CloudFront domain format
- Throws error in production if missing
- Warns in development if not configured

## Benefits

✅ No more CORS errors
✅ Faster streaming (CDN edge caching)
✅ No DNS resolution errors
✅ Production-ready architecture
✅ Secure signed URLs (optional with key pair)

## Temporary Development Fallback

If you need to test without CloudFront setup:

```bash
# backend/.env
CLOUDFRONT_DOMAIN=https://us-music.s3.eu-north-1.amazonaws.com
```

This makes the S3 bucket URL act as a "fake" CloudFront domain for development only. **DO NOT use in production.**

## Verify Setup

After adding `CLOUDFRONT_DOMAIN`, restart backend and check logs:

```
✅ Configuration Check
   - CloudFront: Configured
   - Domain: https://d123abc.cloudfront.net
```

Then play a song and check browser console:

```
✅ CloudFront URL validated
   URL: https://d123abc.cloudfront.net/songs/.../playlist.m3u8
✅ HLS manifest loaded
```

If you see:
```
❌ REJECTED: Received S3 URL instead of CloudFront
```

Then CLOUDFRONT_DOMAIN is not set correctly.

## Support

See full CloudFront setup guide:
- `backend/config/CLOUDFRONT-SETUP.md`
- `backend/config/CLOUDFRONT-QUICKSTART.txt`
