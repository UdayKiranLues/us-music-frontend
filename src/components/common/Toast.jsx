import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="glass-strong px-6 py-3 rounded-full border border-white/20 shadow-2xl flex items-center gap-3">
            <span className="text-2xl">{toast.icon}</span>
            <span className="text-white font-semibold">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
