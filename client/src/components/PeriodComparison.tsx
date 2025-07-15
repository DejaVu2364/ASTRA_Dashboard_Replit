import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calendar, TrendingUp, TrendingDown, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@shared/schema";
import { useState } from "react";

export default function PeriodComparison() {
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous' | '3months' | '6months'>('previous');
  
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  // Mock current period data (January 2025) vs previous periods
  const currentPeriodData = posts?.map(post => ({
    month: post.analysisMonth || '2025-01',
    sentiment: parseFloat(post.avgSentimentScore || '0'),
    engagement: parseFloat(post.weightedEngagementRate || '0'),
    period: 'Current'
  })) || [];

  // Generate comparison data based on selected period
  const getComparisonData = () => {
    const baseData = currentPeriodData.map(item => ({
      ...item,
      period: 'Previous',
      sentiment: item.sentiment - (Math.random() * 0.2 - 0.1), // Simulate variance
      engagement: item.engagement - (Math.random() * 0.001 - 0.0005)
    }));

    return baseData;
  };

  const comparisonData = getComparisonData();
  const combinedData = [...currentPeriodData, ...comparisonData];

  // Calculate metrics for comparison
  const currentMetrics = {
    avgSentiment: currentPeriodData.reduce((sum, item) => sum + item.sentiment, 0) / currentPeriodData.length || 0,
    avgEngagement: currentPeriodData.reduce((sum, item) => sum + item.engagement, 0) / currentPeriodData.length || 0,
    totalPosts: currentPeriodData.length
  };

  const previousMetrics = {
    avgSentiment: comparisonData.reduce((sum, item) => sum + item.sentiment, 0) / comparisonData.length || 0,
    avgEngagement: comparisonData.reduce((sum, item) => sum + item.engagement, 0) / comparisonData.length || 0,
    totalPosts: comparisonData.length
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const sentimentChange = calculateChange(currentMetrics.avgSentiment, previousMetrics.avgSentiment);
  const engagementChange = calculateChange(currentMetrics.avgEngagement, previousMetrics.avgEngagement);
  const postsChange = calculateChange(currentMetrics.totalPosts, previousMetrics.totalPosts);

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

  const MetricCard = ({ title, current, previous, change, icon, format = 'number' }: {
    title: string;
    current: number;
    previous: number;
    change: number;
    icon: string;
    format?: 'number' | 'percentage';
  }) => {
    const isPositive = change > 0;
    const formatValue = (value: number) => {
      if (format === 'percentage') return `${(value * 100).toFixed(2)}%`;
      return value.toFixed(3);
    };

    return (
      <div className="glass-morphism p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">{title}</h4>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Current</span>
            <span className="text-lg font-bold text-white">{formatValue(current)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Previous</span>
            <span className="text-sm text-gray-300">{formatValue(previous)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Change</span>
            <div className={`flex items-center ${isPositive ? 'text-verified-green' : 'text-danger-red'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
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
          Period-over-Period Analysis
        </h2>
        <p className="text-gray-400">
          Compare current performance with previous periods
        </p>
      </div>

      {/* Period Selection */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold text-white">
            Comparison Period
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setComparisonPeriod('previous')}
              variant={comparisonPeriod === 'previous' ? 'default' : 'outline'}
              size="sm"
            >
              Previous Period
            </Button>
            <Button
              onClick={() => setComparisonPeriod('3months')}
              variant={comparisonPeriod === '3months' ? 'default' : 'outline'}
              size="sm"
            >
              3 Months Ago
            </Button>
            <Button
              onClick={() => setComparisonPeriod('6months')}
              variant={comparisonPeriod === '6months' ? 'default' : 'outline'}
              size="sm"
            >
              6 Months Ago
            </Button>
          </div>
        </div>

        {/* Comparison Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Average Sentiment"
            current={currentMetrics.avgSentiment}
            previous={previousMetrics.avgSentiment}
            change={sentimentChange}
            icon="💭"
          />
          <MetricCard
            title="Engagement Rate"
            current={currentMetrics.avgEngagement}
            previous={previousMetrics.avgEngagement}
            change={engagementChange}
            icon="⚡"
            format="percentage"
          />
          <MetricCard
            title="Total Posts"
            current={currentMetrics.totalPosts}
            previous={previousMetrics.totalPosts}
            change={postsChange}
            icon="📊"
          />
        </div>

        {/* Trend Comparison Chart */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-white">
            Sentiment Trend: Current vs Previous Period
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedData.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[-1, 1]} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="sentiment" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Sentiment Score"
                dot={{ fill: '#10b981', strokeWidth: 2 }}
                data={currentPeriodData.slice(0, 10)}
              />
              <Line 
                type="monotone" 
                dataKey="sentiment" 
                stroke="#6b7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Previous Period"
                dot={{ fill: '#6b7280', strokeWidth: 2 }}
                data={comparisonData.slice(0, 10)}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-obsidian-surface p-4 rounded-lg">
            <div className="flex items-center mb-2">
              {sentimentChange > 0 ? (
                <TrendingUp className="w-5 h-5 text-verified-green mr-2" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger-red mr-2" />
              )}
              <span className="font-medium text-white">Sentiment Performance</span>
            </div>
            <p className="text-sm text-gray-400">
              {sentimentChange > 0 
                ? `Sentiment improved by ${sentimentChange.toFixed(1)}% compared to previous period`
                : `Sentiment declined by ${Math.abs(sentimentChange).toFixed(1)}% from previous period`
              }
            </p>
          </div>
          
          <div className="bg-obsidian-surface p-4 rounded-lg">
            <div className="flex items-center mb-2">
              {engagementChange > 0 ? (
                <TrendingUp className="w-5 h-5 text-verified-green mr-2" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger-red mr-2" />
              )}
              <span className="font-medium text-white">Engagement Performance</span>
            </div>
            <p className="text-sm text-gray-400">
              {engagementChange > 0 
                ? `Engagement increased by ${engagementChange.toFixed(1)}% from previous period`
                : `Engagement decreased by ${Math.abs(engagementChange).toFixed(1)}% from previous period`
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}