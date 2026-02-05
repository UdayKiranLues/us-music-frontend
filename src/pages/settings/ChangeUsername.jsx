import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ChangeUsername() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/check-username/${username}`);
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username || formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else if (formData.username === user.username) {
      newErrors.username = 'This is already your username';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Username is already taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProfile({ username: formData.username });

      if (result.success) {
        navigate('/settings', { replace: true });
      } else {
        setErrors({ submit: result.error || 'Failed to update username' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check username availability when it changes
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (formData.username && formData.username !== user.username) {
        checkUsernameAvailability(formData.username);
      } else {
        setUsernameAvailable(null);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [formData.username, user.username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark-lighter">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Change Username</h1>
          </div>

          {/* Current Username */}
          <div className="bg-dark-lighter/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-red rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Current username</p>
                <p className="text-lg font-semibold text-white">@{user.username}</p>
              </div>
            </div>
          </div>

          {/* Change Username Form */}
          <div className="bg-dark-lighter/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  New Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-8 pr-4 py-3 bg-white/5 border ${
                      errors.username ? 'border-red-500/50' : 'border-white/10'
                    } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors`}
                    placeholder="your_new_username"
                  />
                </div>
                {formData.username && formData.username.length >= 3 && formData.username !== user.username && (
                  <div className="mt-2 flex items-center space-x-2">
                    {checkingUsername ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="text-xs text-gray-400">Checking availability...</span>
                      </>
                    ) : usernameAvailable === true ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">✅ Username available</span>
                      </>
                    ) : usernameAvailable === false ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-400">❌ Username already taken</span>
                      </>
                    ) : null}
                  </div>
                )}
                {errors.username && (
                  <p className="mt-2 text-sm text-red-400">{errors.username}</p>
                )}
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || usernameAvailable === false || checkingUsername}
                className="w-full py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white font-medium rounded-xl hover:shadow-lg hover:shadow-accent-orange/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Username</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}