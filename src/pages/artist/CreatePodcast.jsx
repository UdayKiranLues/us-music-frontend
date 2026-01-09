import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://us-music-backend.vercel.app';

const CreatePodcast = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [],
    keywords: [],
    language: 'en',
    explicit: false,
    coverImage: null,
  });

  const categoryOptions = [
    'Technology',
    'Business',
    'Entertainment',
    'Music',
    'Sports',
    'News',
    'Education',
    'Health',
    'Comedy',
    'True Crime',
    'Society & Culture',
    'History',
  ];

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleKeywordInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const keyword = e.target.value.trim();
      if (!formData.keywords.includes(keyword)) {
        setFormData(prev => ({
          ...prev,
          keywords: [...prev.keywords, keyword],
        }));
      }
      e.target.value = '';
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword),
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result);
      };
      reader.readAsDataURL(file);

      setFormData(prev => ({
        ...prev,
        coverImage: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Podcast title is required');
      return;
    }
    if (formData.categories.length === 0) {
      setError('Select at least one category');
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('categories', JSON.stringify(formData.categories));
      submitData.append('keywords', JSON.stringify(formData.keywords));
      submitData.append('language', formData.language);
      submitData.append('explicit', formData.explicit);
      
      if (formData.coverImage) {
        submitData.append('coverImage', formData.coverImage);
      }

      const response = await axios.post(
        `${API_URL}/api/v1/artist/podcasts`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Podcast created:', response.data.data);
      navigate(`/artist/podcasts/${response.data.data._id}/new-episode`);
    } catch (err) {
      console.error('❌ Failed to create podcast:', err);
      setError(err.response?.data?.message || 'Failed to create podcast');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Create a New Podcast
        </h1>
        <p className="text-gray-400 text-lg">
          Share your voice with the world. Fill in the details below to get started.
        </p>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Basic Information</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Podcast Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter podcast title"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-accent-purple focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              {formData.title.length}/100
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your podcast (optional)"
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-accent-purple focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Cover Image
            </label>
            <div className="flex gap-6">
              {/* Preview */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 border border-white/10 flex items-center justify-center overflow-hidden">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🎙️</span>
                  )}
                </div>
              </div>

              {/* Upload */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-accent-purple/20 hover:bg-accent-purple/30 border border-accent-purple/50 rounded-lg text-accent-purple font-semibold transition-colors"
                >
                  Choose Image
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  JPG, PNG up to 5MB. Recommended: 1400x1400px
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories & Keywords */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Categorization</h2>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Categories * (Select at least one)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    formData.categories.includes(category)
                      ? 'bg-accent-purple text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Keywords (Tags)
            </label>
            <input
              type="text"
              placeholder="Type keyword and press Enter"
              onKeyDown={handleKeywordInput}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-accent-purple focus:outline-none transition-colors"
            />
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.keywords.map(keyword => (
                  <div
                    key={keyword}
                    className="px-3 py-1 bg-accent-blue/30 text-accent-blue rounded-full text-sm flex items-center gap-2"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="text-accent-blue/60 hover:text-accent-blue font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Settings</h2>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-accent-purple focus:outline-none transition-colors"
            >
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-primary-dark">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Explicit Content */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="explicit"
              name="explicit"
              checked={formData.explicit}
              onChange={handleInputChange}
              className="w-5 h-5 rounded border-white/20 text-accent-purple focus:ring-2 focus:ring-accent-purple cursor-pointer"
            />
            <label htmlFor="explicit" className="text-white font-medium cursor-pointer">
              This podcast contains explicit content
            </label>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-end"
        >
          <button
            type="button"
            onClick={() => navigate('/artist/dashboard')}
            className="px-8 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Creating...' : 'Create Podcast'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default CreatePodcast;
