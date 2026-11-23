import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface GlobalPageTransitionProps {
  children: React.ReactNode;
}

// Variants untuk smooth slide transition (iOS-like)
const pageVariants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  in: {
    x: 0,
    opacity: 1,
  },
  out: {
    x: '-100%',
    opacity: 0,
  },
};

// Ultra smooth spring transition
const springTransition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
  mass: 0.6,
  duration: 0.4,
};

// Alternative tween transition untuk fallback
const tweenTransition = {
  type: 'tween',
  ease: [0.22, 1, 0.36, 1], // iOS-like easing
  duration: 0.4,
};

const GlobalPageTransition: React.FC<GlobalPageTransitionProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={springTransition}
          className="absolute inset-0 w-full h-full"
          style={{
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            transformOrigin: 'center center',
          }}
        >
          <div 
            className="w-full h-full overflow-hidden"
            style={{
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          >
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GlobalPageTransition;
