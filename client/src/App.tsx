import { Switch, Route } from "wouter";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import IntroScreen from "./components/IntroScreen";
import Sidebar from "./components/Sidebar";
import CommandCenter from "./components/CommandCenter";
import ParticleBackground from "./components/ParticleBackground";
import NotFound from "@/pages/not-found";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeRoute, setActiveRoute] = useState('command-center');

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleNavigation = (route: string) => {
    setActiveRoute(route);
  };

  const renderContent = () => {
    switch (activeRoute) {
      case 'command-center':
        return <CommandCenter />;
      case 'sentiment-engine':
        return <div className="flex-1 p-8 text-center text-gray-400">Sentiment Engine - Coming Soon</div>;
      case 'narrative-scanner':
        return <div className="flex-1 p-8 text-center text-gray-400">Narrative Scanner - Coming Soon</div>;
      case 'opposition-watch':
        return <div className="flex-1 p-8 text-center text-gray-400">Opposition Watch - Coming Soon</div>;
      case 'predictive-analytics':
        return <div className="flex-1 p-8 text-center text-gray-400">Predictive Analytics - Coming Soon</div>;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-obsidian text-foreground overflow-x-hidden">
          <ParticleBackground />
          
          <AnimatePresence mode="wait">
            {showIntro ? (
              <IntroScreen 
                key="intro" 
                onComplete={handleIntroComplete} 
              />
            ) : (
              <div key="app" className="min-h-screen flex relative z-20">
                <Sidebar 
                  activeRoute={activeRoute} 
                  onNavigate={handleNavigation} 
                />
                {renderContent()}
              </div>
            )}
          </AnimatePresence>
          
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
