import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Search, Target, TrendingUp, Eye, MessageCircle, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntelligenceExplainer() {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    {
      icon: Search,
      title: "Narrative Search",
      description: "Search through political posts for specific keywords, topics, or themes to identify trending narratives and their impact."
    },
    {
      icon: MessageCircle,
      title: "Sentiment Analysis",
      description: "Analyze public sentiment on political topics with strategic recommendations for damage control or amplification."
    },
    {
      icon: TrendingUp,
      title: "Engagement Patterns",
      description: "Identify viral content patterns and engagement metrics to optimize future political messaging strategy."
    },
    {
      icon: Eye,
      title: "Reach Analysis",
      description: "Measure content reach and audience penetration to assess campaign effectiveness and message spread."
    },
    {
      icon: Target,
      title: "Influence Mapping",
      description: "Track how content influences public discourse and shapes political conversations in real-time."
    }
  ];

  const strategicInsights = [
    "🎯 High positive sentiment - leverage for campaign amplification",
    "⚠️ Negative sentiment detected - requires damage control strategy",
    "🚀 Viral potential - consider boosting similar content",
    "📈 Low engagement - analyze timing and messaging",
    "🌟 High reach achieved - successful message framing",
    "💡 High share rate - content drives conversation"
  ];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="bg-obsidian-surface border-obsidian-border text-electric-blue hover:bg-obsidian-darker"
      >
        <Info className="w-4 h-4 mr-2" />
        What is Political Intelligence Search?
      </Button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-obsidian-darker border border-obsidian-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-obsidian-border flex items-center justify-between">
              <div className="flex items-center">
                <Brain className="w-6 h-6 text-electric-blue mr-3" />
                <h2 className="text-2xl font-heading font-bold text-white">
                  Political Intelligence Search
                </h2>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Advanced Political Analytics Platform
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  The Political Intelligence Search is a sophisticated analysis tool that transforms raw social media data 
                  into actionable political insights. It combines AI-powered analysis with strategic intelligence to help 
                  political strategists, campaign managers, and media professionals make data-driven decisions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Intelligence Capabilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="bg-obsidian-surface p-4 rounded-lg border border-obsidian-border">
                        <div className="flex items-start">
                          <Icon className="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-white mb-1">{feature.title}</h4>
                            <p className="text-sm text-gray-400">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Strategic Intelligence Output
                </h3>
                <p className="text-gray-300 mb-4">
                  Each search provides real-time strategic recommendations based on data analysis:
                </p>
                <div className="bg-obsidian-surface p-4 rounded-lg border border-obsidian-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {strategicInsights.map((insight, index) => (
                      <div key={index} className="text-sm text-gray-300 py-1">
                        {insight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  How to Use
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-electric-blue text-obsidian-darker rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Search Keywords</h4>
                      <p className="text-sm text-gray-400">Enter political topics, candidate names, or policy keywords</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-electric-blue text-obsidian-darker rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Select Analysis Type</h4>
                      <p className="text-sm text-gray-400">Choose from sentiment, engagement, reach, or influence analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-electric-blue text-obsidian-darker rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Get Strategic Insights</h4>
                      <p className="text-sm text-gray-400">Receive actionable recommendations for campaign strategy</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-electric-blue mb-2">
                  Real Data Analysis
                </h3>
                <p className="text-sm text-gray-300">
                  This system analyzes authentic social media data from Dr. Prabha Mallikarjun's Facebook page, 
                  providing genuine insights into political engagement patterns, sentiment trends, and audience responses.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}