import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { setUserRole, user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'listener',
      label: 'Listener',
      icon: '👂',
      description: 'Discover and enjoy music and podcasts',
      color: 'from-accent-orange to-accent-red',
    },
    {
      id: 'artist',
      label: 'Artist / Singer',
      icon: '🎤',
      description: 'Create and share your music and podcasts',
      color: 'from-accent-blue to-accent-purple',
    },
  ];

  const handleSelectRole = async (role) => {
    if (loading) return;

    try {
      setLoading(true);
      await setUserRole(role, navigate);
    } catch (err) {
      showToast("Failed to set role", "❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Welcome to <span className="bg-gradient-to-r from-accent-orange to-accent-red bg-clip-text text-transparent">US Music</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Hello {user?.name || 'there'}! Who are you?
          </p>
        </motion.div>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => handleSelectRole(role.id)}
              disabled={loading}
              className="relative group text-left"
            >
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${role.color} rounded-2xl p-0.5 overflow-hidden transition-all duration-300`}>
                <div className="bg-gradient-to-br from-primary-dark to-dark rounded-2xl p-8 h-full flex flex-col justify-between">
                  {/* Icon */}
                  <motion.div
                    className="text-6xl mb-4"
                  >
                    {role.icon}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {role.label}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  {/* Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-white/10 text-white group-hover:bg-white/20`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                          ⚙️
                        </motion.span>
                        Setting up...
                      </span>
                    ) : (
                      'Choose'
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm"
        >
          <p>
            You can change your role later in your profile settings
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
