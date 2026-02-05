import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@/utils/imageUrl';

const PodcastCard = ({ podcast }) => {
  const {
    _id,
    title,
    coverImage,
    host,
    description,
    episodeCount = 0,
  } = podcast;

  return (
    <Link to={`/podcasts/${_id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer"
      >
        {/* Card Container */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-accent-orange/50 transition-all duration-300 shadow-lg hover:shadow-accent-orange/20">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-dark to-dark-lighter">
            {coverImage ? (
              <motion.img
                src={getImageUrl(coverImage)}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-blue/20 to-accent-orange/20">
                <span className="text-5xl">🎙️</span>
              </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Episode Count Badge */}
            <div className="absolute top-3 right-3 bg-accent-orange/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white">
              {episodeCount} episodes
            </div>
          </div>

          {/* Info Container */}
          <div className="p-4 space-y-2">
            {/* Title */}
            <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-accent-orange transition-colors">
              {title}
            </h3>

            {/* Categories */}
            {categories && categories.length > 0 && (
              <p className="text-[10px] text-accent-orange/80 font-bold uppercase tracking-wider">
                {categories.join(' • ')}
              </p>
            )}

            {/* Host */}
            <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
              <span className="text-sm">🎤</span>
              <span className="line-clamp-1">{host || podcast.artist?.name || 'Unknown Host'}</span>
            </p>

            {/* Description */}
            {description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {description}
              </p>
            )}

            {/* Play Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-3 py-2 bg-gradient-to-r from-accent-orange to-accent-red text-white font-bold rounded-lg hover:shadow-lg hover:shadow-accent-orange/40 transition-all duration-200 text-xs uppercase tracking-wide"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              View Episodes
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default PodcastCard;
