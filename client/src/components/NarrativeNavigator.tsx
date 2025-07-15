import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp, MessageSquare, Target, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@shared/schema";
import { useState } from "react";

export default function NarrativeNavigator() {
  const [selectedNarrative, setSelectedNarrative] = useState<string | null>(null);
  
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch AI narrative analysis
  const { data: aiNarrativeAnalysis, isLoading: narrativeLoading, refetch: refetchNarrative } = useQuery({
    queryKey: ['/api/ai-narrative-analysis'],
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // Analyze narrative patterns from posts (fallback)
  const localNarrativeAnalysis = posts?.reduce((acc, post) => {
    const topic = post.mainTopic || 'General';
    const sentiment = parseFloat(post.avgSentimentScore || '0');
    const engagement = parseFloat(post.weightedEngagementRate || '0');
    
    if (!acc[topic]) {
      acc[topic] = {
        topic,
        posts: [],
        totalEngagement: 0,
        avgSentiment: 0,
        trendDirection: 'neutral',
        narrativeStrength: 0
      };
    }
    
    acc[topic].posts.push(post);
    acc[topic].totalEngagement += engagement;
    acc[topic].avgSentiment = (acc[topic].avgSentiment * (acc[topic].posts.length - 1) + sentiment) / acc[topic].posts.length;
    
    return acc;
  }, {} as Record<string, any>) || {};

  // Calculate narrative strength and trends
  const narratives = Object.values(localNarrativeAnalysis).map((narrative: any) => {
    const postCount = narrative.posts.length;
    const avgEngagement = narrative.totalEngagement / postCount;
    const narrativeStrength = (avgEngagement * 0.4) + (Math.abs(narrative.avgSentiment) * 0.3) + (postCount * 0.3);
    
    // Determine trend direction based on recent posts
    const recentPosts = narrative.posts.slice(-3);
    const recentEngagement = recentPosts.reduce((sum: number, p: any) => 
      sum + parseFloat(p.weightedEngagementRate || '0'), 0) / recentPosts.length;
    const trendDirection = recentEngagement > avgEngagement ? 'rising' : 'declining';
    
    return {
      ...narrative,
      narrativeStrength,
      trendDirection,
      postCount,
      avgEngagement,
      actionableInsight: generateActionableInsight(narrative.topic, narrativeStrength, trendDirection)
    };
  }).sort((a, b) => b.narrativeStrength - a.narrativeStrength);

  function generateActionableInsight(topic: string, strength: number, trend: string) {
    if (strength > 0.01 && trend === 'rising') {
      return `${topic} is trending upward - increase content frequency by 25%`;
    } else if (strength > 0.01 && trend === 'declining') {
      return `${topic} engagement declining - refresh content approach`;
    } else if (strength < 0.005) {
      return `${topic} underperforming - consider pivot or pause`;
    }
    return `${topic} stable - maintain current strategy`;
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-verified-green" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-danger-red rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'rising': return 'verified-green';
      case 'declining': return 'danger-red';
      default: return 'gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="command-header p-6 rounded-xl">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          Narrative Navigator
        </h2>
        <p className="text-gray-400">
          Track emerging narratives and content opportunities across all topics
        </p>
      </div>

      {/* Narrative Overview */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold text-white">
            Active Narratives
          </h3>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-electric-blue">
              {narratives.length} narratives tracked
            </Badge>
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {narratives.slice(0, 9).map((narrative, index) => (
            <motion.div
              key={narrative.topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:border-electric-blue/50 ${
                  selectedNarrative === narrative.topic ? 'border-electric-blue' : ''
                }`}
                onClick={() => setSelectedNarrative(narrative.topic)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-heading text-white">
                      {narrative.topic}
                    </CardTitle>
                    {getTrendIcon(narrative.trendDirection)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {narrative.postCount} posts
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs text-${getTrendColor(narrative.trendDirection)}`}
                    >
                      {narrative.trendDirection}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Narrative Strength</span>
                    <span className="text-white font-medium">
                      {(narrative.narrativeStrength * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avg Sentiment</span>
                    <span className={`font-medium ${
                      narrative.avgSentiment > 0 ? 'text-verified-green' : 'text-danger-red'
                    }`}>
                      {narrative.avgSentiment.toFixed(3)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Engagement</span>
                    <span className="text-white font-medium">
                      {(narrative.avgEngagement * 100).toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-obsidian-border">
                    <p className="text-xs text-gray-300">
                      {narrative.actionableInsight}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Narrative Analysis */}
      {selectedNarrative && (
        <motion.div
          className="glass-morphism p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold text-white">
              Deep Dive: {selectedNarrative}
            </h3>
            <Button variant="outline" size="sm" onClick={() => setSelectedNarrative(null)}>
              Close Analysis
            </Button>
          </div>

          {(() => {
            const narrative = narratives.find(n => n.topic === selectedNarrative);
            if (!narrative) return null;

            return (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-obsidian-surface p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-electric-blue mb-1">
                      {narrative.postCount}
                    </div>
                    <div className="text-sm text-gray-400">Total Posts</div>
                  </div>
                  <div className="bg-obsidian-surface p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-verified-green mb-1">
                      {(narrative.narrativeStrength * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Narrative Strength</div>
                  </div>
                  <div className="bg-obsidian-surface p-4 rounded-lg text-center">
                    <div className={`text-2xl font-bold mb-1 ${
                      narrative.avgSentiment > 0 ? 'text-verified-green' : 'text-danger-red'
                    }`}>
                      {narrative.avgSentiment.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-400">Avg Sentiment</div>
                  </div>
                  <div className="bg-obsidian-surface p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-warning-amber mb-1">
                      {(narrative.avgEngagement * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-400">Avg Engagement</div>
                  </div>
                </div>

                {/* Strategic Recommendations */}
                <div className="bg-obsidian-surface p-6 rounded-lg">
                  <h4 className="text-lg font-heading font-bold text-white mb-4">
                    Strategic Recommendations
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Target className="w-5 h-5 text-electric-blue mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Immediate Action</p>
                        <p className="text-gray-400 text-sm">{narrative.actionableInsight}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-verified-green mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Weekly Focus</p>
                        <p className="text-gray-400 text-sm">
                          {narrative.trendDirection === 'rising' 
                            ? `Capitalize on momentum with 2-3 additional ${selectedNarrative} posts`
                            : `Test new angles for ${selectedNarrative} to reverse declining trend`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-warning-amber mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Content Strategy</p>
                        <p className="text-gray-400 text-sm">
                          Focus on {narrative.avgSentiment > 0 ? 'positive' : 'controversial'} angles to maximize engagement
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Posts */}
                <div className="bg-obsidian-surface p-6 rounded-lg">
                  <h4 className="text-lg font-heading font-bold text-white mb-4">
                    Top Performing Posts
                  </h4>
                  <div className="space-y-3">
                    {narrative.posts
                      .sort((a: any, b: any) => 
                        parseFloat(b.weightedEngagementRate || '0') - parseFloat(a.weightedEngagementRate || '0')
                      )
                      .slice(0, 3)
                      .map((post: any, index: number) => (
                        <div key={post.id} className="flex items-center justify-between p-3 bg-obsidian-darker rounded-lg">
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium mb-1">
                              {post.postCaption?.substring(0, 80)}...
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>Engagement: {(parseFloat(post.weightedEngagementRate || '0') * 100).toFixed(2)}%</span>
                              <span>Sentiment: {parseFloat(post.avgSentimentScore || '0').toFixed(3)}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-electric-blue" />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}