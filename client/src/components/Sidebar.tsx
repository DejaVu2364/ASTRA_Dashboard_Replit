import { motion } from "framer-motion";
import { 
  Command, 
  Brain, 
  Search, 
  Eye, 
  TrendingUp, 
  Shield,
  Database,
  MessageSquare,
  Target,
  Radar,
  LogOut
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export default function Sidebar({ activeRoute, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: Command },
    { id: 'data-explorer', label: 'Data Explorer', icon: Database },
    { id: 'chat-astra', label: 'Chat with ASTRA', icon: MessageSquare },
    { id: 'insights-challenge', label: 'Insights Challenge', icon: Target },
    { id: 'narrative-scanner', label: 'Narrative Scanner', icon: Radar },
    { id: 'opposition-watch', label: 'Opposition Watch', icon: Shield },
    { id: 'predictive-analytics', label: 'Predictive Analytics', icon: TrendingUp },
  ];

  return (
    <motion.div 
      className="w-64 bg-obsidian-surface glass-morphism border-r border-obsidian-border flex flex-col"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 border-b border-obsidian-border">
        <h1 className="text-2xl font-heading font-bold holographic-text">ASTRA</h1>
        <p className="text-sm text-gray-400 mt-1">Intelligence Nexus</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-electric-blue/20 border border-electric-blue/30 text-electric-blue' 
                  : 'text-gray-400 hover:text-white hover:bg-obsidian-border'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-electric-blue' : 'bg-gray-400'
                }`}
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-obsidian-border space-y-3">
        <motion.div 
          className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-verified-green/20 border border-verified-green/30"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-3 h-3 bg-verified-green rounded-full"
            animate={{ 
              boxShadow: [
                "0 0 5px hsl(145, 80%, 42%)",
                "0 0 20px hsl(145, 80%, 42%)",
                "0 0 5px hsl(145, 80%, 42%)"
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <Shield className="w-4 h-4 text-verified-green" />
          <span className="text-verified-green font-medium">Verified Data</span>
        </motion.div>
        
        <motion.div
          className="flex items-center justify-between px-4 py-2 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>Agent: {user?.username || 'admin'}</span>
          <motion.button
            onClick={logout}
            className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </motion.button>
        </motion.div>
        
        <p className="text-xs text-gray-500 px-4">All systems operational</p>
      </div>
    </motion.div>
  );
}
