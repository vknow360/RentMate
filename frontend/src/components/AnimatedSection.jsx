import { useEffect, useRef, useState } from 'react';

const AnimatedSection = ({ children, className = '', delay = 0, direction = 'up', threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    
    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch(direction) {
      case 'left': return 'fade-slide-left';
      case 'right': return 'fade-slide-right';
      case 'up':
      default:
        return 'fade-slide-up';
    }
  };

  return (
    <div
      ref={domRef}
      className={`${getAnimationClass()} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
