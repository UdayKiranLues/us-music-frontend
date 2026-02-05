import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Pause, RotateCcw, Check, X, Upload } from 'lucide-react';

const RecordAudio = ({ type }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(new Audio());
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
      setHasPermission(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to record.');
      console.error('Error accessing microphone:', err);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await requestMicrophonePermission();
      if (!hasPermission) return;
    }

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        audioRef.current.src = url;
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Failed to start recording. Please try again.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playPreview = () => {
    if (audioRef.current && previewUrl) {
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const pausePreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const reRecord = () => {
    setAudioBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const acceptRecording = () => {
    // Navigate to publish form with the recording data
    navigate(`/artist/publish/${type}`, {
      state: { audioBlob, previewUrl, duration: recordingTime }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 via-accent-blue/20 to-dark/20 opacity-60" />
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Record <span className="bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">
              {type === 'song' ? 'Song' : 'Podcast'}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg md:text-xl"
          >
            {type === 'song' ? '🎤 Sing your heart out' : '🎙️ Share your thoughts'}
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Recording Interface */}
      <motion.section
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
      >
        {!hasPermission ? (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎤</div>
            <h3 className="text-xl font-bold text-white">Microphone Access Required</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We need access to your microphone to record {type === 'song' ? 'your music' : 'your podcast'}.
              Your audio is processed locally and securely.
            </p>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              onClick={requestMicrophonePermission}
              className="px-8 py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 transition-all"
            >
              Allow Microphone Access
            </button>
          </div>
        ) : !audioBlob ? (
          <div className="text-center space-y-8">
            <div className="relative">
              <div className={`text-8xl transition-all duration-300 ${isRecording ? 'animate-pulse text-red-400' : 'text-accent-purple'}`}>
                {isRecording ? '🎤' : '🎙️'}
              </div>
              {isRecording && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping" />
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {isRecording ? 'Recording...' : 'Ready to Record'}
              </h3>
              <div className="text-4xl font-mono text-accent-purple">
                {formatTime(recordingTime)}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-red-500/40 transition-all flex items-center gap-3"
                >
                  <Mic className="w-6 h-6" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-gray-600/40 transition-all flex items-center gap-3"
                >
                  <MicOff className="w-6 h-6" />
                  Stop Recording
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8">
            <div className="text-6xl">✅</div>
            <h3 className="text-2xl font-bold text-white">Recording Complete!</h3>
            <div className="text-xl text-gray-300">
              Duration: {formatTime(recordingTime)}
            </div>

            {/* Preview Controls */}
            <div className="flex justify-center gap-4">
              {!isPlaying ? (
                <button
                  onClick={playPreview}
                  className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-accent-purple/40 transition-all flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Preview
                </button>
              ) : (
                <button
                  onClick={pausePreview}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-gray-600/40 transition-all flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              )}

              <button
                onClick={reRecord}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/40 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Re-record
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={acceptRecording}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/40 transition-all flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Accept & Continue
              </button>

              <button
                onClick={() => navigate('/artist/dashboard')}
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default RecordAudio;