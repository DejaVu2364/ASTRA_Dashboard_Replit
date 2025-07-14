import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
    }));

    return () => {};
  }, []);

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
  }));

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-0.5 h-0.5 bg-electric-blue rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
