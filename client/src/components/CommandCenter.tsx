import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, TrendingUp, BarChart3, Search, Users, Target, Calendar, BookOpen, Navigation, Activity, Brain, Database, Clock } from "lucide-react";
import KPICard from "./KPICard";
import TopicChart from "./TopicChart";
import SentimentChart from "./SentimentChart";
import PostTable from "./PostTable";
import IntelligenceSearch from "./IntelligenceSearch";
import ExecutiveCockpit from "./ExecutiveCockpit";
import PerformanceTrends from "./PerformanceTrends";
import DataExplorer from "./DataExplorer";
import ContentStrategy from "./ContentStrategy";
import PeriodComparison from "./PeriodComparison";
import AIBriefingLibrary from "./AIBriefingLibrary";
import NarrativeNavigator from "./NarrativeNavigator";
import EngagementAnalytics from "./EngagementAnalytics";
import AIInsightsHub from "./AIInsightsHub";
import DataDiscoveryZone from "./DataDiscoveryZone";
import MultiMonthSentimentTrend from "./MultiMonthSentimentTrend";
import type { Analytics, Post } from "@shared/schema";

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState('executive');
  
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
    sum + parseFloat(post.avgSentimentScore || '0'), 0) / totalPosts || 0;
  const averageEngagement = posts?.reduce((sum, post) => 
    sum + parseFloat(post.weightedEngagementRate || '0'), 0) / totalPosts || 0;

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

  const tabs = [
    { id: 'executive', label: 'Executive Overview', icon: Award },
    { id: 'insights', label: 'AI Insights Hub', icon: Brain },
    { id: 'narrative', label: 'Narrative Navigator', icon: Navigation },
    { id: 'engagement', label: 'Engagement Analytics', icon: Activity },
    { id: 'strategy', label: 'Content Strategy & Analysis', icon: Target },
    { id: 'discovery', label: 'Data Discovery & Explorer', icon: Database },
    { id: 'trends', label: 'Performance & Sentiment Trends', icon: TrendingUp },
    { id: 'briefing', label: 'AI Briefing Library', icon: BookOpen },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'executive':
        return <ExecutiveCockpit />;
      case 'insights':
        return <AIInsightsHub />;
      case 'narrative':
        return <NarrativeNavigator />;
      case 'engagement':
        return <EngagementAnalytics />;
      case 'strategy':
        return (
          <div className="space-y-8">
            <ContentStrategy />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopicChart />
              <SentimentChart />
            </div>
            <PostTable />
          </div>
        );
      case 'discovery':
        return (
          <div className="space-y-8">
            <DataDiscoveryZone />
            <DataExplorer />
            <IntelligenceSearch />
          </div>
        );
      case 'trends':
        return (
          <div className="space-y-8">
            <PerformanceTrends />
            <MultiMonthSentimentTrend />
            <PeriodComparison />
          </div>
        );
      case 'briefing':
        return <AIBriefingLibrary />;
      default:
        return <ExecutiveCockpit />;
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Header */}
      <motion.div
        className="command-header p-6 rounded-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          Astra Intelligence Command Center
        </h2>
        <p className="text-gray-400">
          Comprehensive political intelligence platform with AI-powered analytics
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        className="glass-morphism p-2 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-electric-blue text-obsidian-darker'
                    : 'text-gray-400 hover:text-white hover:bg-obsidian-surface'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Dynamic Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderActiveTab()}
      </motion.div>
    </div>
  );
}