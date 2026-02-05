import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Pause, Square, Upload, X, Tag } from 'lucide-react';
import axios from '@/utils/axios';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const PodcastStudio = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    category: 'Business',
    keywords: [],
    keywordInput: ''
  });

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);

  const categories = ['Business', 'Music', 'Life', 'Tech', 'Education', 'Health', 'Sports', 'Entertainment'];

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        chunksRef.current = [];

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      showToast('Recording started', '🎙️');
    } catch (error) {
      console.error('Error starting recording:', error);
      showToast('Failed to start recording', '❌');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      showToast('Recording stopped', '⏹️');
    }
  };

  // Playback functions
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addKeyword = () => {
    if (formData.keywordInput.trim() && !formData.keywords.includes(formData.keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, prev.keywordInput.trim()],
        keywordInput: ''
      }));
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  // Publish function
  const handlePublish = async () => {
    if (!audioBlob || !formData.title.trim()) {
      showToast('Please record audio and enter a title', '⚠️');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('audio', audioBlob, 'recording.wav');
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('keywords', JSON.stringify(formData.keywords));

      const response = await axios.post(`/api/v1/podcasts`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Podcast published successfully!', '🎉');
      setShowPublishModal(false);

      // Reset form
      setAudioBlob(null);
      setAudioUrl(null);
      setFormData({
        title: '',
        category: 'Business',
        keywords: [],
        keywordInput: ''
      });

    } catch (error) {
      console.error('Error publishing podcast:', error);
      showToast('Failed to publish podcast', '❌');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark-lighter">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Podcast Studio
            </h1>
            <p className="text-gray-400 text-lg">
              Record and publish your podcast episodes
            </p>
          </motion.div>

          {/* Recording Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-lighter/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <div className="text-center space-y-8">

              {/* Record Button */}
              <div className="flex justify-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse'
                    : 'bg-gradient-to-r from-accent-purple to-accent-blue hover:shadow-lg hover:shadow-accent-purple/50'
                    }`}
                >
                  {isRecording ? (
                    <Square className="w-12 h-12" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </button>
              </div>

              {/* Recording Status */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  {isRecording ? 'Recording...' : audioBlob ? 'Recording Complete' : 'Ready to Record'}
                </h3>
                {isRecording && (
                  <div className="flex justify-center">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [1, 0.5, 1] }}
                          transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                          className="w-2 bg-red-500 rounded-full"
                          style={{ height: `${Math.random() * 40 + 20}px` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Preview */}
              {audioUrl && (
                <div className="space-y-4">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                  />

                  {/* Waveform Visualization */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={togglePlayback}
                        className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center text-white hover:bg-accent-purple/80 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>

                      <div className="flex-1 max-w-md">
                        <div className="bg-white/20 rounded-full h-2">
                          <div
                            className="bg-accent-purple h-2 rounded-full transition-all duration-300"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Publish Button */}
                  <button
                    onClick={() => setShowPublishModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 transition-all"
                  >
                    Publish Podcast
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPublishModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-dark-lighter/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Publish Podcast</h2>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Episode Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-purple"
                  placeholder="Enter episode title"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-purple"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-dark text-white">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Keywords/Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formData.keywordInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, keywordInput: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-purple"
                    placeholder="Add keyword"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-3 bg-accent-purple text-white rounded-lg hover:bg-accent-purple/80 transition-colors"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map(keyword => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 transition-all"
                >
                  Publish
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PodcastStudio;