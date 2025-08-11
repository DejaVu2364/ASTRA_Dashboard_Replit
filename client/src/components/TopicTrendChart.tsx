import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface TrendDataPoint {
  month: string;
  avgSentiment: number;
  totalEngagement: number;
}

interface TopicTrend {
  topic: string;
  data: TrendDataPoint[];
}

const COLORS = ["#00A3FF", "#FF5733", "#33FF57", "#FF33A1", "#A133FF", "#33FFF0"];

export default function TopicTrendChart() {
  const [metric, setMetric] = useState<'avgSentiment' | 'totalEngagement'>('totalEngagement');

  const { data: trends, isLoading, error } = useQuery<TopicTrend[]>({
    queryKey: ['/api/topic-trends'],
    staleTime: 5 * 60 * 1000,
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-4 rounded-xl">
          <p className="text-gray-300 font-semibold mb-2">{label}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} style={{ color: pld.color }}>
              {pld.name}: {metric === 'avgSentiment' ? pld.value.toFixed(2) : pld.value.toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing topic trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-danger-red mx-auto mb-4" />
          <p className="text-red-400 mb-2">Failed to load trend data</p>
          <p className="text-gray-400 text-sm">Please check the server connection.</p>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <motion.div
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white heading-secondary">
            Topic & Sentiment Trends
          </h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No trend data available to display.</p>
        </div>
      </motion.div>
    );
  }

  const chartData = useMemo(() => {
    const allMonths = [...new Set(trends.flatMap(t => t.data.map(d => d.month)))].sort();

    return allMonths.map(month => {
      const dataPoint: { [key: string]: any } = { month };
      trends.forEach(trend => {
        const trendDataForMonth = trend.data.find(d => d.month === month);
        dataPoint[trend.topic] = trendDataForMonth ? trendDataForMonth[metric] : null;
      });
      return dataPoint;
    });
  }, [trends, metric]);

  return (
    <motion.div
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white heading-secondary">
          Topic & Sentiment Trends
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setMetric('totalEngagement')}
            className={metric === 'totalEngagement' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
          >
            Engagement
          </Button>
          <Button
            size="sm"
            onClick={() => setMetric('avgSentiment')}
            className={metric === 'avgSentiment' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
          >
            Sentiment
          </Button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#a0aec0', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              type="category"
            />
            <YAxis
              tick={{ fill: '#a0aec0', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => metric === 'avgSentiment' ? value.toFixed(1) : (value / 1000) + 'k'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            {trends.map((trend, index) => (
              <Line
                key={trend.topic}
                type="monotone"
                name={trend.topic}
                dataKey={trend.topic}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
