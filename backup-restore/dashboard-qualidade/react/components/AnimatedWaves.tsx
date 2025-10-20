import React from 'react';
import { motion } from 'framer-motion';

interface WaveProps {
  delay?: number;
  duration?: number;
  color: string;
  opacity?: number;
  path: string;
  animatedPath: string[];
}

const Wave: React.FC<WaveProps> = ({ 
  delay = 0, 
  duration = 8, 
  color, 
  opacity = 0.8, 
  path, 
  animatedPath 
}) => {
  return (
    <motion.svg
      className="absolute w-full h-20"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ delay, duration: 0.5 }}
    >
      <motion.path
        d={path}
        stroke={color}
        strokeWidth="2"
        fill="none"
        animate={{
          d: animatedPath
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }}
      />
    </motion.svg>
  );
};

const AnimatedWaves: React.FC = () => {
  const waves = [
    {
      delay: 0,
      duration: 8,
      color: "url(#gradient1)",
      opacity: 0.8,
      path: "M0,100 Q200,50 400,100 T800,100 T1200,100",
      animatedPath: [
        "M0,100 Q200,50 400,100 T800,100 T1200,100",
        "M0,100 Q200,80 400,100 T800,100 T1200,100",
        "M0,100 Q200,120 400,100 T800,100 T1200,100",
        "M0,100 Q200,60 400,100 T800,100 T1200,100",
        "M0,100 Q200,50 400,100 T800,100 T1200,100"
      ]
    },
    {
      delay: 2,
      duration: 10,
      color: "url(#gradient2)",
      opacity: 0.6,
      path: "M0,100 Q300,80 600,100 T1200,100",
      animatedPath: [
        "M0,100 Q300,80 600,100 T1200,100",
        "M0,100 Q300,60 600,100 T1200,100",
        "M0,100 Q300,120 600,100 T1200,100",
        "M0,100 Q300,90 600,100 T1200,100",
        "M0,100 Q300,80 600,100 T1200,100"
      ]
    },
    {
      delay: 4,
      duration: 12,
      color: "url(#gradient3)",
      opacity: 0.7,
      path: "M0,100 Q400,120 800,100 T1200,100",
      animatedPath: [
        "M0,100 Q400,120 800,100 T1200,100",
        "M0,100 Q400,80 800,100 T1200,100",
        "M0,100 Q400,140 800,100 T1200,100",
        "M0,100 Q400,100 800,100 T1200,100",
        "M0,100 Q400,120 800,100 T1200,100"
      ]
    }
  ];

  return (
    <>
      {/* Gradientes SVG */}
      <svg className="absolute w-0 h-0">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: '#93c5fd', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Ondas */}
      <div className="absolute top-1/4 left-0 w-full">
        <Wave {...waves[0]} />
      </div>
      <div className="absolute top-1/2 left-0 w-full">
        <Wave {...waves[1]} />
      </div>
      <div className="absolute top-3/4 left-0 w-full">
        <Wave {...waves[2]} />
      </div>
    </>
  );
};

export default AnimatedWaves;
