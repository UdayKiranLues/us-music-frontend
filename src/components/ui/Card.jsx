import { motion } from 'framer-motion';
import { glassmorphism } from '../../styles/designTokens';

/**
 * Reusable Card Component
 * Glass morphism card with variants
 */
export default function Card({
  children,
  variant = 'medium',
  hover = false,
  className = '',
  onClick,
  ...props
}) {
  const variants = {
    light: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    medium: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    strong: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    solid: {
      background: '#141414',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  };

  const selectedVariant = variants[variant];

  const Component = onClick || hover ? motion.div : 'div';
  const motionProps = onClick || hover ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: onClick ? { scale: 0.98 } : undefined,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`rounded-xl shadow-xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: selectedVariant.background,
        backdropFilter: selectedVariant.backdropFilter,
        border: selectedVariant.border,
      }}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}
