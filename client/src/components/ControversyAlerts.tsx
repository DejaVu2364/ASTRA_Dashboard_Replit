import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Post } from "@shared/schema";

export default function ControversyAlerts() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/controversial-posts'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-success-emerald';
    if (score < -0.1) return 'text-danger-red';
    return 'text-muted-foreground';
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0.5) return 'text-warning-amber';
    if (variance > 0.3) return 'text-yellow-400'; // No direct theme color, but warning is close
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-2">Failed to load controversy data</p>
          <p className="text-muted-foreground text-sm">Please check the server connection.</p>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <motion.div
        className="bg-card border border-border rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground heading-secondary flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-warning-amber" />
            Controversy Hotspot
          </h3>
        </div>
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No controversial posts detected.</p>
        </div>
      </motion.div>
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
      className="bg-card border border-border rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground heading-secondary flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3 text-warning-amber" />
          Controversy Hotspot
        </h3>
        <p className="text-sm text-muted-foreground">Top 10 posts with the highest sentiment variance</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 font-medium text-muted-foreground">Post Caption</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">Avg. Sentiment</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">Sentiment Variance</th>
              <th className="text-center py-4 px-4 font-medium text-muted-foreground">Engagement Rate</th>
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
                className="border-b border-border/50 hover:bg-muted/40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    // In a real app, you would trigger a click handler here
                    console.log('Row activated:', post.postId);
                  }
                }}
              >
                <td className="py-4 px-4 max-w-md">
                  <p className="truncate text-foreground">{post.postCaption}</p>
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
