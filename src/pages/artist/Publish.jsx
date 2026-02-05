import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Upload as UploadIcon, Tag, Globe, Lock } from 'lucide-react';
import axios from '@/utils/axios';

const Publish = () => {
  const { type } = useParams(); // 'song' or 'podcast'
  const navigate = useNavigate();
  const location = useLocation();
  const { audioBlob, previewUrl, duration } = location.state || {};

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDraft, setIsDraft] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    keywords: [],
    language: 'en',
    explicit: false,
  });

  const categories = type === 'song' ? [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Country', 'Folk', 'Reggae', 'Blues', 'Other'
  ] : [
    'Technology', 'Business', 'Entertainment', 'Music', 'Sports', 'News', 'Education', 'Health', 'Comedy', 'True Crime', 'Society & Culture', 'History'
  ];

  const languages = [
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

  const [myPodcasts, setMyPodcasts] = useState([]);
  const [selectedPodcastId, setSelectedPodcastId] = useState('');

  useEffect(() => {
    if (!audioBlob) {
      // No recording data, redirect back
      navigate('/artist/record');
      return;
    }

    if (type === 'podcast') {
      const fetchMyPodcasts = async () => {
        try {
          const res = await axios.get(`/api/v1/artist/podcasts`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setMyPodcasts(res.data.data || []);
          if (res.data.data?.length > 0) {
            setSelectedPodcastId(res.data.data[0]._id);
          }
        } catch (err) {
          console.error('❌ Failed to fetch podcasts:', err);
        }
      };
      fetchMyPodcasts();
    }
  }, [audioBlob, navigate, type]);

  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  };

  const handleKeywordsChange = (e) => {
    const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
    setFormData(prev => ({ ...prev, keywords }));
  };

  const handleSubmit = async (draft = false) => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (type === 'podcast' && !selectedPodcastId) {
      setError('Please select a podcast show');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsDraft(draft);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('audio', audioBlob, `${type}.${audioBlob.type.split('/')[1] || 'webm'}`);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.category) formDataToSend.append('category', formData.category);
      formDataToSend.append('keywords', JSON.stringify(formData.keywords));
      formDataToSend.append('language', formData.language);
      formDataToSend.append('explicit', formData.explicit);
      formDataToSend.append('duration', Math.round(duration));
      formDataToSend.append('isDraft', draft);

      let endpoint = '';
      if (type === 'song') {
        endpoint = '/api/v1/artist/songs';
      } else {
        endpoint = `/api/v1/artist/podcasts/${selectedPodcastId}/episodes`;
      }

      const response = await axios.post(`${endpoint}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      console.log('✅ Content published:', response.data);

      // Redirect to dashboard with success message
      navigate('/artist/dashboard', {
        state: {
          message: draft ? `${type} saved as draft!` : `${type} published successfully!`
        }
      });

    } catch (err) {
      console.error('❌ Failed to publish:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to publish. Please try again.');
    } finally {
      setIsLoading(false);
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

  if (!audioBlob) {
    return <div>Loading...</div>;
  }

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
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-accent-blue/20 to-dark/20 opacity-60" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Publish <span className="bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">
              {type === 'song' ? 'Song' : 'Podcast'}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg md:text-xl"
          >
            Add details and share with your audience
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Form */}
      <motion.section
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
      >
        <form className="space-y-6">
          {/* Podcast Show Selection */}
          {type === 'podcast' && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Podcast Show *
              </label>
              {myPodcasts.length > 0 ? (
                <select
                  value={selectedPodcastId}
                  onChange={(e) => setSelectedPodcastId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent"
                >
                  {myPodcasts.map(podcast => (
                    <option key={podcast._id} value={podcast._id} className="bg-dark text-white">
                      {podcast.title}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm">
                  You haven't created any podcast shows yet.
                  <button
                    onClick={() => navigate('/artist/podcasts/new')}
                    className="ml-1 underline font-bold"
                  >
                    Create one now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={`Enter episode title`}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={`Describe your ${type}...`}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent resize-none"
            />
          </div>

          {/* Category and Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Keywords/Tags
            </label>
            <input
              type="text"
              value={formData.keywords.join(', ')}
              onChange={handleKeywordsChange}
              placeholder="music, pop, original (comma separated)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-purple focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Separate keywords with commas
            </p>
          </div>

          {/* Explicit Content */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="explicit"
              id="explicit"
              checked={formData.explicit}
              onChange={handleInputChange}
              className="w-4 h-4 text-accent-purple bg-white/10 border-white/20 rounded focus:ring-accent-purple focus:ring-2"
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-gray-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isLoading && isDraft ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Globe className="w-5 h-5" />
              {isLoading && !isDraft ? 'Publishing...' : 'Publish'}
            </button>
          </div>

          {/* Draft vs Published Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Draft</p>
                <p className="text-xs text-gray-400">Only visible to you. Can be edited later.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-accent-purple mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Published</p>
                <p className="text-xs text-gray-400">Visible to all users. Cannot be edited.</p>
              </div>
            </div>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
};

export default Publish;