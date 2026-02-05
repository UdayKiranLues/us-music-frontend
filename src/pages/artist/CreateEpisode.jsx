import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '@/utils/axios';

const CreateEpisode = () => {
  const { podcastId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' | 'record'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 0,
  });

  const recordingTimerRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('❌ Microphone access denied:', err);
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      // Calculate duration in seconds
      setFormData(prev => ({
        ...prev,
        duration: recordingTime,
      }));
    }
  };

  // Discard recording
  const discardRecording = () => {
    setAudioBlob(null);
    setPreviewUrl(null);
    setRecordingTime(0);
    setFormData(prev => ({ ...prev, duration: 0 }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Try to get duration
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setFormData(prev => ({
          ...prev,
          duration: Math.round(audio.duration),
        }));
      };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Format time for display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmit = async (isDraft = false) => {
    setError(null);

    if (!formData.title.trim()) {
      setError('Episode title is required');
      return;
    }

    if (!audioBlob) {
      setError('Please upload or record audio');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('audio', audioBlob, 'episode-audio.webm');
      submitData.append('isDraft', isDraft);

      const response = await axios.post(
        `/api/v1/artist/podcasts/${podcastId}/episodes`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Episode created:', response.data.data);
      navigate(`/artist/podcasts/${podcastId}`);
    } catch (err) {
      console.error('❌ Failed to create episode:', err);
      setError(err.response?.data?.message || 'Failed to create episode');
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
          Create New Episode
        </h1>
        <p className="text-gray-400 text-lg">
          Record or upload your episode audio
        </p>
      </motion.div>

      {/* Audio Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-white">Audio</h2>

        {/* Mode Selection */}
        <div className="flex gap-4">
          <button
            onClick={() => setUploadMode('upload')}
            type="button"
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${uploadMode === 'upload'
                ? 'bg-accent-purple text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
          >
            📤 Upload File
          </button>
          <button
            onClick={() => setUploadMode('record')}
            type="button"
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${uploadMode === 'record'
                ? 'bg-accent-purple text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
          >
            🎤 Record
          </button>
        </div>

        {/* Upload Mode */}
        {uploadMode === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-6 py-6 border-2 border-dashed border-accent-purple/50 hover:border-accent-purple rounded-lg transition-colors"
            >
              <div className="text-center space-y-2">
                <span className="text-4xl block">📁</span>
                <p className="text-white font-semibold">Click to upload audio</p>
                <p className="text-gray-400 text-sm">MP3, WAV, M4A, OGG (Max 500MB)</p>
              </div>
            </button>
          </motion.div>
        )}

        {/* Record Mode */}
        {uploadMode === 'record' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-lg p-8 text-center space-y-6">
              {/* Timer */}
              <div className="text-5xl font-bold text-accent-purple font-mono">
                {formatTime(recordingTime)}
              </div>

              {/* Recording Status */}
              {isRecording && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex justify-center gap-2"
                >
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-red-500"
                    />
                  ))}
                </motion.div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                {!isRecording && !audioBlob ? (
                  <motion.button
                    type="button"
                    onClick={startRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    🎤 Start Recording
                  </motion.button>
                ) : isRecording ? (
                  <motion.button
                    type="button"
                    onClick={stopRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    ⏹️ Stop Recording
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={discardRecording}
                      className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Discard
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Audio Preview */}
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-sm text-gray-400">Preview</p>
            <audio
              src={previewUrl}
              controls
              className="w-full"
            />
            {audioBlob && (
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  📄 {audioBlob.name || 'Recorded Audio'} ({Math.round(audioBlob.size / 1024 / 1024)}MB)
                </span>
                <span>Duration: {formatTime(formData.duration)}</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Episode Details */}
      {audioBlob && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Episode Details</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Episode Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter episode title"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-accent-purple focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Description & Show Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add episode description, links, guests, etc."
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-accent-purple focus:outline-none transition-colors resize-none"
            />
          </div>
        </motion.div>
      )}

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
      {audioBlob && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 justify-end"
        >
          <button
            type="button"
            onClick={() => navigate(`/artist/podcasts/${podcastId}`)}
            className="px-8 py-3 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isLoading || !formData.title.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Publishing...' : '🚀 Publish Episode'}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CreateEpisode;
