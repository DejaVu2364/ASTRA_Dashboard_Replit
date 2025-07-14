import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, GaugeChart } from "recharts";
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Post, Analytics } from "@shared/schema";

export default function ExecutiveCockpit() {
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: analytics } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate executive metrics
  const avgSentiment = posts?.reduce((sum, post) => sum + parseFloat(post.avgSentimentScore || '0'), 0) / (posts?.length || 1) || 0;
  const avgEngagement = posts?.reduce((sum, post) => sum + parseFloat(post.weightedEngagementRate || '0'), 0) / (posts?.length || 1) || 0;
  const totalComments = posts?.reduce((sum, post) => sum + post.commentCount, 0) || 0;
  const totalPosts = posts?.length || 0;

  // Find top performing and controversial posts
  const topPost = posts?.reduce((max, post) => 
    parseFloat(post.weightedEngagementRate || '0') > parseFloat(max.weightedEngagementRate || '0') ? post : max
  , posts[0]);

  const controversialPost = posts?.reduce((max, post) => 
    parseFloat(post.sentimentVariance || '0') > parseFloat(max.sentimentVariance || '0') ? post : max
  , posts[0]);

  // Sentiment distribution for donut chart
  const sentimentData = [
    { name: 'Positive', value: posts?.filter(p => parseFloat(p.avgSentimentScore || '0') > 0.2).length || 0, color: '#10b981' },
    { name: 'Neutral', value: posts?.filter(p => {
      const score = parseFloat(p.avgSentimentScore || '0');
      return score >= -0.2 && score <= 0.2;
    }).length || 0, color: '#6b7280' },
    { name: 'Negative', value: posts?.filter(p => parseFloat(p.avgSentimentScore || '0') < -0.2).length || 0, color: '#ef4444' }
  ];

  // Gauge chart data
  const gaugeData = [
    { value: Math.abs(avgSentiment) * 100, color: avgSentiment > 0.2 ? '#10b981' : avgSentiment < -0.2 ? '#ef4444' : '#fbbf24' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-morphism p-3 rounded-lg border border-obsidian-border">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-electric-blue">Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="command-header p-6 rounded-xl">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          Executive Performance Snapshot
        </h2>
        <p className="text-gray-400">
          Real-time intelligence overview with strategic insights
        </p>
      </div>

      {/* Top Row - Sentiment Gauge & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Gauge */}
        <motion.div
          className="glass-morphism p-6 rounded-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-xl font-heading font-bold text-white mb-4">
            Overall Sentiment Score
          </h3>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: Math.abs(avgSentiment) * 100, color: avgSentiment > 0.2 ? '#10b981' : avgSentiment < -0.2 ? '#ef4444' : '#fbbf24' },
                    { value: 100 - Math.abs(avgSentiment) * 100, color: '#1f2937' }
                  ]}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {avgSentiment > 0 ? '+' : ''}{avgSentiment.toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sentiment Distribution Donut */}
        <motion.div
          className="glass-morphism p-6 rounded-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-heading font-bold text-white mb-4">
            Sentiment Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {sentimentData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Core Metrics Row */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-6">
          Core Metrics & Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-electric-blue mb-2">
              {(avgEngagement * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">Average Engagement Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-verified-green mb-2">
              {totalComments.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Comments</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-amber mb-2">
              {totalPosts.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Posts</div>
          </div>
        </div>
      </motion.div>

      {/* Highlight Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Post */}
        <motion.div
          className="glass-morphism p-6 rounded-xl border border-verified-green/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center mb-4">
            <Award className="w-6 h-6 text-verified-green mr-3" />
            <h3 className="text-xl font-heading font-bold text-white">
              Top Performing Post
            </h3>
          </div>
          {topPost && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-verified-green border-verified-green">
                  {topPost.mainTopic}
                </Badge>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Engagement</div>
                  <div className="text-lg font-bold text-verified-green">
                    {(parseFloat(topPost.weightedEngagementRate || '0') * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-300 bg-obsidian-surface p-3 rounded">
                {topPost.content?.substring(0, 150)}...
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>👍 {topPost.totalLikes}</span>
                <span>🔄 {topPost.numShares}</span>
                <span>💬 {topPost.commentCount}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Most Controversial Post */}
        <motion.div
          className="glass-morphism p-6 rounded-xl border border-danger-red/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-danger-red mr-3" />
            <h3 className="text-xl font-heading font-bold text-white">
              Most Controversial Post
            </h3>
          </div>
          {controversialPost && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-danger-red border-danger-red">
                  {controversialPost.mainTopic}
                </Badge>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Variance</div>
                  <div className="text-lg font-bold text-danger-red">
                    {parseFloat(controversialPost.sentimentVariance || '0').toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-300 bg-obsidian-surface p-3 rounded">
                {controversialPost.content?.substring(0, 150)}...
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>👍 {controversialPost.totalLikes}</span>
                <span>🔄 {controversialPost.numShares}</span>
                <span>💬 {controversialPost.commentCount}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}