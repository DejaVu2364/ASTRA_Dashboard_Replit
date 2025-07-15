import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock, Users, Heart, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@shared/schema";
import { useState } from "react";

export default function EngagementAnalytics() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'sentiment' | 'reach'>('engagement');
  
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  // Process engagement data
  const engagementData = posts?.map(post => ({
    postId: post.postId,
    caption: post.postCaption?.substring(0, 30) + '...',
    totalEngagement: post.totalLikes + post.numShares + post.commentCount,
    engagementRate: parseFloat(post.weightedEngagementRate || '0'),
    sentiment: parseFloat(post.avgSentimentScore || '0'),
    likes: post.totalLikes,
    shares: post.numShares,
    comments: post.commentCount,
    contentType: post.contentType,
    topic: post.mainTopic,
    timestamp: post.createdAt
  })).sort((a, b) => b.totalEngagement - a.totalEngagement) || [];

  // Calculate engagement trends
  const engagementTrends = engagementData.slice(0, 20).map((post, index) => ({
    index: index + 1,
    engagement: post.engagementRate * 100,
    sentiment: post.sentiment,
    reach: post.totalEngagement / 100, // Normalized reach
    label: `Post ${index + 1}`
  }));

  // Engagement by content type
  const contentTypeEngagement = engagementData.reduce((acc, post) => {
    const type = post.contentType || 'Standard';
    if (!acc[type]) {
      acc[type] = { type, totalEngagement: 0, count: 0, avgEngagement: 0 };
    }
    acc[type].totalEngagement += post.totalEngagement;
    acc[type].count += 1;
    acc[type].avgEngagement = acc[type].totalEngagement / acc[type].count;
    return acc;
  }, {} as Record<string, any>);

  const contentTypeData = Object.values(contentTypeEngagement).map((item: any) => ({
    name: item.type,
    value: item.avgEngagement,
    count: item.count,
    fill: getContentTypeColor(item.type)
  }));

  function getContentTypeColor(type: string) {
    const colors = {
      'Video': '#10b981',
      'Image': '#3b82f6',
      'Text': '#f59e0b',
      'Link': '#ef4444',
      'Standard': '#6b7280'
    };
    return colors[type as keyof typeof colors] || '#6b7280';
  }

  // Engagement patterns analysis
  const engagementPatterns = {
    peakEngagement: Math.max(...engagementData.map(p => p.engagementRate)),
    averageEngagement: engagementData.reduce((sum, p) => sum + p.engagementRate, 0) / engagementData.length,
    topPerformingType: Object.values(contentTypeEngagement).sort((a: any, b: any) => b.avgEngagement - a.avgEngagement)[0]?.type,
    engagementVolatility: calculateVolatility(engagementData.map(p => p.engagementRate))
  };

  function calculateVolatility(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Engagement distribution
  const engagementDistribution = [
    { name: 'High (>0.05)', value: engagementData.filter(p => p.engagementRate > 0.05).length, fill: '#10b981' },
    { name: 'Medium (0.02-0.05)', value: engagementData.filter(p => p.engagementRate >= 0.02 && p.engagementRate <= 0.05).length, fill: '#f59e0b' },
    { name: 'Low (<0.02)', value: engagementData.filter(p => p.engagementRate < 0.02).length, fill: '#ef4444' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-morphism p-3 rounded-lg border border-obsidian-border">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(3)}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          Engagement Analytics
        </h2>
        <p className="text-gray-400">
          Deep dive into engagement patterns and performance metrics
        </p>
      </div>

      {/* Controls */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-electric-blue" />
              <span className="text-white font-medium">Time Range:</span>
            </div>
            <div className="flex space-x-2">
              {(['7days', '30days', '90days'] as const).map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                >
                  {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-electric-blue" />
              <span className="text-white font-medium">Metric:</span>
            </div>
            <div className="flex space-x-2">
              {(['engagement', 'sentiment', 'reach'] as const).map((metric) => (
                <Button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  variant={selectedMetric === metric ? 'default' : 'outline'}
                  size="sm"
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Peak Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-verified-green">
                {(engagementPatterns.peakEngagement * 100).toFixed(2)}%
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-verified-green mr-1" />
                <span className="text-sm text-gray-400">Best performing</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-electric-blue">
                {(engagementPatterns.averageEngagement * 100).toFixed(2)}%
              </div>
              <div className="flex items-center mt-1">
                <Activity className="w-4 h-4 text-electric-blue mr-1" />
                <span className="text-sm text-gray-400">Overall average</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Top Content Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning-amber">
                {engagementPatterns.topPerformingType || 'N/A'}
              </div>
              <div className="flex items-center mt-1">
                <Users className="w-4 h-4 text-warning-amber mr-1" />
                <span className="text-sm text-gray-400">Best performing</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Volatility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger-red">
                {(engagementPatterns.engagementVolatility * 100).toFixed(2)}%
              </div>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-danger-red mr-1" />
                <span className="text-sm text-gray-400">Variability</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Engagement Trends */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trends
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={engagementTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="label" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Content Type Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="glass-morphism p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-heading font-bold text-white mb-4">
            Engagement by Content Type
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={contentTypeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value.toFixed(0)}`}
              >
                {contentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="glass-morphism p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-heading font-bold text-white mb-4">
            Engagement Distribution
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#10b981">
                {engagementDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Performing Posts */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          Top Performing Posts
        </h3>
        
        <div className="space-y-4">
          {engagementData.slice(0, 5).map((post, index) => (
            <div key={post.postId} className="bg-obsidian-surface p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {post.contentType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {post.topic}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  Engagement: {(post.engagementRate * 100).toFixed(2)}%
                </div>
              </div>
              
              <p className="text-white mb-3">{post.caption}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="w-4 h-4" />
                  <span>{post.shares.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>Sentiment: {post.sentiment.toFixed(3)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}