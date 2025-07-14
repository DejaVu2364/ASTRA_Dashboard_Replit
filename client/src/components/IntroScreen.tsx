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
      className="fixed inset-0 bg-gradient-to-br from-obsidian to-black z-50 flex items-center justify-center flex-col"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="text-6xl font-heading font-black holographic-text"
        initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
      >
        ASTRA
      </motion.div>
      
      {showSubtitle && (
        <motion.div
          className="text-electric-blue text-xl font-heading mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          INTELLIGENCE NEXUS
        </motion.div>
      )}
      
      {showInitializing && (
        <motion.div
          className="text-gray-400 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Initializing Command Center...
        </motion.div>
      )}
    </motion.div>
  );
}
