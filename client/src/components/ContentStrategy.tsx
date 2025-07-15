import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, Download } from "lucide-react";
import type { Post } from "@shared/schema";
import { useState } from "react";

export default function ContentStrategy() {
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  // Create content strategy quadrant data
  const contentData = posts?.reduce((acc, post) => {
    const contentType = post.contentType || 'Standard';
    const existing = acc.find(item => item.contentType === contentType);
    const sentiment = parseFloat(post.avgSentimentScore || '0');
    const engagement = parseFloat(post.weightedEngagementRate || '0');
    
    if (existing) {
      existing.sentimentScores.push(sentiment);
      existing.engagementRates.push(engagement);
      existing.postCount++;
    } else {
      acc.push({
        contentType,
        sentimentScores: [sentiment],
        engagementRates: [engagement],
        postCount: 1
      });
    }
    return acc;
  }, [] as Array<{contentType: string, sentimentScores: number[], engagementRates: number[], postCount: number}>)?.map(item => ({
    contentType: item.contentType,
    avgSentiment: item.sentimentScores.reduce((sum, score) => sum + score, 0) / item.sentimentScores.length,
    avgEngagement: item.engagementRates.reduce((sum, rate) => sum + rate, 0) / item.engagementRates.length,
    postCount: item.postCount,
    // Determine quadrant
    quadrant: item.sentimentScores.reduce((sum, score) => sum + score, 0) / item.sentimentScores.length > 0 
      ? (item.engagementRates.reduce((sum, rate) => sum + rate, 0) / item.engagementRates.length > 0.002 ? 'High Sentiment, High Engagement' : 'High Sentiment, Low Engagement')
      : (item.engagementRates.reduce((sum, rate) => sum + rate, 0) / item.engagementRates.length > 0.002 ? 'Low Sentiment, High Engagement' : 'Low Sentiment, Low Engagement')
  })) || [];

  const getQuadrantColor = (avgSentiment: number, avgEngagement: number) => {
    if (avgSentiment > 0 && avgEngagement > 0.002) return '#10b981'; // High sentiment, high engagement - green
    if (avgSentiment > 0 && avgEngagement <= 0.002) return '#3b82f6'; // High sentiment, low engagement - blue
    if (avgSentiment <= 0 && avgEngagement > 0.002) return '#f59e0b'; // Low sentiment, high engagement - yellow
    return '#ef4444'; // Low sentiment, low engagement - red
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-morphism p-4 rounded-lg border border-obsidian-border">
          <p className="text-white font-medium mb-2">{data.contentType}</p>
          <p className="text-electric-blue text-sm">Posts: {data.postCount}</p>
          <p className="text-verified-green text-sm">Avg Sentiment: {data.avgSentiment.toFixed(3)}</p>
          <p className="text-warning-amber text-sm">Avg Engagement: {(data.avgEngagement * 100).toFixed(2)}%</p>
          <p className="text-gray-400 text-xs mt-2">{data.quadrant}</p>
        </div>
      );
    }
    return null;
  };

  const quadrantAnalysis = {
    'High Sentiment, High Engagement': {
      color: '#10b981',
      title: 'Star Content',
      description: 'High sentiment with strong engagement - replicate these strategies',
      icon: '⭐',
      posts: contentData.filter(item => item.quadrant === 'High Sentiment, High Engagement')
    },
    'High Sentiment, Low Engagement': {
      color: '#3b82f6',
      title: 'Potential Content',
      description: 'Positive sentiment but low engagement - boost visibility',
      icon: '🔷',
      posts: contentData.filter(item => item.quadrant === 'High Sentiment, Low Engagement')
    },
    'Low Sentiment, High Engagement': {
      color: '#f59e0b',
      title: 'Controversial Content',
      description: 'High engagement but negative sentiment - handle carefully',
      icon: '⚠️',
      posts: contentData.filter(item => item.quadrant === 'Low Sentiment, High Engagement')
    },
    'Low Sentiment, Low Engagement': {
      color: '#ef4444',
      title: 'Underperforming Content',
      description: 'Low sentiment and engagement - needs strategic overhaul',
      icon: '🔴',
      posts: contentData.filter(item => item.quadrant === 'Low Sentiment, Low Engagement')
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
          Content Strategy Analysis
        </h2>
        <p className="text-gray-400">
          Performance quadrant analysis to optimize content strategy
        </p>
      </div>

      {/* Quadrant Chart */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold text-white">
            Content Type Performance Quadrant
          </h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Analysis
          </Button>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              type="number" 
              dataKey="avgEngagement" 
              name="Engagement Rate"
              stroke="#9ca3af"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              type="number" 
              dataKey="avgSentiment" 
              name="Sentiment Score"
              stroke="#9ca3af"
              domain={[-1, 1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={contentData} fill="#8884d8">
              {contentData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getQuadrantColor(entry.avgSentiment, entry.avgEngagement)}
                  onClick={() => setSelectedQuadrant(entry.quadrant)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant Legend */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex items-center justify-center p-4 bg-obsidian-surface rounded-lg border border-verified-green/30">
            <div className="text-center">
              <div className="text-verified-green font-bold mb-1">High Sentiment</div>
              <div className="text-verified-green font-bold">High Engagement</div>
              <div className="text-sm text-gray-400 mt-1">Star Content ⭐</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 bg-obsidian-surface rounded-lg border border-electric-blue/30">
            <div className="text-center">
              <div className="text-electric-blue font-bold mb-1">High Sentiment</div>
              <div className="text-electric-blue font-bold">Low Engagement</div>
              <div className="text-sm text-gray-400 mt-1">Potential Content 🔷</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 bg-obsidian-surface rounded-lg border border-warning-amber/30">
            <div className="text-center">
              <div className="text-warning-amber font-bold mb-1">Low Sentiment</div>
              <div className="text-warning-amber font-bold">High Engagement</div>
              <div className="text-sm text-gray-400 mt-1">Controversial ⚠️</div>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 bg-obsidian-surface rounded-lg border border-danger-red/30">
            <div className="text-center">
              <div className="text-danger-red font-bold mb-1">Low Sentiment</div>
              <div className="text-danger-red font-bold">Low Engagement</div>
              <div className="text-sm text-gray-400 mt-1">Underperforming 🔴</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strategic Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(quadrantAnalysis).map(([quadrant, analysis], index) => (
          <motion.div
            key={quadrant}
            className="glass-morphism p-6 rounded-xl border border-obsidian-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <div className="flex items-center mb-4">
              <div 
                className="w-6 h-6 rounded-full mr-3"
                style={{ backgroundColor: analysis.color }}
              />
              <div>
                <h3 className="text-lg font-heading font-bold text-white">
                  {analysis.icon} {analysis.title}
                </h3>
                <p className="text-sm text-gray-400">{analysis.description}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Content Types:</span>
                <Badge variant="outline">{analysis.posts.length}</Badge>
              </div>
              
              {analysis.posts.slice(0, 3).map((post, postIndex) => (
                <div key={postIndex} className="bg-obsidian-surface p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {post.contentType}
                    </Badge>
                    <span className="text-xs text-gray-400">{post.postCount} posts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">
                      Sentiment: {post.avgSentiment.toFixed(3)}
                    </span>
                    <span className="text-gray-300">
                      Engagement: {(post.avgEngagement * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}