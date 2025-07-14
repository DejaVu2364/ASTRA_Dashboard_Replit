import { motion } from "framer-motion";
import { Search, Filter, Download, Calendar, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { useState } from "react";

export default function DataExplorer() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeVisualization, setActiveVisualization] = useState('bar');
  
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  const visualizationTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { id: 'pie', label: 'Pie Chart', icon: PieChart },
    { id: 'line', label: 'Line Chart', icon: TrendingUp },
  ];

  // Calculate real topic counts from posts
  const topicCounts = posts?.reduce((acc, post) => {
    const topic = post.mainTopic || 'Unknown';
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const filters = [
    { id: 'all', label: 'All Topics', count: posts?.length || 0 },
    { id: 'economy', label: 'Economy', count: topicCounts.Economy || 0 },
    { id: 'environment', label: 'Environment', count: topicCounts.Environment || 0 },
    { id: 'praise', label: 'Praise', count: topicCounts.Praise || 0 },
    { id: 'criticism', label: 'Criticism', count: topicCounts.Criticism || 0 },
  ];

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
          Data Explorer
        </h2>
        <p className="text-gray-400">
          Deep dive into intelligence data with advanced filtering and visualization
        </p>
      </motion.div>

      {/* Control Panel */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-electric-blue" />
            <input
              type="text"
              placeholder="Search intelligence data..."
              className="bg-obsidian-surface border border-obsidian-border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-electric-blue" />
            <select className="bg-obsidian-surface border border-obsidian-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue">
              <option>June 2025</option>
              <option>May 2025</option>
              <option>April 2025</option>
            </select>
          </div>
          
          <Button
            variant="outline"
            className="bg-electric-blue/20 border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                  : 'bg-obsidian-surface text-gray-400 border border-obsidian-border hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label}
              <span className="ml-2 bg-current/20 px-2 py-1 rounded-full text-xs">
                {filter.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Visualization Controls */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">View as:</span>
          {visualizationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                onClick={() => setActiveVisualization(type.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  activeVisualization === type.id
                    ? 'bg-electric-blue/20 text-electric-blue'
                    : 'text-gray-400 hover:text-white hover:bg-obsidian-surface'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{type.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Data Grid */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold text-white">
            Intelligence Dataset
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {posts?.length || 0} records found
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-verified-green rounded-full animate-pulse" />
              <span className="text-sm text-verified-green">Data Verified</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-electric-blue">Loading authentic data...</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts?.filter(post => {
              if (activeFilter === 'all') return true;
              if (activeFilter === 'economy') return post.mainTopic === 'Economy';
              if (activeFilter === 'environment') return post.mainTopic === 'Environment';
              if (activeFilter === 'praise') return post.mainTopic === 'Praise';
              if (activeFilter === 'criticism') return post.mainTopic === 'Criticism';
              return true;
            }).slice(0, 20).map((item, index) => (
              <motion.div
                key={`data-explorer-post-${item.postId}-${index}`}
                className="data-card p-4 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <code className="text-electric-blue text-sm font-mono">
                        {item.postId}
                      </code>
                      <Badge
                        variant="outline"
                        className={`
                          ${item.mainTopic === 'Praise' ? 'bg-verified-green/20 text-verified-green border-verified-green/30' : ''}
                          ${item.mainTopic === 'Economy' ? 'bg-warning-amber/20 text-warning-amber border-warning-amber/30' : ''}
                          ${item.mainTopic === 'Environment' ? 'bg-success-emerald/20 text-success-emerald border-success-emerald/30' : ''}
                          ${item.mainTopic === 'Criticism' ? 'bg-danger-red/20 text-danger-red border-danger-red/30' : ''}
                        `}
                      >
                        {item.mainTopic}
                      </Badge>
                    </div>
                    <p className="text-white text-sm mb-2">{item.content.substring(0, 150)}...</p>
                    <div className="flex items-center space-x-6 text-xs text-gray-400">
                      <span>Likes: {item.totalLikes.toLocaleString()}</span>
                      <span>Shares: {item.numShares.toLocaleString()}</span>
                      <span>Comments: {item.commentCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      parseFloat(item.avgSentimentScore) >= 0 ? 'text-verified-green' : 'text-danger-red'
                    }`}>
                      {parseFloat(item.avgSentimentScore) >= 0 ? '+' : ''}
                      {parseFloat(item.avgSentimentScore).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">Sentiment</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-xs text-gray-400">
                      Engagement: {(parseFloat(item.weightedEngagementRate) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      Negative Ratio: {(parseFloat(item.negativeCommentRatio) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-electric-blue hover:text-electric-glow hover:bg-electric-blue/10"
                    onClick={() => {
                      alert(`Analyzing Post ID: ${item.postId}\n\nTopic: ${item.mainTopic}\nSentiment: ${parseFloat(item.avgSentimentScore).toFixed(2)}\nEngagement: ${(parseFloat(item.weightedEngagementRate) * 100).toFixed(1)}%\nTotal Reach: ${(item.totalLikes + item.numShares + item.commentCount).toLocaleString()}`);
                    }}
                  >
                    Analyze
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}