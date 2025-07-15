import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  MessageSquare, 
  Share2, 
  Heart, 
  AlertTriangle,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  description: string;
}

const MetricCard = ({ title, value, change, changeType, icon, description }: MetricCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return 'text-green-400';
      case 'decrease': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase': return <ArrowUpRight className="w-4 h-4" />;
      case 'decrease': return <ArrowDownRight className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mvp-card p-6 group cursor-pointer"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-colors">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 heading-secondary">{title}</h3>
            <p className="text-2xl font-bold text-white data-text">{value}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
          {getChangeIcon()}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-professional">{description}</p>
    </motion.div>
  );
};

interface QuickInsightProps {
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

const QuickInsight = ({ title, content, priority, category }: QuickInsightProps) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/5';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low': return 'border-green-500/30 bg-green-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`mvp-card p-4 border-l-4 ${getPriorityColor()}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-white heading-secondary">{title}</h4>
        <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400 text-professional">
          {category}
        </span>
      </div>
      <p className="text-sm text-gray-300 text-professional">{content}</p>
    </motion.div>
  );
};

export default function ExecutiveOverview() {
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics'],
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  if (postsLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-white text-professional">Loading Executive Overview...</span>
        </div>
      </div>
    );
  }

  const totalPosts = posts?.length || 0;
  const totalEngagement = posts?.reduce((sum: number, post: any) => sum + (post.totalLikes || 0) + (post.numShares || 0), 0) || 0;
  const avgSentiment = posts?.reduce((sum: number, post: any) => sum + (post.avgSentiment || 0), 0) / totalPosts || 0;
  const totalComments = posts?.reduce((sum: number, post: any) => sum + (post.commentCount || 0), 0) || 0;

  const metrics = [
    {
      title: "Total Posts",
      value: totalPosts.toLocaleString(),
      change: 12.5,
      changeType: 'increase' as const,
      icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
      description: "Content published this period"
    },
    {
      title: "Total Engagement",
      value: totalEngagement.toLocaleString(),
      change: 8.2,
      changeType: 'increase' as const,
      icon: <Heart className="w-5 h-5 text-red-400" />,
      description: "Likes and shares combined"
    },
    {
      title: "Avg Sentiment",
      value: `${(avgSentiment * 100).toFixed(1)}%`,
      change: 5.7,
      changeType: 'increase' as const,
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      description: "Overall audience sentiment"
    },
    {
      title: "Total Comments",
      value: totalComments.toLocaleString(),
      change: 15.3,
      changeType: 'increase' as const,
      icon: <MessageSquare className="w-5 h-5 text-yellow-400" />,
      description: "Community engagement level"
    }
  ];

  const insights = [
    {
      title: "Peak Engagement Time",
      content: "Content performs 40% better when posted between 7-9 PM EST",
      priority: 'high' as const,
      category: "Timing"
    },
    {
      title: "Content Strategy",
      content: "Video posts generate 3x more shares than text-only content",
      priority: 'high' as const,
      category: "Content"
    },
    {
      title: "Audience Growth",
      content: "Follower growth rate increased by 25% this month",
      priority: 'medium' as const,
      category: "Growth"
    },
    {
      title: "Sentiment Analysis",
      content: "Positive sentiment trending upward across all content types",
      priority: 'low' as const,
      category: "Sentiment"
    }
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2 heading-secondary">
                Executive Overview
              </h1>
              <p className="text-gray-500 text-professional">
                Strategic insights and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-gray-600"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Insights */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mvp-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white heading-secondary">
                  Strategic Insights
                </h2>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">AI-Generated</span>
                </div>
              </div>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <QuickInsight key={index} {...insight} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Performance Summary */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mvp-card p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4 heading-secondary">
                Performance Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Engagement Rate</span>
                  <span className="text-sm font-medium text-white">8.4%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Reach Growth</span>
                  <span className="text-sm font-medium text-green-400">+12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Content Velocity</span>
                  <span className="text-sm font-medium text-white">4.2 posts/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Sentiment Score</span>
                  <span className="text-sm font-medium text-blue-400">Positive</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mvp-card p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4 heading-secondary">
                Action Items
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-white font-medium">Optimize posting schedule</p>
                    <p className="text-xs text-gray-400">High priority - Due tomorrow</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-white font-medium">Review content strategy</p>
                    <p className="text-xs text-gray-400">Medium priority - This week</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-white font-medium">Expand video content</p>
                    <p className="text-xs text-gray-400">Low priority - Next month</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}