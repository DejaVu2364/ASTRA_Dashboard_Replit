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
    { id: 'strategy', label: 'Content Strategy', icon: Target },
    { id: 'discovery', label: 'Data Explorer', icon: Database },
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
        className="command-header p-6 rounded-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl text-white mb-3 tracking-wider" style={{ 
          fontFamily: 'Anton, sans-serif', 
          letterSpacing: '0.15em',
          textShadow: '0 2px 4px rgba(0, 163, 255, 0.3)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #00A3FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ASTRA INTELLIGENCE COMMAND CENTER
        </h1>
        <p className="text-gray-400 text-sm tracking-wide" style={{ fontFamily: 'Source Sans Pro, sans-serif', fontWeight: 400 }}>
          Comprehensive political intelligence platform with AI-powered analytics
        </p>
      </motion.div>

      {/* Navigation Tabs - MVP Blocks Style */}
      <motion.div
        className="mvp-card p-6"
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
                className={`mvp-button flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/40 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:scale-102'
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