import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { Post } from "@shared/schema";

export default function PostTable() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const postsPerPage = 10;

  const getTopicColor = (topic: string) => {
    switch (topic) {
      case 'Praise':
        return 'bg-verified-green/20 text-verified-green border-verified-green/30';
      case 'Economy':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Environment':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSentimentColor = (score: number) => {
    return score >= 0 ? 'text-verified-green' : 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="glass-morphism p-6 rounded-xl flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading intelligence data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-morphism p-6 rounded-xl flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load data</p>
          <p className="text-gray-400 text-sm">Check your connection and try again</p>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="glass-morphism p-6 rounded-xl flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-400">No posts available</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  // Filter posts by topic
  const filteredPosts = posts?.filter(post => 
    selectedTopic === 'All' || post.mainTopic === selectedTopic
  ) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const displayPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  // Get unique topics for filter
  const topics = ['All', ...new Set(posts?.map(post => post.mainTopic).filter(Boolean) || [])];

  // Generate Facebook post URL
  const getFacebookUrl = (postId: string) => {
    return `https://www.facebook.com/DrPrabhaOnline/posts/${postId}`;
  };

  return (
    <motion.div 
      className="glass-morphism p-6 rounded-xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-bold text-white">
          Political Intelligence Analysis
        </h3>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedTopic} 
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-obsidian-surface border border-obsidian-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-electric-blue"
          >
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
          <div className="text-sm text-gray-400">
            Showing {displayPosts.length} of {filteredPosts.length} posts
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-obsidian-border">
              <th className="text-left py-4 px-4 font-medium text-gray-400">Post ID</th>
              <th className="text-left py-4 px-4 font-medium text-gray-400">Caption</th>
              <th className="text-left py-4 px-4 font-medium text-gray-400">Engagement</th>
              <th className="text-left py-4 px-4 font-medium text-gray-400">Sentiment</th>
              <th className="text-left py-4 px-4 font-medium text-gray-400">Topic</th>
              <th className="text-left py-4 px-4 font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {displayPosts.map((post, index) => (
              <motion.tr
                key={`post-${index}`}
                variants={rowVariants}
                className="border-b border-obsidian-border/50 hover:bg-obsidian-surface/50 transition-all"
                whileHover={{ backgroundColor: "rgba(26, 26, 26, 0.5)" }}
              >
                <td className="py-4 px-4 font-mono text-electric-blue">
                  <a 
                    href={getFacebookUrl(post.postId)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-400 transition-colors"
                  >
                    {post.postId}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
                <td className="py-4 px-4 max-w-md">
                  <div className="truncate">{post.content.substring(0, 100)}...</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-white font-medium">
                    {(post.totalLikes + post.numShares + post.commentCount).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    ↑ {post.weightedEngagementRate ? (parseFloat(post.weightedEngagementRate) * 100).toFixed(2) : '0.00'}% rate
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`font-medium ${getSentimentColor(parseFloat(post.avgSentimentScore || '0'))}`}>
                    {parseFloat(post.avgSentimentScore || '0') >= 0 ? '+' : ''}{parseFloat(post.avgSentimentScore || '0').toFixed(2)}
                  </span>
                  <div className="text-xs text-gray-400">
                    {parseFloat(post.avgSentimentScore) >= 0 ? 'Positive' : 'Negative'}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge 
                    variant="outline"
                    className={`${getTopicColor(post.mainTopic)} border`}
                  >
                    {post.mainTopic}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-electric-blue hover:text-electric-glow hover:bg-electric-blue/10"
                  >
                    Details
                  </Button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-obsidian-surface border-obsidian-border text-gray-300 hover:bg-obsidian-darker disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-obsidian-surface border-obsidian-border text-gray-300 hover:bg-obsidian-darker disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
