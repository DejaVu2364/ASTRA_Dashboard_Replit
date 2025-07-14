import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { topicDistribution } from "../data/mockData";

export default function TopicChart() {
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
