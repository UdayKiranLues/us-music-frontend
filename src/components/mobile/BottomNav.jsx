import { Home, Search, Library, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colors, mobile } from '../../styles/designTokens';

/**
 * Mobile Bottom Navigation
 * Spotify-style bottom navigation for mobile devices
 */
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/', emoji: '🏠' },
    { icon: Search, label: 'Search', path: '/search', emoji: '🔍' },
    { icon: Library, label: 'Library', path: '/library', emoji: '📚' },
    { icon: null, label: 'Podcasts', path: '/podcasts', emoji: '🎙️' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        height: mobile.bottomNav.heightWithSafeArea,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/5" />
      
      {/* Navigation items */}
      <div className="relative h-16 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 relative"
              style={{ minHeight: mobile.touchTarget.min }}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute inset-x-2 -top-2 h-1 rounded-full bg-primary-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Icon */}
              <motion.div
                animate={{
                  scale: active ? 1.1 : 1,
                  y: active ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {Icon ? (
                  <Icon
                    size={24}
                    strokeWidth={active ? 2.5 : 2}
                    className={`transition-colors ${
                      active ? 'text-primary-400' : 'text-neutral-400'
                    }`}
                  />
                ) : (
                  <span className="text-2xl">{item.emoji}</span>
                )}
              </motion.div>
              
              {/* Label */}
              <span
                className={`text-xs mt-1 font-medium transition-colors ${
                  active ? 'text-primary-400' : 'text-neutral-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
