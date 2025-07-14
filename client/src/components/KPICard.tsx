import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface KPICardProps {
  title: string;
  value: number;
  change: string;
  icon: string;
  color: string;
  delay?: number;
}

export default function KPICard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  delay = 0 
}: KPICardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = value / 100;
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 20);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'electric-blue':
        return 'bg-electric-blue/20 text-electric-blue';
      case 'verified-green':
        return 'bg-verified-green/20 text-verified-green';
      case 'purple-500':
        return 'bg-purple-500/20 text-purple-400';
      case 'red-500':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      ref={ref}
      className="glass-morphism p-6 rounded-xl hover:scale-105 transition-transform duration-300"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        boxShadow: "0 10px 30px rgba(0, 191, 255, 0.3)",
        scale: 1.05 
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(color)}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <span className={`text-xs ${change.startsWith('+') ? 'text-verified-green' : 'text-red-400'}`}>
          {change}
        </span>
      </div>
      <motion.div 
        className="text-2xl font-bold text-white mb-1"
        key={displayValue}
      >
        {displayValue.toLocaleString()}
      </motion.div>
      <div className="text-sm text-gray-400">{title}</div>
    </motion.div>
  );
}
