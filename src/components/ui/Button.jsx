import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * Enterprise-ready with variants, sizes, and states
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-lg shadow-primary-500/20',
    secondary: 'bg-white/5 hover:bg-white/10 text-white focus:ring-white/20 border border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-white focus:ring-white/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2 text-base rounded-lg gap-2',
    lg: 'px-6 py-3 text-lg rounded-xl gap-2',
    icon: 'p-2 rounded-lg',
  };

  const combinedClassName = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={combinedClassName}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {!isLoading && leftIcon && leftIcon}
      {children}
      {!isLoading && rightIcon && rightIcon}
    </motion.button>
  );
}
