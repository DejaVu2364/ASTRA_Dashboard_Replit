import { motion } from 'framer-motion';
import { usePosts } from '@/hooks/usePosts';
import { 
  BarChart3,
  Heart,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { Post } from '@shared/schema';

/**
 * ExecutiveOverview displays a high-level summary of key performance indicators
 * using a grid of reusable KpiCard components.
 */
export default function ExecutiveOverview() {
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { isLoading: analyticsLoading } = useAnalytics(); // Keep for loading state consistency

  if (postsLoading || analyticsLoading || !posts) {
    return (
      <div className="w-full space-y-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  const totalPosts = posts.length;
  const totalEngagement = posts.reduce((sum: number, post: Post) => sum + (post.totalLikes || 0) + (post.numShares || 0) + (post.commentCount || 0), 0);
  const avgSentiment = totalPosts > 0 ? posts.reduce((sum: number, post: Post) => sum + (parseFloat(post.avgSentimentScore || '0')), 0) / totalPosts : 0;
  const totalComments = posts.reduce((sum: number, post: Post) => sum + (post.commentCount || 0), 0);

  // Example data for KPIs, including change
  const kpiData = [
    {
      title: "Total Posts",
      value: totalPosts.toLocaleString(),
      change: "+12.5%",
      icon: BarChart3,
      description: "Content published this period"
    },
    {
      title: "Total Engagement",
      value: totalEngagement.toLocaleString(),
      change: "+8.2%",
      icon: Heart,
      description: "Likes, shares, and comments"
    },
    {
      title: "Avg. Sentiment",
      value: `${(avgSentiment).toFixed(2)}`,
      change: "+5.7%",
      icon: TrendingUp,
      description: "Audience sentiment score (-1 to 1)"
    },
    {
      title: "Total Comments",
      value: totalComments.toLocaleString(),
      change: "-3.1%",
      icon: MessageSquare,
      description: "Community engagement level"
    }
  ];

  return (
    <div className="w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-semibold text-white mb-2">
            Executive Overview
          </h1>
          <p className="text-gray-400">
            A high-level summary of campaign performance.
          </p>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <KPICard
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                icon={kpi.icon}
                description={kpi.description}
              />
            </motion.div>
          ))}
        </div>

        {/* NOTE: Other charts and insights from the original component have been removed
            as per the plan to focus on a KPI card grid. They can be added back in
            other components like EngagementAnalytics.tsx */}
    </div>
  );
}