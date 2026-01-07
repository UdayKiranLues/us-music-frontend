import { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

/**
 * Reusable Input Component
 * Form input with label, error states, and icons
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 
            bg-white/5 border border-white/10 
            rounded-lg 
            text-white placeholder-neutral-500 
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || type === 'password' ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {type === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-400' : 'text-neutral-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
