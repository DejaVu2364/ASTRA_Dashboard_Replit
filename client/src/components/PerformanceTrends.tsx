import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@shared/schema";
import { useState } from "react";

export default function PerformanceTrends() {
  const [viewMode, setViewMode] = useState<'monthly' | 'topic'>('monthly');
  
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate monthly performance trends
  const monthlyData = posts?.reduce((acc, post) => {
    const month = post.analysisMonth || '2025-01';
    const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' });
    
    const existing = acc.find(item => item.month === monthName);
    const sentiment = parseFloat(post.avgSentimentScore || '0');
    const engagement = parseFloat(post.weightedEngagementRate || '0');
    
    if (existing) {
      existing.sentimentScores.push(sentiment);
      existing.engagementRates.push(engagement);
    } else {
      acc.push({
        month: monthName,
        sentimentScores: [sentiment],
        engagementRates: [engagement]
      });
    }
    return acc;
  }, [] as Array<{month: string, sentimentScores: number[], engagementRates: number[]}>)?.map(item => ({
    month: item.month,
    avgSentiment: item.sentimentScores.reduce((sum, score) => sum + score, 0) / item.sentimentScores.length,
    avgEngagement: item.engagementRates.reduce((sum, rate) => sum + rate, 0) / item.engagementRates.length
  })).filter(item => !isNaN(item.avgSentiment) && !isNaN(item.avgEngagement)) || [];

  // Calculate topic performance
  const topicData = posts?.reduce((acc, post) => {
    const topic = post.mainTopic || 'Unknown';
    const existing = acc.find(item => item.topic === topic);
    const sentiment = parseFloat(post.avgSentimentScore || '0');
    const engagement = parseFloat(post.weightedEngagementRate || '0');
    
    if (existing) {
      existing.sentimentScores.push(sentiment);
      existing.engagementRates.push(engagement);
      existing.postCount++;
    } else {
      acc.push({
        topic,
        sentimentScores: [sentiment],
        engagementRates: [engagement],
        postCount: 1
      });
    }
    return acc;
  }, [] as Array<{topic: string, sentimentScores: number[], engagementRates: number[], postCount: number}>)?.map(item => ({
    topic: item.topic,
    avgSentiment: item.sentimentScores.reduce((sum, score) => sum + score, 0) / item.sentimentScores.length,
    avgEngagement: item.engagementRates.reduce((sum, rate) => sum + rate, 0) / item.engagementRates.length,
    postCount: item.postCount
  })).filter(item => !isNaN(item.avgSentiment) && !isNaN(item.avgEngagement)) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-morphism p-3 rounded-lg border border-obsidian-border">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-electric-blue">
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
          Performance & Trend Analysis
        </h2>
        <p className="text-gray-400">
          Track sentiment and engagement patterns over time and across topics
        </p>
      </div>

      {/* Control Panel */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold text-white">
            Analysis View
          </h3>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setViewMode('monthly')}
              variant={viewMode === 'monthly' ? 'default' : 'outline'}
              className={viewMode === 'monthly' ? 'bg-electric-blue text-obsidian-darker' : ''}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Monthly Trends
            </Button>
            <Button
              onClick={() => setViewMode('topic')}
              variant={viewMode === 'topic' ? 'default' : 'outline'}
              className={viewMode === 'topic' ? 'bg-electric-blue text-obsidian-darker' : ''}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Topic Performance
            </Button>
          </div>
        </div>

        {viewMode === 'monthly' ? (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Performance Over Time
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="avgSentiment" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Avg Sentiment"
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgEngagement" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Avg Engagement"
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyData.slice(-3).map((month, index) => (
                <motion.div
                  key={month.month}
                  className="bg-obsidian-surface p-4 rounded-lg border border-obsidian-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white mb-2">{month.month}</div>
                    <div className="text-sm text-gray-400 mb-1">Sentiment</div>
                    <div className={`text-xl font-bold mb-3 ${
                      month.avgSentiment > 0 ? 'text-verified-green' : 'text-danger-red'
                    }`}>
                      {month.avgSentiment > 0 ? '+' : ''}{month.avgSentiment.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">Engagement</div>
                    <div className="text-lg font-bold text-electric-blue">
                      {(month.avgEngagement * 100).toFixed(1)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Topic Performance Comparison
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="topic" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgSentiment" fill="#10b981" name="Avg Sentiment" />
                  <Bar dataKey="avgEngagement" fill="#3b82f6" name="Avg Engagement" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topicData.map((topic, index) => (
                <motion.div
                  key={topic.topic}
                  className="bg-obsidian-surface p-4 rounded-lg border border-obsidian-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="text-center">
                    <Badge variant="outline" className="mb-3">
                      {topic.topic}
                    </Badge>
                    <div className="text-sm text-gray-400 mb-1">Posts</div>
                    <div className="text-lg font-bold text-white mb-2">{topic.postCount}</div>
                    <div className="text-sm text-gray-400 mb-1">Sentiment</div>
                    <div className={`text-lg font-bold mb-2 ${
                      topic.avgSentiment > 0 ? 'text-verified-green' : 'text-danger-red'
                    }`}>
                      {topic.avgSentiment > 0 ? '+' : ''}{topic.avgSentiment.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">Engagement</div>
                    <div className="text-lg font-bold text-electric-blue">
                      {(topic.avgEngagement * 100).toFixed(1)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}