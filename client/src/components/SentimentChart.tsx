import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";

export default function SentimentChart() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate sentiment data by month from real data
  const sentimentData = posts?.reduce((acc, post) => {
    const month = post.analysisMonth || '2025-01';
    const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' });
    
    const existing = acc.find(item => item.month === monthName);
    const sentimentScore = parseFloat(post.avgSentimentScore || '0');
    
    if (existing) {
      existing.scores.push(sentimentScore);
    } else {
      acc.push({
        month: monthName,
        scores: [sentimentScore]
      });
    }
    return acc;
  }, [] as Array<{month: string, scores: number[]}>)?.map(item => ({
    month: item.month,
    score: Math.abs(item.scores.reduce((sum, score) => sum + score, 0) / item.scores.length)
  })).filter(item => !isNaN(item.score) && item.score > 0) || [];
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-morphism p-3 rounded-lg border border-obsidian-border">
          <p className="text-white font-medium">{label}</p>
          <p className="text-electric-blue">
            Score: {payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="glass-morphism p-6 rounded-xl">
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          Sentiment Analysis
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-electric-blue">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-morphism p-6 rounded-xl">
      <h3 className="text-xl font-heading font-bold text-white mb-4">
        Sentiment Analysis
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sentimentData}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, 1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(200, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(200, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(200, 100%, 50%)"
              strokeWidth={2}
              fill="url(#sentimentGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
