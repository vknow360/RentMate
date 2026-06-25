const GlassCard = ({ children, className = '', tilt = false, glow = false, ...props }) => {
  const classes = [
    'glass-card',
    tilt ? 'tilt-3d hover-lift' : '',
    glow ? 'hover:shadow-[0_0_20px_rgba(212,165,116,0.3)] transition-shadow duration-300' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
