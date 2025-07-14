import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";
import { sentimentData } from "../data/mockData";

export default function SentimentChart() {
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

  return (
    <motion.div 
      className="glass-morphism p-6 rounded-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
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
    </motion.div>
  );
}
