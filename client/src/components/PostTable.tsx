import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";

export default function PostTable() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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

  // Show only first 10 posts for better performance
  const displayPosts = posts.slice(0, 10);

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
        <div className="text-sm text-gray-400">
          Showing {displayPosts.length} of {posts.length} posts
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
                  {post.postId}
                </td>
                <td className="py-4 px-4 max-w-md">
                  <div className="truncate">{post.content.substring(0, 100)}...</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-white font-medium">
                    {(post.totalLikes + post.numShares + post.commentCount).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    ↑ {post.weightedEngagementRate ? parseFloat(post.weightedEngagementRate).toFixed(1) : '0.0'}% rate
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`font-medium ${getSentimentColor(parseFloat(post.avgSentimentScore))}`}>
                    {parseFloat(post.avgSentimentScore) >= 0 ? '+' : ''}{parseFloat(post.avgSentimentScore).toFixed(2)}
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
    </motion.div>
  );
}
