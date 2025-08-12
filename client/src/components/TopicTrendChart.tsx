import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendDataPoint {
  month: string;
  avgSentiment: number;
  totalEngagement: number;
}

interface TopicTrend {
  topic: string;
  data: TrendDataPoint[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function TopicTrendChart() {
  const [metric, setMetric] = useState<'avgSentiment' | 'totalEngagement'>('totalEngagement');

  const { data: trends, isLoading, error } = useQuery<TopicTrend[]>({
    queryKey: ['/api/topic-trends'],
    staleTime: 5 * 60 * 1000,
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/80 backdrop-blur-sm border border-border p-4 rounded-xl">
          <p className="text-foreground font-semibold mb-2">{label}</p>
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
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-2">Failed to load trend data</p>
          <p className="text-muted-foreground text-sm">Please check the server connection.</p>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <motion.div
        className="bg-card border border-border rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground heading-secondary">
            Topic & Sentiment Trends
          </h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No trend data available to display.</p>
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
      className="bg-card border border-border rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground heading-secondary">
          Topic & Sentiment Trends
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setMetric('totalEngagement')}
            variant={metric === 'totalEngagement' ? 'default' : 'outline'}
          >
            Engagement
          </Button>
          <Button
            size="sm"
            onClick={() => setMetric('avgSentiment')}
            variant={metric === 'avgSentiment' ? 'default' : 'outline'}
          >
            Sentiment
          </Button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--border))"
              className="text-xs"
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              stroke="hsl(var(--border))"
              className="text-xs"
              tickFormatter={(value) => metric === 'avgSentiment' ? value.toFixed(1) : (value / 1000) + 'k'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 'var(--font-size-sm)' }} />
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
