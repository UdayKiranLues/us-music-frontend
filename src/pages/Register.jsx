import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Music, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '', // Add role field
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
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
    setLoading(true);
    setApiError('');

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      if (result.success) {
        // Store the generated username and show success message
        setGeneratedUsername(result.user.username);
        setRegistrationSuccess(true);
      } else {
        setApiError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Weak', color: 'bg-red-500' },
      { strength: 2, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, label: 'Good', color: 'bg-blue-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' },
      { strength: 5, label: 'Very Strong', color: 'bg-green-600' },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark-lighter flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {registrationSuccess ? (
          /* Success Message */
          <div className="bg-dark-lighter/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Welcome to US Music!</h1>
            <p className="text-gray-400 mb-6">
              Your account has been created successfully.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-1">Your username is:</p>
              <p className="text-lg font-semibold text-accent-orange">@{generatedUsername}</p>
            </div>
            <button
              onClick={() => {
                if (formData.role === 'artist') {
                  navigate('/artist/dashboard', { replace: true });
                } else {
                  navigate('/', { replace: true });
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white font-medium rounded-xl hover:shadow-lg hover:shadow-accent-orange/20 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-orange to-accent-red rounded-2xl mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Join US Music and start streaming</p>
            </div>

            {/* Register Form */}
            <div className="bg-dark-lighter/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {apiError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                    errors.name ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                    errors.email ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                    errors.password ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.label && (
                      <span className="text-xs text-gray-400">{passwordStrength.label}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                    errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'
                  } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent-orange/50 transition-colors`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                I want to join as a...
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Listener Option */}
                <div
                  onClick={() => setFormData(prev => ({ ...prev, role: 'listener' }))}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.role === 'listener'
                      ? 'border-accent-orange bg-accent-orange/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.role === 'listener'
                        ? 'border-accent-orange bg-accent-orange'
                        : 'border-white/30'
                    }`}>
                      {formData.role === 'listener' && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">👂 Listener</div>
                      <div className="text-sm text-gray-400">Discover and enjoy music</div>
                    </div>
                  </div>
                </div>

                {/* Artist Option */}
                <div
                  onClick={() => setFormData(prev => ({ ...prev, role: 'artist' }))}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.role === 'artist'
                      ? 'border-accent-blue bg-accent-blue/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.role === 'artist'
                        ? 'border-accent-blue bg-accent-blue'
                        : 'border-white/30'
                    }`}>
                      {formData.role === 'artist' && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">🎤 Artist / Singer</div>
                      <div className="text-sm text-gray-400">Create and share music</div>
                    </div>
                  </div>
                </div>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-400">{errors.role}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="w-4 h-4 mt-1 rounded border-white/10 bg-white/5 text-accent-orange focus:ring-accent-orange focus:ring-offset-0"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-accent-orange hover:text-accent-red transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-accent-orange hover:text-accent-red transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-accent-orange to-accent-red text-white font-medium rounded-xl hover:shadow-lg hover:shadow-accent-orange/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-accent-orange hover:text-accent-red font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
