import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import KPICard from "./KPICard";
import PulseCard from "./PulseCard";
import TopicChart from "./TopicChart";
import SentimentChart from "./SentimentChart";
import PostTable from "./PostTable";
import type { Analytics, Post } from "@shared/schema";
import { kpiData } from "../data/mockData";

export default function CommandCenter() {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Header */}
      <motion.div 
        className="command-header p-6 rounded-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-heading font-bold text-white">
              Command Center
            </h2>
            <p className="text-gray-400 mt-1">
              Real-time political intelligence dashboard - All systems operational
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div 
              className="px-4 py-2 rounded-lg bg-electric-blue/20 border border-electric-blue/30 text-electric-blue"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm font-medium">Live Stream</span>
              <motion.span 
                className="ml-2 w-2 h-2 bg-electric-blue rounded-full inline-block"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Last Updated</div>
              <div className="text-sm font-medium text-electric-blue">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Real-Time Pulse Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <PulseCard
          title="Live Data Stream"
          value="2.4M"
          status="active"
          icon="activity"
          subtitle="Posts analyzed"
          delay={0}
        />
        <PulseCard
          title="Narrative Alerts"
          value="12"
          status="warning"
          icon="alert"
          subtitle="Requiring attention"
          delay={0.1}
        />
        <PulseCard
          title="Active Monitors"
          value="847"
          status="active"
          icon="users"
          subtitle="Tracking sources"
          delay={0.2}
        />
        <PulseCard
          title="Trend Velocity"
          value="+34%"
          status="active"
          icon="trending"
          subtitle="Engagement spike"
          delay={0.3}
        />
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            color={kpi.color}
            delay={index * 0.1}
          />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopicChart />
        <SentimentChart />
      </div>
      
      {/* Intelligence Table */}
      <PostTable />
    </div>
  );
}
