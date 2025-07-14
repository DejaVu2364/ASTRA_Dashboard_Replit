import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import KPICard from "./KPICard";
import TopicChart from "./TopicChart";
import SentimentChart from "./SentimentChart";
import PostTable from "./PostTable";
import type { Analytics, Post } from "@shared/schema";
// Removed mock data import - using real API data now

export default function CommandCenter() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Process analytics data
  const processedAnalytics = analytics?.reduce((acc, metric) => {
    acc[metric.metricType] = parseFloat(metric.value);
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate real-time metrics from posts
  const totalPosts = posts?.length || 0;
  const totalEngagement = posts?.reduce((sum, post) => 
    sum + post.totalLikes + post.numShares + post.commentCount, 0) || 0;
  const averageSentiment = posts?.reduce((sum, post) => 
    sum + parseFloat(post.avgSentimentScore), 0) / totalPosts || 0;
  const averageEngagement = posts?.reduce((sum, post) => 
    sum + parseFloat(post.weightedEngagementRate), 0) / totalPosts || 0;

  // Create KPI data from real analytics
  const kpiData = [
    {
      title: "Total Posts",
      value: totalPosts.toLocaleString(),
      change: null,
      icon: "📊",
      color: "electric-blue"
    },
    {
      title: "Sentiment Score",
      value: (averageSentiment * 100).toFixed(1),
      change: null,
      icon: "💬",
      color: averageSentiment >= 0 ? "verified-green" : "danger-red"
    },
    {
      title: "Total Engagements",
      value: totalEngagement.toLocaleString(),
      change: null,
      icon: "⚡",
      color: "purple-500"
    },
    {
      title: "Engagement Rate",
      value: (averageEngagement * 100).toFixed(2) + "%",
      change: null,
      icon: "🎯",
      color: "warning-amber"
    }
  ];

  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Header */}
      <div className="command-header p-6 rounded-xl">
        <div>
          <h2 className="text-3xl font-heading font-bold text-white">
            Political Intelligence Dashboard
          </h2>
          <p className="text-gray-400 mt-1">
            Real-time analytics from authentic social media data
          </p>
        </div>
      </div>
      


      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopicChart />
        <SentimentChart />
      </div>
      
      {/* Intelligence Table */}
      <PostTable />
    </div>
  );
}
