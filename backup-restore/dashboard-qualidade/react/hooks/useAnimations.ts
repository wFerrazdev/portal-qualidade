import { useEffect, useState } from 'react';

export const useAnimations = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return {
    isVisible,
    fadeInUp: {
      initial: { opacity: 0, y: 30 },
      animate: isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
      transition: { duration: 0.6, ease: "easeOut" }
    },
    fadeInDown: {
      initial: { opacity: 0, y: -30 },
      animate: isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 },
      transition: { duration: 0.6, ease: "easeOut" }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 },
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
};
