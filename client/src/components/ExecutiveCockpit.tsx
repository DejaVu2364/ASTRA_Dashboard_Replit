import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Post, Analytics } from "@shared/schema";
import { useMemo } from "react";

export default function ExecutiveCockpit() {
  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Memoize expensive calculations
  const metrics = useMemo(() => {
    if (!posts || posts.length === 0) return null;
    
    let totalSentiment = 0;
    let totalEngagement = 0;
    let totalComments = 0;
    let totalVariance = 0;
    let topPost = posts[0];
    let controversialPost = posts[0];
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let topicMap = new Map();
    
    posts.forEach(post => {
      const sentiment = parseFloat(post.avgSentimentScore || '0');
      const engagement = parseFloat(post.weightedEngagementRate || '0');
      const variance = parseFloat(post.sentimentVariance || '0');
      
      totalSentiment += sentiment;
      totalEngagement += engagement;
      totalComments += post.commentCount;
      totalVariance += variance;
      
      // Track topics
      if (post.mainTopic && post.mainTopic !== 'N/A') {
        topicMap.set(post.mainTopic, (topicMap.get(post.mainTopic) || 0) + 1);
      }
      
      if (engagement > parseFloat(topPost.weightedEngagementRate || '0')) {
        topPost = post;
      }
      
      if (variance > parseFloat(controversialPost.sentimentVariance || '0')) {
        controversialPost = post;
      }
      
      if (sentiment > 0.2) positiveCount++;
      else if (sentiment < -0.2) negativeCount++;
      else neutralCount++;
    });
    
    // Get top 3 topics
    const topTopics = Array.from(topicMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, count }));
    
    return {
      avgSentiment: totalSentiment / posts.length,
      avgEngagement: totalEngagement / posts.length,
      avgVariance: totalVariance / posts.length,
      totalComments,
      totalPosts: posts.length,
      topPost,
      controversialPost,
      topTopics,
      sentimentData: [
        { name: 'Positive', value: positiveCount, color: '#00ff88', gradient: 'from-green-400 to-green-600' },
        { name: 'Neutral', value: neutralCount, color: '#8b9dc3', gradient: 'from-blue-400 to-blue-600' },
        { name: 'Negative', value: negativeCount, color: '#ff4757', gradient: 'from-red-400 to-red-600' }
      ]
    };
  }, [posts]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / metrics?.totalPosts) * 100).toFixed(1);
      return (
        <div className="glass-morphism p-3 rounded-lg border border-electric-blue/30 shadow-lg">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            <p className="text-white font-medium">{data.name}</p>
          </div>
          <p className="text-electric-blue text-sm mt-1">
            {data.value} posts ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (postsLoading || analyticsLoading) {
    return (
      <div className="space-y-8">
        <div className="command-header p-6 rounded-xl">
          <h2 className="text-3xl font-heading font-bold text-white mb-2">
            Executive Performance Snapshot
          </h2>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-morphism p-6 rounded-xl animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-8">
        <div className="command-header p-6 rounded-xl">
          <h2 className="text-3xl font-heading font-bold text-white mb-2">
            Executive Performance Snapshot
          </h2>
          <p className="text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="command-header p-6 rounded-xl">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          Executive Performance Snapshot
        </h2>
        <p className="text-gray-400">
          AI-powered intelligence overview with strategic insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-2">Total Posts</h3>
          <p className="text-2xl font-bold text-electric-blue">{metrics.totalPosts}</p>
          <p className="text-sm text-gray-400">Content pieces</p>
        </div>
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-2">Avg Sentiment</h3>
          <p className={`text-2xl font-bold ${metrics.avgSentiment > 0.2 ? 'text-verified-green' : metrics.avgSentiment < -0.2 ? 'text-danger-red' : 'text-warning-amber'}`}>
            {(metrics.avgSentiment * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">Public opinion</p>
        </div>
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-2">Avg Engagement</h3>
          <p className="text-2xl font-bold text-electric-blue">{(metrics.avgEngagement * 100).toFixed(2)}%</p>
          <p className="text-sm text-gray-400">Interaction rate</p>
        </div>
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-2">Total Reach</h3>
          <p className="text-2xl font-bold text-electric-blue">{(metrics.totalComments * 45).toLocaleString()}</p>
          <p className="text-sm text-gray-400">Est. impressions</p>
        </div>
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-2">Sentiment Stability</h3>
          <p className={`text-2xl font-bold ${metrics.avgVariance < 0.3 ? 'text-verified-green' : metrics.avgVariance > 0.6 ? 'text-danger-red' : 'text-warning-amber'}`}>
            {(metrics.avgVariance * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">Opinion volatility</p>
        </div>
      </div>

      {/* AI Campaign Health Overview */}
      <div className="glass-morphism p-6 rounded-xl">
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          AI Campaign Health Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-300 mb-3">
              <span className={`font-semibold ${metrics.avgSentiment > 0.2 ? 'text-verified-green' : metrics.avgSentiment < -0.2 ? 'text-danger-red' : 'text-warning-amber'}`}>
                Campaign health is {metrics.avgSentiment > 0.2 ? 'strong' : metrics.avgSentiment < -0.2 ? 'at risk' : 'stable'}
              </span> with {(metrics.avgSentiment * 100).toFixed(1)}% sentiment, {(metrics.avgEngagement * 100).toFixed(2)}% engagement, and {(metrics.totalComments * 45).toLocaleString()} estimated reach.
            </p>
            {metrics.avgVariance > 0.6 && (
              <p className="text-danger-red text-sm mb-2">
                ⚠️ High opinion volatility detected ({(metrics.avgVariance * 100).toFixed(1)}%)
              </p>
            )}
            <p className="text-sm text-electric-blue">
              Focus on {metrics.topTopics[0]?.topic || 'engagement'} content to maintain momentum.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Top Discussion Topics</h4>
            <div className="space-y-1">
              {metrics.topTopics.map((topic, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{topic.topic}</span>
                  <span className="text-electric-blue">{topic.count} posts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-xl font-heading font-bold text-white mb-4">
            Sentiment Distribution
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#0a0a0a"
                  strokeWidth={3}
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {metrics.sentimentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{
                        filter: `drop-shadow(0 0 15px ${entry.color}50)`,
                        transition: 'all 0.3s ease'
                      }}
                      className="hover:opacity-90 cursor-pointer"
                    />
                  ))}
                </Pie>

              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl font-bold text-white drop-shadow-lg">
                  {metrics.totalPosts}
                </div>
                <div className="text-sm text-electric-blue font-medium">Total Posts</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-6">
              {metrics.sentimentData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ 
                      backgroundColor: entry.color,
                      boxShadow: `0 0 8px ${entry.color}60`
                    }}
                  />
                  <span className="text-sm text-gray-300 font-medium">{entry.name}</span>
                  <span className="text-xs text-electric-blue">({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div className="glass-morphism p-6 rounded-xl">
          <h3 className="text-xl font-heading font-bold text-white mb-4">
            Key Posts
          </h3>
          <div className="space-y-4">
            {/* Top Performing Post */}
            <div className="border border-verified-green/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-verified-green">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Top Performing
                </Badge>
                <span className="text-sm text-verified-green">
                  {(parseFloat(metrics.topPost.weightedEngagementRate || '0') * 100).toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">
                {metrics.topPost.postCaption || 'No caption available'}
              </p>
            </div>

            {/* Controversial Post */}
            <div className="border border-warning-amber/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-warning-amber">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Most Controversial
                </Badge>
                <span className="text-sm text-warning-amber">
                  {(parseFloat(metrics.controversialPost.sentimentVariance || '0') * 100).toFixed(1)}% variance
                </span>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">
                {metrics.controversialPost.postCaption || 'No caption available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}