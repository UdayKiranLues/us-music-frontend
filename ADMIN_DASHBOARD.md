# Admin Dashboard - US Music

## 🎯 Overview
Complete admin dashboard for managing music streaming platform with dark premium UI and glassmorphism design.

## 📁 Structure
```
src/
├── components/admin/
│   ├── AdminLayout.jsx      # Main layout with sidebar
│   ├── GlassCard.jsx         # Reusable glassmorphism card
│   └── StatCard.jsx          # Dashboard stat cards
├── pages/admin/
│   ├── Dashboard.jsx         # Overview with stats & activity
│   ├── Albums.jsx            # Album CRUD management
│   ├── Songs.jsx             # Song management & filtering
│   ├── Upload.jsx            # Upload with progress tracking
│   ├── Analytics.jsx         # Charts & insights
│   └── Users.jsx             # User management & roles
```

## 🚀 Features

### Navigation
- **Collapsible sidebar** with 6 main sections
- **Active route highlighting** with gradient accent
- **Quick actions** (Settings, Logout)
- **Responsive design** for mobile/tablet

### Dashboard
- **4 stat cards** (Users, Songs, Albums, Plays) with trend indicators
- **Top songs** table with play counts
- **Recent activity** feed
- **Quick actions** for common tasks

### Albums Management
- **Create/Edit/Delete** albums with modal forms
- **Search & filter** functionality
- **Data table** with album details
- **Status badges** (Published, Draft)

### Songs Management
- **Multi-genre filtering** (Pop, Rock, Electronic, etc.)
- **Search by title/artist**
- **Play count tracking**
- **Duration & status display**
- **Inline actions** (Edit, Delete)

### Upload
- **Drag & drop** file upload zone
- **Multi-file queue** with individual progress bars
- **Metadata form** (Title, Artist, Genre, Language, BPM, Mood)
- **Cover image upload**
- **Real-time progress** indicators
- **Status tracking** (Pending, Uploading, Completed, Error)

### Analytics
- **Time period selector** (6 months, Year, All time)
- **Plays & User growth** charts
- **Top genres** distribution
- **Additional metrics** (Avg plays, Active users, Session time, Revenue)
- **Trend indicators** with percentage changes

### Users Management
- **Role assignment** (User, Artist, Admin)
- **Status management** (Active, Suspended)
- **Search & filter** by role/status
- **Activity tracking** (Playlists, Favorites)
- **Bulk actions** (Suspend, Activate)

## 🎨 Design System

### Colors
- **Primary**: Dark gradient (#0A2540 → #0A0E27)
- **Accent**: Orange to Red gradient (#FF6B35 → #E63946)
- **Secondary**: Blue (#0077FF), Purple, Green
- **Glass**: White with 5-10% opacity + backdrop blur

### Components
- **GlassCard**: Glassmorphism effect with border
- **StatCard**: Metric display with icon and trend
- **Data Tables**: Responsive with hover states
- **Forms**: Consistent input styling with focus states
- **Buttons**: Gradient primary, ghost secondary

### Typography
- **Headings**: Inter font, bold weights
- **Body**: Inter font, regular/medium
- **Code**: Monospace for technical content

## 🔐 Access Control
All admin routes are prefixed with `/admin`:
- `/admin` - Dashboard
- `/admin/albums` - Albums management
- `/admin/songs` - Songs management
- `/admin/upload` - Upload interface
- `/admin/analytics` - Analytics & insights
- `/admin/users` - User management

## 📝 Usage

### Navigate to Admin Panel
```javascript
// From anywhere in the app
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/admin');
```

### Example: Upload Song
1. Go to `/admin/upload`
2. Drag & drop MP3 files or click to browse
3. Fill in song metadata (Title, Artist, Genre, Language)
4. Add cover image (optional)
5. Click "Start Upload"
6. Monitor progress in real-time

### Example: Manage Albums
1. Go to `/admin/albums`
2. Click "Create Album" button
3. Fill in album details (Title, Artist, Release Date)
4. Save to create new album
5. Use table actions to Edit/Delete

## 🛠️ TODO: Backend Integration
Replace mock data with API calls:
```javascript
// albums.jsx
const fetchAlbums = async () => {
  const response = await fetch('/api/v1/admin/albums');
  const data = await response.json();
  setAlbums(data);
};

// upload.jsx
const uploadFile = async (file, metadata) => {
  const formData = new FormData();
  formData.append('audio', file);
  formData.append('title', metadata.title);
  // ... add other fields
  
  const response = await fetch('/api/v1/admin/upload', {
    method: 'POST',
    body: formData,
  });
  return response.json();
};
```

## 📱 Responsive Breakpoints
- **Mobile**: < 768px (Sidebar collapses)
- **Tablet**: 768px - 1024px (2 column grids)
- **Desktop**: > 1024px (Full layout)

## 🎯 Next Steps
1. Add authentication middleware
2. Connect to backend APIs
3. Implement real file upload to S3
4. Add export functionality
5. Implement batch operations
6. Add advanced filters & search
7. Create notification system
8. Add activity logs

## 🌟 Best Practices
- **Modular components**: Reusable GlassCard, StatCard
- **Consistent spacing**: 6-unit system (4, 6, 8, 12, 16, 24)
- **Accessible**: Semantic HTML, ARIA labels
- **Performance**: Lazy loading, code splitting
- **Maintainable**: Clean code, clear naming

---

Built with React, Tailwind CSS, and Lucide Icons 🎵
