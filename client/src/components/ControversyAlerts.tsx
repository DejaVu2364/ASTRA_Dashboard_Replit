import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { Post } from "@shared/schema";

export default function ControversyAlerts() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/controversial-posts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-verified-green';
    if (score < -0.1) return 'text-danger-red';
    return 'text-gray-400';
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0.5) return 'text-warning-amber';
    if (variance > 0.3) return 'text-yellow-400';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Scanning for controversial posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-danger-red mx-auto mb-4" />
          <p className="text-red-400 mb-2">Failed to load controversy data</p>
          <p className="text-gray-400 text-sm">Please check the server connection.</p>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-400">No controversial posts detected.</p>
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

  return (
    <motion.div
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white heading-secondary flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3 text-warning-amber" />
          Controversy Hotspot
        </h3>
        <p className="text-sm text-gray-500">Top 10 posts with the highest sentiment variance</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Post Caption</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Avg. Sentiment</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Sentiment Variance</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Engagement Rate</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {posts.map((post) => (
              <motion.tr
                key={post.postId}
                variants={rowVariants}
                className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors"
              >
                <td className="py-4 px-4 max-w-md">
                  <p className="truncate text-gray-300">{post.postCaption}</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-mono text-lg ${getSentimentColor(post.avgSentimentScore)}`}>
                    {post.avgSentimentScore >= 0 ? '+' : ''}{post.avgSentimentScore.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-mono text-lg ${getVarianceColor(post.sentimentVariance)}`}>
                    {post.sentimentVariance.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="font-mono text-lg text-electric-blue">
                    {(post.weightedEngagementRate * 100).toFixed(2)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
}
