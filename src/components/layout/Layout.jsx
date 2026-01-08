import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Player from './Player';
import KeyboardShortcutsHelp from '@/components/common/KeyboardShortcutsHelp';
import { motion } from 'framer-motion';
import logo from '@/assets/us-logo.jpeg';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gradient-premium overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-primary/50 backdrop-blur-xl">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white text-2xl"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src={logo} alt="US Music Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold">US Music</span>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Player */}
      <Player />
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  );
};

export default Layout;
