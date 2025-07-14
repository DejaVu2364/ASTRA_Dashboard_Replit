import { motion } from "framer-motion";
import { Activity, AlertTriangle, Users, TrendingUp } from "lucide-react";

interface PulseCardProps {
  title: string;
  value: string;
  status: "active" | "warning" | "critical";
  icon: "activity" | "alert" | "users" | "trending";
  subtitle?: string;
  delay?: number;
}

export default function PulseCard({ 
  title, 
  value, 
  status, 
  icon, 
  subtitle, 
  delay = 0 
}: PulseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-electric-blue text-electric-blue";
      case "warning":
        return "border-warning-amber text-warning-amber";
      case "critical":
        return "border-danger-red text-danger-red";
      default:
        return "border-electric-blue text-electric-blue";
    }
  };

  const getIcon = () => {
    const iconProps = { className: "w-6 h-6" };
    switch (icon) {
      case "activity":
        return <Activity {...iconProps} />;
      case "alert":
        return <AlertTriangle {...iconProps} />;
      case "users":
        return <Users {...iconProps} />;
      case "trending":
        return <TrendingUp {...iconProps} />;
      default:
        return <Activity {...iconProps} />;
    }
  };

  return (
    <motion.div
      className={`data-card p-6 rounded-xl relative overflow-hidden ${getStatusColor(status)}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Pulse Ring Animation */}
      <div className="absolute inset-0 rounded-xl">
        <motion.div
          className={`absolute inset-0 rounded-xl border-2 ${getStatusColor(status)}`}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Scanning Line Effect */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <motion.div
          className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-transparent via-electric-blue to-transparent opacity-60`}
          animate={{
            x: [-4, 320],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-current/20 ${getStatusColor(status)}`}>
            {getIcon()}
          </div>
          <motion.div
            className={`w-3 h-3 rounded-full ${getStatusColor(status).replace('text-', 'bg-')}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="space-y-2">
          <motion.div
            className="text-3xl font-bold font-heading text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          
          <div className="text-sm font-medium text-gray-300">{title}</div>
          
          {subtitle && (
            <div className="text-xs text-gray-400">{subtitle}</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}