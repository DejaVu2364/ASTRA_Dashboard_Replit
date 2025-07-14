import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Post, Analytics } from "@shared/schema";

export default function TopicChart() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: analytics } = useQuery<Analytics[]>({
    queryKey: ['/api/analytics'],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate topic distribution from real data
  const topicDistribution = posts?.reduce((acc, post) => {
    const topic = post.mainTopic || 'Unknown';
    const existing = acc.find(item => item.name === topic);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ 
        name: topic, 
        value: 1,
        color: topic === 'Praise' ? '#10b981' : 
               topic === 'Economy' ? '#fbbf24' : 
               topic === 'Environment' ? '#8b5cf6' : 
               topic === 'Criticism' ? '#ef4444' : 
               topic === 'Healthcare' ? '#06b6d4' : 
               topic === 'Infrastructure' ? '#f59e0b' : 
               '#6b7280'
      });
    }
    return acc;
  }, [] as Array<{name: string, value: number, color: string}>) || [];
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-morphism p-3 rounded-lg border border-obsidian-border">
          <p className="text-white font-medium">{label}</p>
          <p className="text-electric-blue">
            Mentions: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <motion.div 
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          Topic Distribution
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-electric-blue">Loading real data...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="glass-morphism p-6 rounded-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-xl font-heading font-bold text-white mb-4">
        Topic Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topicDistribution}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              grid={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="url(#gradient)"
              radius={[4, 4, 0, 0]}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200, 100%, 50%)" />
                <stop offset="100%" stopColor="hsl(200, 100%, 30%)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
