import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, TrendingUp, BarChart3, Search, Users, Target, Calendar, BookOpen, Navigation, Activity, Brain, Database, Clock, MessageSquare } from "lucide-react";
import KPICard from "./KPICard";
import TopicChart from "./TopicChart";
import SentimentChart from "./SentimentChart";
import PostTable from "./PostTable";
import IntelligenceSearch from "./IntelligenceSearch";
import ExecutiveCockpit from "./ExecutiveCockpit";
import ExecutiveOverview from "./ExecutiveOverview";
import ChatbotInterface from "./ChatbotInterface";
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
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    staleTime: 10 * 60 * 1000, // 10 minutes - reduced API calls
  });

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 10 * 60 * 1000, // 10 minutes - reduced API calls
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
    { id: 'overview', label: 'Executive Overview', icon: Award },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'executive', label: 'Campaign Health', icon: Activity },
    { id: 'insights', label: 'AI Insights Hub', icon: Brain },
    { id: 'narrative', label: 'Narrative Navigator', icon: Navigation },
    { id: 'engagement', label: 'Engagement Analytics', icon: TrendingUp },
    { id: 'strategy', label: 'Content Strategy', icon: Target },
    { id: 'discovery', label: 'Data Explorer', icon: Database },
    { id: 'trends', label: 'Performance Trends', icon: BarChart3 },
    { id: 'briefing', label: 'AI Reports', icon: BookOpen },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <ExecutiveOverview />;
      case 'chat':
        return <ChatbotInterface />;
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
        return <ExecutiveOverview />;
    }
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-3xl font-semibold text-white mb-3 heading-secondary">
          Astra Intelligence
        </h1>
        <p className="text-gray-500 text-professional">
          Political intelligence platform with AI-powered analytics
        </p>
      </motion.div>

      {/* Navigation Tabs - MVP Blocks Style */}
      <motion.div
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap border ${
                  activeTab === tab.id
                    ? 'bg-white text-black border-white'
                    : 'text-gray-300 hover:text-white border-gray-800 hover:border-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium text-professional">{tab.label}</span>
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