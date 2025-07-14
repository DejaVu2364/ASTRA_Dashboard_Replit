import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { Eye, EyeOff, Shield, Zap } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/login', { username, password });
      const data = await response.json();

      if (data.token) {
        localStorage.setItem('astra_token', data.token);
        onLoginSuccess(data.token);
        toast({
          title: "Welcome to ASTRA Intelligence",
          description: "Authentication successful. Initializing secure connection...",
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials. Please check your username and password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-liquid-obsidian flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-electric-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-electric-blue/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-blue/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-dark-surface/80 backdrop-blur-xl p-8 rounded-xl border border-electric-blue/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center mb-4"
            >
              <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center border border-electric-blue/30">
                <Shield className="w-8 h-8 text-electric-blue" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-heading font-bold text-white mb-2"
            >
              ASTRA Intelligence
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-gray-400 text-sm"
            >
              Political Intelligence Command Center
            </motion.p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-dark-surface/50 border border-electric-blue/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue/50 transition-colors"
                placeholder="Enter your username"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-surface/50 border border-electric-blue/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-electric-blue/50 transition-colors pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-electric-blue transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-electric-blue hover:bg-electric-blue/90 text-liquid-obsidian font-semibold rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-liquid-obsidian/30 border-t-liquid-obsidian rounded-full"
                  />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Access Intelligence Center</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="mt-6 p-4 bg-electric-blue/5 rounded-lg border border-electric-blue/20"
          >
            <p className="text-xs text-gray-400 text-center mb-2">Demo Credentials</p>
            <div className="text-xs text-gray-300 text-center space-y-1">
              <p><strong>Username:</strong> admin</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}