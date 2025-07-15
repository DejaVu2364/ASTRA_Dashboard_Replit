import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showInitializing, setShowInitializing] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowSubtitle(true), 1500);
    const timer2 = setTimeout(() => setShowInitializing(true), 2000);
    const timer3 = setTimeout(() => onComplete(), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center flex-col"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <motion.div
        className="text-6xl font-bold text-white mb-4"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        ASTRA
      </motion.div>
      
      {showSubtitle && (
        <motion.div
          className="text-xl text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ fontFamily: 'Source Sans Pro, sans-serif' }}
        >
          INTELLIGENCE NEXUS
        </motion.div>
      )}
      
      {showInitializing && (
        <motion.div
          className="text-gray-400 text-sm flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
          <span>Initializing Command Center...</span>
        </motion.div>
      )}
    </motion.div>
  );
}
