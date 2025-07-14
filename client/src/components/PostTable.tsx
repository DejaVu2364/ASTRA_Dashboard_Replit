import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockDashboardData } from "../data/mockData";

export default function PostTable() {
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
      className="glass-morphism p-6 rounded-xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-bold text-white">
          Post Intelligence Analysis
        </h3>
        <div className="flex items-center space-x-4">
          <select className="bg-obsidian-surface border border-obsidian-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-electric-blue">
            <option>All Topics</option>
            <option>Economy</option>
            <option>Environment</option>
            <option>Praise</option>
          </select>
          <Button 
            variant="outline"
            className="bg-electric-blue/20 border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30"
          >
            Export Data
          </Button>
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
            {mockDashboardData.map((post, index) => (
              <motion.tr
                key={post.post_id}
                variants={rowVariants}
                className="border-b border-obsidian-border/50 hover:bg-obsidian-surface/50 transition-all"
                whileHover={{ backgroundColor: "rgba(26, 26, 26, 0.5)" }}
              >
                <td className="py-4 px-4 font-mono text-electric-blue">
                  {post.post_id}
                </td>
                <td className="py-4 px-4 max-w-md">
                  <div className="truncate">{post.post_caption}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-white font-medium">
                    {(post.total_likes + post.num_shares + post.comment_count).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    ↑ {(post.weighted_engagement_rate * 100).toFixed(1)}% rate
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`font-medium ${getSentimentColor(post.avg_sentiment_score)}`}>
                    {post.avg_sentiment_score >= 0 ? '+' : ''}{post.avg_sentiment_score.toFixed(2)}
                  </span>
                  <div className="text-xs text-gray-400">
                    {post.avg_sentiment_score >= 0 ? 'Positive' : 'Negative'}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge 
                    variant="outline"
                    className={`${getTopicColor(post.main_topic)} border`}
                  >
                    {post.main_topic}
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
