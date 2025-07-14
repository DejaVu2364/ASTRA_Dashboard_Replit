import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Zap, Brain, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  type: 'user' | 'astra';
  content: string;
  timestamp: Date;
}

export default function ChatWithAstra() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'astra',
      content: 'Intelligence systems online. I am ASTRA - your advanced political analysis AI. How can I assist with your intelligence queries today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const astraResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'astra',
        content: generateAstraResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, astraResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAstraResponse = (query: string): string => {
    const responses = [
      "Based on current intelligence data, I've analyzed sentiment patterns across 2.4M social media interactions. The key insights suggest...",
      "Processing your request through the neural networks... The political sentiment analysis indicates a significant shift in public opinion regarding...",
      "Intelligence gathered from multiple sources shows elevated engagement metrics. Cross-referencing with historical patterns reveals...",
      "Deploying advanced analytics on your query. The data correlation suggests strategic opportunities in the following areas...",
      "Real-time monitoring systems have detected emerging narratives. The sentiment variance analysis indicates..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickActions = [
    { icon: Brain, label: "Analyze Sentiment", query: "Analyze the current sentiment trends" },
    { icon: Zap, label: "Quick Summary", query: "Give me a quick summary of today's data" },
    { icon: Shield, label: "Threat Assessment", query: "Perform a threat assessment on recent activities" },
  ];

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <motion.div
        className="command-header p-6 rounded-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          Chat with ASTRA
        </h2>
        <p className="text-gray-400">
          Interact with our advanced AI for real-time political intelligence analysis
        </p>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        className="glass-morphism rounded-xl overflow-hidden flex flex-col h-[600px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`max-w-[80%] flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-electric-blue/20' : 'bg-verified-green/20'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-electric-blue" />
                    ) : (
                      <Bot className="w-4 h-4 text-verified-green" />
                    )}
                  </div>
                  <div className={`rounded-xl p-4 ${
                    message.type === 'user' 
                      ? 'bg-electric-blue/20 border border-electric-blue/30' 
                      : 'bg-obsidian-surface border border-obsidian-border'
                  }`}>
                    <p className="text-white text-sm">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-verified-green/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-verified-green" />
                </div>
                <div className="bg-obsidian-surface border border-obsidian-border rounded-xl p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-verified-green rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-verified-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-verified-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="border-t border-obsidian-border p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  onClick={() => setInput(action.query)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-obsidian-surface hover:bg-electric-blue/10 border border-obsidian-border hover:border-electric-blue/30 text-gray-400 hover:text-electric-blue transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{action.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask ASTRA anything about your intelligence data..."
              className="flex-1 bg-obsidian-surface border border-obsidian-border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-electric-blue hover:bg-electric-glow text-black font-medium"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}