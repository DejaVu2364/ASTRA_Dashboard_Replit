import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, TrendingUp, MessageCircle, Heart, Share2, Eye, Brain, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";

interface SearchResult {
  post: Post;
  relevanceScore: number;
  insights: string[];
}

export default function IntelligenceSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  const metrics = [
    { value: 'all', label: 'All Intelligence', icon: Brain },
    { value: 'sentiment', label: 'Sentiment Analysis', icon: MessageCircle },
    { value: 'engagement', label: 'Engagement Patterns', icon: TrendingUp },
    { value: 'reach', label: 'Reach Analysis', icon: Eye },
    { value: 'influence', label: 'Influence Mapping', icon: Target },
  ];

  const performIntelligenceSearch = async () => {
    if (!searchQuery.trim() || !posts) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results: SearchResult[] = posts
      .filter(post => {
        const searchTerm = searchQuery.toLowerCase();
        const content = post.content?.toLowerCase() || '';
        const topic = post.mainTopic?.toLowerCase() || '';
        
        return content.includes(searchTerm) || topic.includes(searchTerm);
      })
      .map(post => {
        const insights = generateInsights(post, searchQuery, selectedMetric);
        const relevanceScore = calculateRelevanceScore(post, searchQuery);
        
        return {
          post,
          relevanceScore,
          insights
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
    
    setSearchResults(results);
    setIsAnalyzing(false);
  };

  const generateInsights = (post: Post, query: string, metric: string): string[] => {
    const insights: string[] = [];
    const sentiment = parseFloat(post.avgSentimentScore || '0');
    const engagement = parseFloat(post.weightedEngagementRate || '0') * 100;
    
    // Strategic insights based on data
    if (metric === 'all' || metric === 'sentiment') {
      if (sentiment > 0.7) {
        insights.push("🎯 High positive sentiment - leverage for campaign amplification");
      } else if (sentiment < 0.3) {
        insights.push("⚠️ Negative sentiment detected - requires damage control strategy");
      }
    }
    
    if (metric === 'all' || metric === 'engagement') {
      if (engagement > 2.0) {
        insights.push("🚀 Viral potential - consider boosting similar content");
      } else if (engagement < 0.5) {
        insights.push("📈 Low engagement - analyze timing and messaging");
      }
    }
    
    if (metric === 'all' || metric === 'reach') {
      const totalReach = post.totalLikes + post.numShares + post.commentCount;
      if (totalReach > 1000) {
        insights.push("🌟 High reach achieved - successful message framing");
      }
    }
    
    if (metric === 'all' || metric === 'influence') {
      const shareRatio = post.numShares / (post.totalLikes + 1);
      if (shareRatio > 0.1) {
        insights.push("💡 High share rate - content drives conversation");
      }
    }
    
    return insights.length > 0 ? insights : ["📊 Standard performance metrics within expected range"];
  };

  const calculateRelevanceScore = (post: Post, query: string): number => {
    const queryTerms = query.toLowerCase().split(' ');
    const content = post.content?.toLowerCase() || '';
    const topic = post.mainTopic?.toLowerCase() || '';
    
    let score = 0;
    
    queryTerms.forEach(term => {
      if (content.includes(term)) score += 10;
      if (topic.includes(term)) score += 15;
    });
    
    // Boost score for high-performing posts
    const engagement = parseFloat(post.weightedEngagementRate || '0') * 100;
    score += engagement * 2;
    
    return score;
  };

  const getMetricIcon = (metric: string) => {
    const metricData = metrics.find(m => m.value === metric);
    return metricData ? metricData.icon : Brain;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-morphism p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="w-6 h-6 text-electric-blue mr-3" />
          <h3 className="text-xl font-heading font-bold text-white">
            Political Intelligence Search
          </h3>
        </div>
        <div className="text-sm text-gray-400">
          Advanced AI-powered political analysis
        </div>
      </div>

      {/* Search Interface */}
      <div className="space-y-4 mb-6">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search political narratives, topics, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-obsidian-surface border border-obsidian-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue"
              onKeyDown={(e) => e.key === 'Enter' && performIntelligenceSearch()}
            />
          </div>
          <Button
            onClick={performIntelligenceSearch}
            disabled={!searchQuery.trim() || isAnalyzing}
            className="bg-electric-blue hover:bg-blue-600 text-obsidian-darker px-6"
          >
            {isAnalyzing ? 'Analyzing...' : 'Search'}
          </Button>
        </div>

        {/* Intelligence Metrics Filter */}
        <div className="flex flex-wrap gap-2">
          {metrics.map(metric => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.value}
                onClick={() => setSelectedMetric(metric.value)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedMetric === metric.value
                    ? 'bg-electric-blue text-obsidian-darker'
                    : 'bg-obsidian-surface text-gray-300 hover:bg-obsidian-darker'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis Results */}
      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue"></div>
          <span className="ml-3 text-gray-400">Analyzing political intelligence...</span>
        </div>
      )}

      {searchResults.length > 0 && !isAnalyzing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">
              Intelligence Analysis Results
            </h4>
            <Badge variant="outline" className="text-electric-blue border-electric-blue">
              {searchResults.length} strategic insights found
            </Badge>
          </div>

          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <motion.div
                key={result.post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-obsidian-surface border border-obsidian-border rounded-lg p-4 hover:border-electric-blue/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Badge variant="secondary" className="mr-2">
                        {result.post.mainTopic || 'Unknown Topic'}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        Relevance: {result.relevanceScore.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {result.post.content?.substring(0, 150)}...
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {result.post.totalLikes}
                    </div>
                    <div className="flex items-center">
                      <Share2 className="w-4 h-4 mr-1" />
                      {result.post.numShares}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {result.post.commentCount}
                    </div>
                  </div>
                </div>

                {/* Strategic Insights */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-white">Strategic Insights:</h5>
                  {result.insights.map((insight, i) => (
                    <div key={i} className="text-sm text-gray-300 bg-obsidian-darker p-2 rounded">
                      {insight}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !isAnalyzing && (
        <div className="text-center py-8 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No intelligence matches found for "{searchQuery}"</p>
          <p className="text-sm mt-1">Try different keywords or topics</p>
        </div>
      )}
    </motion.div>
  );
}