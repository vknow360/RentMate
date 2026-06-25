const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-base">
      <div 
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full animate-float opacity-20 blur-[100px]"
        style={{ 
          background: 'radial-gradient(circle, rgba(212,165,116,0.4) 0%, rgba(212,165,116,0) 70%)',
          animationDuration: '15s' 
        }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full animate-float opacity-15 blur-[120px]"
        style={{ 
          background: 'radial-gradient(circle, rgba(91,138,138,0.5) 0%, rgba(91,138,138,0) 70%)',
          animationDuration: '20s',
          animationDelay: '-5s'
        }}
      />
      <div 
        className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full animate-float opacity-10 blur-[80px]"
        style={{ 
          background: 'radial-gradient(circle, rgba(240,236,228,0.3) 0%, rgba(240,236,228,0) 70%)',
          animationDuration: '18s',
          animationDelay: '-10s'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
