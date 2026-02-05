import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Radio } from 'lucide-react';

const Record = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'song' || type === 'podcast') {
      setSelectedType(type);
    }
  }, [searchParams]);

  const handleSelectType = (type) => {
    setSelectedType(type);
    // Navigate to recording page with type
    navigate(`/artist/record/${type}`);
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
            Start <span className="bg-gradient-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">Recording</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300 text-lg md:text-xl"
          >
            Choose what you'd like to record
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Recording Options */}
      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Record Song */}
        <motion.button
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelectType('song')}
          className="h-full bg-gradient-to-br from-accent-orange/20 to-accent-red/20 hover:from-accent-orange/30 hover:to-accent-red/30 border border-accent-orange/50 hover:border-accent-orange rounded-2xl p-8 transition-all duration-300 cursor-pointer group text-left"
        >
          <div className="text-6xl mb-6">🎤</div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent-orange transition-colors">
            Sing a Song
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Record your original music directly in your browser. Perfect for demos, covers, or spontaneous creations.
          </p>
          <div className="flex items-center gap-2 text-accent-orange">
            <Mic className="w-5 h-5" />
            <span className="text-sm font-medium">Voice + Instruments</span>
          </div>
        </motion.button>

        {/* Record Podcast */}
        <motion.button
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelectType('podcast')}
          className="h-full bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 hover:from-accent-blue/30 hover:to-accent-purple/30 border border-accent-blue/50 hover:border-accent-blue rounded-2xl p-8 transition-all duration-300 cursor-pointer group text-left"
        >
          <div className="text-6xl mb-6">🎙️</div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent-blue transition-colors">
            Share Thoughts (Podcast)
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Record your podcast episode on the spot. Share your ideas, stories, or discussions with your audience.
          </p>
          <div className="flex items-center gap-2 text-accent-blue">
            <Radio className="w-5 h-5" />
            <span className="text-sm font-medium">Audio Content</span>
          </div>
        </motion.button>
      </motion.section>

      {/* Info Section */}
      <motion.section
        variants={itemVariants}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4">Recording Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <p className="font-medium text-white mb-2">🎤 Audio Quality</p>
            <p>Use a good microphone and record in a quiet environment for best results.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-2">⏱️ Duration</p>
            <p>Songs can be any length. Podcasts work best between 15-60 minutes.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-2">💾 Storage</p>
            <p>Recordings are saved locally first, then uploaded when you publish.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-2">✨ Features</p>
            <p>Preview before publishing, save as draft, or publish immediately.</p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Record;