import { Switch, Route } from "wouter";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import IntroScreen from "./components/IntroScreen";
import CommandCenter from "./components/CommandCenter";
import ParticleBackground from "./components/ParticleBackground";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [showIntro, setShowIntro] = useState(true);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-white text-xl">Loading ASTRA Intelligence...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={login} />;
  }

  const handleIntroComplete = () => {
    setShowIntro(false);
  };



  const renderContent = () => {
    return <CommandCenter />;
  };

  return (
    <div className="min-h-screen bg-obsidian text-foreground overflow-x-hidden">
      <ParticleBackground />
      
      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroScreen 
            key="intro" 
            onComplete={handleIntroComplete} 
          />
        ) : (
          <div key="app" className="min-h-screen relative z-20">
            {renderContent()}
          </div>
        )}
      </AnimatePresence>
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
