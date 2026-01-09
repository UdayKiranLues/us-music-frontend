import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/us-logo.jpeg';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Home', path: '/', icon: '🏠', ariaLabel: 'Navigate to Home' },
    { name: 'Search', path: '/search', icon: '🔍', ariaLabel: 'Navigate to Search' },
    { name: 'Library', path: '/library', icon: '📚', ariaLabel: 'Navigate to Library' },
    { name: 'Podcasts', path: '/podcasts', icon: '🎙️', ariaLabel: 'Navigate to Podcasts' },
    { name: 'History', path: '/history', icon: '🕐', ariaLabel: 'Navigate to History' },
    { name: 'Favourites', path: '/favourites', icon: '❤️', ariaLabel: 'Navigate to Favourites' },
  ];

  return (
    <>
      {/* Mobile overlay with backdrop blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-b from-primary via-primary-dark to-dark-lighter
          backdrop-blur-xl border-r border-white/10
          flex flex-col shadow-2xl lg:shadow-none
          transition-transform duration-300 lg:transition-none lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo - Enhanced with animation */}
        <div className="p-6 border-b border-white/10">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-accent-orange/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={logo} alt="US Music Logo" className="w-full h-full object-contain" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                US Music
              </h1>
              <p className="text-xs text-gray-400 font-medium">Premium Streaming</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation - Enhanced with better animations */}
        <nav className="flex-1 p-4 space-y-1.5 scrollbar-custom overflow-y-auto" aria-label="Primary">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <NavLink
                to={item.path}
                onClick={() => onClose && onClose()}
                aria-label={item.ariaLabel}
                className={({ isActive }) =>
                  `relative flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-orange/20 to-accent-red/20 text-white shadow-lg shadow-accent-orange/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="text-2xl transition-transform group-hover:scale-110 duration-200">
                      {item.icon}
                    </span>
                    <span className="font-semibold text-[15px]">{item.name}</span>
                    {isActive && (
                      <>
                        <motion.div
                          layoutId="activeNav"
                          className="absolute right-0 w-1 h-10 bg-gradient-to-b from-accent-orange to-accent-red rounded-l-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-accent-orange/5 to-accent-red/5 rounded-xl -z-10"
                        />
                      </>
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Footer - Enhanced premium card */}
        <motion.div 
          className="p-4 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-5 rounded-xl glass-strong hover:glass-hover transition-all duration-300">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">✨</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-1">Premium Features</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Unlimited streaming, offline downloads & HD quality
                </p>
              </div>
            </div>
            <motion.button 
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-accent-orange to-accent-red text-white font-bold text-sm shadow-lg shadow-accent-orange/30 hover:shadow-accent-orange/50 transition-all"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Upgrade to premium"
            >
              Upgrade Now
            </motion.button>
          </div>
        </motion.div>
      </aside>
    </>
  );
};

export default Sidebar;
