import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/utils/axios';
import { Upload, Music } from 'lucide-react';



const CreateSong = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverPreview, setCoverPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    year: '',
    duration: 0,
    lyrics: '',
    explicit: false,
    coverImage: null,
    audioFile: null,
  });

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Country', 'Folk', 'Reggae', 'Blues', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (file) {
      if (name === 'coverImage') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCoverPreview(event.target?.result);
        };
        reader.readAsDataURL(file);
      }
      setFormData(prev => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.audioFile) {
      setError('Title and audio file are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('artist', formData.artist || 'Unknown Artist');
      submitData.append('album', formData.album);
      submitData.append('genre', formData.genre);
      submitData.append('year', formData.year);
      submitData.append('duration', formData.duration);
      submitData.append('lyrics', formData.lyrics);
      submitData.append('explicit', formData.explicit);

      if (formData.audioFile) {
        submitData.append('audio', formData.audioFile);
      }
      if (formData.coverImage) {
        submitData.append('coverImage', formData.coverImage);
      }

      const response = await api.post(`/api/v1/artist/songs`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      console.log('✅ Song uploaded:', response.data);
      navigate('/artist/dashboard', { state: { message: 'Song uploaded successfully!' } });

    } catch (err) {
      console.error('❌ Failed to upload song:', err);
      setError(err.response?.data?.message || 'Failed to upload song. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-strong border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/20 via-accent-red/20 to-dark/20 opacity-60" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Upload <span className="bg-gradient-to-r from-accent-orange to-accent-red bg-clip-text text-transparent">Song</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg md:text-xl"
          >
            Share your music with the world
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-red/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Upload Form */}
      <motion.section
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Audio File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Audio File *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-accent-orange/50 transition-colors"
            >
              <Music className={`w-12 h-12 mx-auto mb-4 transition-colors ${formData.audioFile ? 'text-accent-orange' : 'text-gray-400'}`} />
              <p className={`font-bold mb-2 ${formData.audioFile ? 'text-accent-orange' : 'text-white'}`}>
                {formData.audioFile ? formData.audioFile.name : 'Click to select audio file'}
              </p>
              <p className="text-gray-400 text-sm">MP3, WAV, FLAC up to 100MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="audioFile"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Song Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter song title"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Artist Name
              </label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                placeholder="Enter artist name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              />
            </div>
          </div>

          {/* Album and Genre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Album
              </label>
              <input
                type="text"
                name="album"
                value={formData.album}
                onChange={handleInputChange}
                placeholder="Enter album name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              >
                <option value="">Select genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Release Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="180"
                min="1"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Cover Image
            </label>
            <div className="flex gap-6 items-start">
              {/* Preview */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🎵</span>
                  )}
                </div>
              </div>

              {/* Upload Input */}
              <div className="flex-1">
                <input
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent-orange file:text-white hover:file:bg-accent-orange/80 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG up to 5MB. Square aspect ratio recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Lyrics (Optional)
            </label>
            <textarea
              name="lyrics"
              value={formData.lyrics}
              onChange={handleInputChange}
              placeholder="Enter song lyrics..."
              rows={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent resize-none"
            />
          </div>

          {/* Explicit Content */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="explicit"
              id="explicit"
              checked={formData.explicit}
              onChange={handleInputChange}
              className="w-4 h-4 text-accent-orange bg-white/10 border-white/20 rounded focus:ring-accent-orange focus:ring-2"
            />
            <label htmlFor="explicit" className="text-sm text-white">
              Contains explicit content
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Progress */}
          {isLoading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-accent-orange h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-orange/40 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {isLoading ? 'Uploading...' : 'Upload Song'}
            </button>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
};

export default CreateSong;