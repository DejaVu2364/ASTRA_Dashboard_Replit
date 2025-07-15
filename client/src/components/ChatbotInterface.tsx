import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, Clock, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "I can help analyze campaign data, sentiment trends, and provide strategic insights. What would you like to explore?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('sentiment') || lowerInput.includes('emotion')) {
      return "Based on the current data, sentiment analysis shows a positive trend with 68% positive sentiment across all content. The highest-performing posts focus on policy achievements and community engagement. Would you like me to analyze specific time periods or content types?";
    }
    
    if (lowerInput.includes('engagement') || lowerInput.includes('reach')) {
      return "Engagement metrics indicate strong performance with average engagement rates of 8.4%. Video content performs 40% better than static posts. Peak engagement occurs between 7-9 PM EST. Should I provide detailed engagement breakdowns by content type?";
    }
    
    if (lowerInput.includes('strategy') || lowerInput.includes('recommend')) {
      return "Strategic recommendations: 1) Increase video content production (3x higher engagement), 2) Optimize posting schedule for 7-9 PM EST, 3) Focus on community-driven content themes. Would you like specific content suggestions or timing strategies?";
    }
    
    if (lowerInput.includes('report') || lowerInput.includes('summary')) {
      return "I can generate comprehensive reports on campaign performance, sentiment analysis, and engagement metrics. Available report types include: Executive Summary, Detailed Analytics, Competitive Analysis, and Strategic Recommendations. Which would you prefer?";
    }
    
    return "I understand you're looking for insights about your campaign data. I can help with sentiment analysis, engagement metrics, content strategy, and performance reports. Could you be more specific about what aspect you'd like to explore?";
  };

  const suggestedQueries = [
    "Analyze sentiment trends for this month",
    "What content performs best?",
    "Generate an executive summary",
    "Recommend posting strategy",
    "Show engagement analytics"
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-2xl font-semibold text-white mb-2 heading-secondary">
            AI Assistant
          </h1>
          <p className="text-gray-500 text-professional">
            Query your campaign data
          </p>
        </motion.div>

        {/* Chat Container */}
        <div className="h-[70vh] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-8 mb-8">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-6 py-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-white text-black'
                      : 'bg-gray-900 text-white border border-gray-800'
                  }`}>
                    <p className="text-sm leading-relaxed text-professional">
                      {message.content}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-2xl">
                  <div className="inline-block bg-gray-900 rounded-2xl px-6 py-4 border border-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggested Queries */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(query)}
                    className="text-left p-4 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-200 text-sm text-gray-300 hover:text-white"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about your campaign data..."
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 text-professional"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-xl transition-all duration-200 ${
                !inputValue.trim() || isTyping
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}