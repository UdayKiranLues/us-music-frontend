const GlassCard = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`
        bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 
        ${hover ? 'hover:bg-white/10 hover:border-white/20 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
