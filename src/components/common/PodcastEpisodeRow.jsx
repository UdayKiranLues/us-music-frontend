import { motion } from 'framer-motion';
import { usePlayer } from '@/context/PlayerContext';

const PodcastEpisodeRow = ({ episode, podcast, index }) => {
  const { playEpisode } = usePlayer();
  
  const {
    _id,
    title,
    description,
    duration,
    publishedAt,
    resumePosition = 0,
  } = episode;

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format published date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate progress percentage if resumed
  const progressPercent = duration ? (resumePosition / duration) * 100 : 0;

  const handlePlay = () => {
    playEpisode(
      {
        _id,
        title,
        artist: podcast.host || podcast.title,
        coverImage: podcast.coverImage,
        duration,
        description,
      },
      true,
      { podcastId: podcast._id, episodeId: _id, resumePosition }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group hover:bg-white/5 p-4 rounded-lg transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Episode Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-orange/30 to-accent-red/30 flex items-center justify-center text-xs font-bold text-white mt-1">
          {index + 1}
        </div>

        {/* Episode Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white group-hover:text-accent-orange transition-colors line-clamp-2">
            {title}
          </h4>
          
          {description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
              {description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{formatDate(publishedAt)}</span>
            <span className="w-1 h-1 bg-gray-500 rounded-full" />
            <span>{formatDuration(duration)}</span>
            {resumePosition > 0 && (
              <>
                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                <span className="text-accent-orange font-medium">
                  Resumed at {formatDuration(resumePosition)}
                </span>
              </>
            )}
          </div>

          {/* Progress bar if resumed */}
          {resumePosition > 0 && (
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-orange to-accent-red"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        {/* Duration & Play Button */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">
            {formatDuration(duration)}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlay}
            className="p-2.5 rounded-full bg-gradient-to-r from-accent-orange/20 to-accent-red/20 hover:from-accent-orange hover:to-accent-red text-white hover:text-white transition-all duration-200 shadow-lg shadow-accent-orange/0 hover:shadow-accent-orange/40"
            aria-label={`Play ${title}`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PodcastEpisodeRow;
