import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KeyboardShortcutsHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Space', action: 'Play / Pause', icon: '⏯️' },
    { key: '→', action: 'Next song', icon: '⏭️' },
    { key: '←', action: 'Previous song', icon: '⏮️' },
    { key: 'F', action: 'Toggle favourite', icon: '❤️' },
  ];

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-6 z-50 w-10 h-10 rounded-full glass-strong border border-white/20 flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-lg"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        <span className="text-lg">⌨️</span>
      </button>

      {/* Shortcuts modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md"
            >
              <div className="glass-strong rounded-2xl border border-white/20 p-6 shadow-2xl m-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⌨️</span>
                    <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Shortcuts list */}
                <div className="space-y-3">
                  {shortcuts.map((shortcut, index) => (
                    <motion.div
                      key={shortcut.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{shortcut.icon}</span>
                        <span className="text-gray-300">{shortcut.action}</span>
                      </div>
                      <kbd className="px-3 py-1 bg-gradient-to-br from-white/20 to-white/10 rounded-lg text-white font-semibold text-sm border border-white/20 shadow-lg min-w-[3rem] text-center">
                        {shortcut.key}
                      </kbd>
                    </motion.div>
                  ))}
                </div>

                {/* Footer tip */}
                <p className="text-center text-gray-400 text-sm mt-6">
                  Shortcuts work anywhere except when typing in input fields
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardShortcutsHelp;
