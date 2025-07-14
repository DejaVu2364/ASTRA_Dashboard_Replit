import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 6,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 2 + 1,
  }));

  const dataStreams = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 4,
    height: Math.random() * 60 + 20,
  }));

  return (
    <>
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 cyber-grid opacity-30" />
      
      {/* Ambient Lighting */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-electric-blue/8 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-[32rem] h-[32rem] bg-gradient-to-l from-neon-cyan/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-pulse-blue/3 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        
        {/* Data Stream Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-electric-blue/20 to-transparent animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-electric-blue/15 to-transparent animate-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="absolute left-0 top-1/3 w-full h-px bg-gradient-to-r from-transparent via-electric-blue/10 to-transparent animate-pulse" style={{ animationDelay: "2.5s" }} />
      </motion.div>
      
      {/* Floating Particles */}
      <div 
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-20"
      >
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-electric-blue rounded-full neon-glow"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: particle.speed * 2,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Data Streams */}
        {dataStreams.map((stream) => (
          <motion.div
            key={stream.id}
            className="absolute bg-gradient-to-b from-electric-blue/60 to-transparent"
            style={{
              left: `${stream.x}%`,
              top: "0%",
              width: "1px",
              height: `${stream.height}%`,
            }}
            animate={{
              height: [`${stream.height}%`, `${stream.height + 20}%`, `${stream.height}%`],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: stream.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </>
  );
}
