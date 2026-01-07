import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, CheckCircle, AlertCircle, Music, Image as ImageIcon } from 'lucide-react';
import GlassCard from '@/components/admin/GlassCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Upload = () => {
  const navigate = useNavigate();
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: 'Pop',
    language: 'English',
    mood: '',
    bpm: '',
  });

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const genres = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Country'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Other'];

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setUploadStatus(null);
    } else {
      alert('Please select a valid audio file');
    }
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleUpload = async () => {
    // Validate form
    if (!audioFile) {
      alert('Please select an audio file');
      return;
    }

    if (!formData.title || !formData.artist || !formData.genre || !formData.language) {
      alert('Please fill in all required fields (Title, Artist, Genre, Language)');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);
    setUploadMessage('');

    try {
      // Prepare form data
      const formDataToSend = new FormData();
      formDataToSend.append('audio', audioFile);
      if (coverFile) {
        formDataToSend.append('cover', coverFile);
      }
      formDataToSend.append('title', formData.title);
      formDataToSend.append('artist', formData.artist);
      formDataToSend.append('album', formData.album);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('language', formData.language);
      if (formData.mood) {
        formDataToSend.append('mood', formData.mood);
      }
      if (formData.bpm) {
        formDataToSend.append('bpm', formData.bpm);
      }

      // Upload with progress (cookies sent automatically)
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          console.log('✅ Upload successful:', response);
          setUploadStatus('success');
          setUploadMessage(`Song "${formData.title}" uploaded successfully!`);
          
          // Reset form
          setAudioFile(null);
          setCoverFile(null);
          setFormData({
            title: '',
            artist: '',
            album: '',
            genre: 'Pop',
            language: 'English',
            mood: '',
            bpm: '',
          });
          
          // Reset file inputs
          if (audioInputRef.current) audioInputRef.current.value = '';
          if (coverInputRef.current) coverInputRef.current.value = '';

          // Navigate to Songs page after 2 seconds to show newly uploaded song
          setTimeout(() => {
            navigate('/admin/songs');
          }, 2000);
          if (coverInputRef.current) coverInputRef.current.value = '';
        } else {
          const error = JSON.parse(xhr.responseText);
          throw new Error(error.message || 'Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      xhr.open('POST', `${API_URL}/api/v1/upload/song-with-cover`);
      // Cookies are sent automatically with withCredentials
      xhr.withCredentials = true;
      xhr.send(formDataToSend);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const removeCoverFile = () => {
    setCoverFile(null);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Music</h1>
        <p className="text-gray-400">Upload and manage your music files with metadata</p>
      </div>

      {/* Upload Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Upload Files</h2>
          
          {/* Audio File Upload */}
          <label
            htmlFor="audio-upload"
            className="relative block border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-accent-orange/50 transition-colors cursor-pointer group"
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent-orange to-accent-red rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  {audioFile ? audioFile.name : 'Drop audio file here'}
                </p>
                <p className="text-sm text-gray-400">
                  {audioFile ? `${(audioFile.size / (1024 * 1024)).toFixed(2)} MB` : 'or click to browse (MP3, WAV)'}
                </p>
              </div>
            </div>
            <input
              id="audio-upload"
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioSelect}
              className="hidden"
            />
          </label>

          {audioFile && (
            <div className="mt-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Music className="w-5 h-5 text-accent-orange" />
                    <div>
                      <p className="text-white text-sm font-medium">{audioFile.name}</p>
                      <p className="text-gray-400 text-xs">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={removeAudioFile}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mt-4 p-4 rounded-xl border ${
              uploadStatus === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-center space-x-2">
                {uploadStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p className="text-sm font-medium">{uploadMessage}</p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Uploading...</span>
                <span className="text-white font-medium">{uploadProgress}%</span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-orange to-accent-red transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </GlassCard>

        {/* Metadata Form */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Song Details</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
                placeholder="Enter song title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artist *
              </label>
              <input
                type="text"
                required
                value={formData.artist}
                onChange={(e) =>
                  setFormData({ ...formData, artist: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
                placeholder="Enter artist name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Album
              </label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) =>
                  setFormData({ ...formData, album: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
                placeholder="Enter album name (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre *
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-orange/50 transition-colors appearance-none cursor-pointer"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre} className="bg-dark-lighter">
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-orange/50 transition-colors appearance-none cursor-pointer"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang} className="bg-dark-lighter">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mood
                </label>
                <input
                  type="text"
                  value={formData.mood}
                  onChange={(e) =>
                    setFormData({ ...formData, mood: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
                  placeholder="e.g., Happy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  BPM
                </label>
                <input
                  type="number"
                  value={formData.bpm}
                  onChange={(e) =>
                    setFormData({ ...formData, bpm: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors"
                  placeholder="128"
                />
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image
              </label>
              <label htmlFor="cover-upload" className="relative block border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-accent-orange/50 transition-colors cursor-pointer">
                {coverFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <ImageIcon className="w-6 h-6 text-accent-orange" />
                    <div>
                      <p className="text-sm text-white">{coverFile.name}</p>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); removeCoverFile(); }}
                        className="text-xs text-gray-400 hover:text-white mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Upload cover image (optional)</p>
                  </>
                )}
                <input
                  id="cover-upload"
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !audioFile}
              className="w-full py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white rounded-xl hover:shadow-lg hover:shadow-accent-orange/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Song'}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Upload;
