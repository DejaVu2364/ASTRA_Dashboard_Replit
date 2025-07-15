import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Calendar, TrendingUp, TrendingDown, BarChart3, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "@shared/schema";
import { useState } from "react";

export default function MultiMonthSentimentTrend() {
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '12months'>('6months');
  
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  // Generate multi-month sentiment data
  const multiMonthData = posts?.reduce((acc, post) => {
    const month = post.analysisMonth || '2025-01';
    const topic = post.mainTopic || 'General';
    const sentiment = parseFloat(post.avgSentimentScore || '0');
    
    if (!acc[month]) {
      acc[month] = { month, topics: {}, overall: [] };
    }
    
    if (!acc[month].topics[topic]) {
      acc[month].topics[topic] = [];
    }
    
    acc[month].topics[topic].push(sentiment);
    acc[month].overall.push(sentiment);
    
    return acc;
  }, {} as Record<string, any>) || {};

  // Calculate monthly averages
  const monthlyTrends = Object.entries(multiMonthData).map(([month, data]) => {
    const overallAvg = data.overall.reduce((sum: number, val: number) => sum + val, 0) / data.overall.length;
    
    const topicData = Object.entries(data.topics).reduce((acc: any, [topic, sentiments]) => {
      acc[topic] = (sentiments as number[]).reduce((sum, val) => sum + val, 0) / (sentiments as number[]).length;
      return acc;
    }, {});
    
    return {
      month,
      overall: overallAvg,
      ...topicData,
      volatility: calculateVolatility(data.overall),
      postCount: data.overall.length
    };
  }).sort((a, b) => a.month.localeCompare(b.month));

  // Get unique topics
  const topics = ['All Topics', ...new Set(posts?.map(p => p.mainTopic).filter(t => t) || [])];

  function calculateVolatility(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Calculate trend direction
  const getTrendDirection = (data: any[]) => {
    if (data.length < 2) return 'neutral';
    const first = data[0]?.overall || 0;
    const last = data[data.length - 1]?.overall || 0;
    const change = ((last - first) / Math.abs(first)) * 100;
    
    if (change > 5) return 'rising';
    if (change < -5) return 'declining';
    return 'stable';
  };

  const trendDirection = getTrendDirection(monthlyTrends);
  const latestMonth = monthlyTrends[monthlyTrends.length - 1];
  const previousMonth = monthlyTrends[monthlyTrends.length - 2];
  const monthlyChange = latestMonth && previousMonth 
    ? ((latestMonth.overall - previousMonth.overall) / Math.abs(previousMonth.overall)) * 100
    : 0;

  // Filter data based on selected topic
  const filteredTrendData = monthlyTrends.map(item => ({
    ...item,
    value: selectedTopic === 'All Topics' ? item.overall : item[selectedTopic] || 0
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-morphism p-4 rounded-lg border border-obsidian-border">
          <p className="text-white font-medium mb-2">{label}</p>
          <p className="text-verified-green text-sm">
            Sentiment: {payload[0].value.toFixed(3)}
          </p>
          <p className="text-electric-blue text-sm">
            Posts: {data.postCount}
          </p>
          <p className="text-warning-amber text-sm">
            Volatility: {data.volatility.toFixed(3)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising': return <TrendingUp className="w-5 h-5 text-verified-green" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-danger-red" />;
      default: return <BarChart3 className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'rising': return 'text-verified-green';
      case 'declining': return 'text-danger-red';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="command-header p-6 rounded-xl">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          Multi-Month Sentiment Trends
        </h2>
        <p className="text-gray-400">
          Long-term sentiment analysis across topics and time periods
        </p>
      </div>

      {/* Controls */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-electric-blue" />
              <span className="text-white font-medium">Topic Filter:</span>
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-obsidian-surface text-white border border-obsidian-border rounded-lg px-3 py-2"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-electric-blue" />
              <span className="text-white font-medium">Time Range:</span>
            </div>
            <div className="flex space-x-2">
              {(['3months', '6months', '12months'] as const).map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                >
                  {range === '3months' ? '3M' : range === '6months' ? '6M' : '12M'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Overall Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getTrendIcon(trendDirection)}
                <span className={`text-lg font-bold ${getTrendColor(trendDirection)}`}>
                  {trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Monthly Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {monthlyChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-verified-green" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-danger-red" />
                )}
                <span className={`text-lg font-bold ${monthlyChange > 0 ? 'text-verified-green' : 'text-danger-red'}`}>
                  {monthlyChange > 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Current Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">
                {latestMonth?.overall.toFixed(3) || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">
                {latestMonth?.month || 'N/A'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Volatility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-warning-amber">
                {latestMonth?.volatility.toFixed(3) || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">
                {latestMonth?.volatility > 0.5 ? 'High' : latestMonth?.volatility > 0.3 ? 'Medium' : 'Low'}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Trend Chart */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          Sentiment Trend: {selectedTopic}
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={filteredTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              domain={[-1, 1]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              fill="url(#sentimentGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Topic Comparison */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          Topic Sentiment Comparison
        </h3>
        
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[-1, 1]} />
            <Tooltip content={<CustomTooltip />} />
            {topics.slice(1, 6).map((topic, index) => (
              <Line
                key={topic}
                type="monotone"
                dataKey={topic}
                stroke={`hsl(${(index * 60) % 360}, 70%, 60%)`}
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
                name={topic}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Insights & Recommendations */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          Strategic Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Key Observations</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-verified-green rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">
                    {trendDirection === 'rising' ? 'Positive momentum building' : 
                     trendDirection === 'declining' ? 'Sentiment decline detected' : 
                     'Sentiment remains stable'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {trendDirection === 'rising' ? 'Continue current content strategy' : 
                     trendDirection === 'declining' ? 'Review content approach urgently' : 
                     'Monitor for changes in engagement'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-electric-blue rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-medium">
                    Volatility is {latestMonth?.volatility > 0.5 ? 'high' : 'manageable'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {latestMonth?.volatility > 0.5 ? 
                      'Consider more consistent messaging' : 
                      'Sentiment patterns are predictable'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Recommendations</h4>
            <div className="space-y-3">
              <div className="bg-obsidian-surface p-3 rounded-lg">
                <p className="text-white font-medium text-sm">Content Strategy</p>
                <p className="text-gray-400 text-xs">
                  {selectedTopic === 'All Topics' ? 
                    'Focus on topics with positive sentiment trends' :
                    `Optimize ${selectedTopic} content for better sentiment`}
                </p>
              </div>
              
              <div className="bg-obsidian-surface p-3 rounded-lg">
                <p className="text-white font-medium text-sm">Timing</p>
                <p className="text-gray-400 text-xs">
                  {trendDirection === 'rising' ? 
                    'Increase posting frequency during positive trends' :
                    'Time sensitive content carefully during recovery'}
                </p>
              </div>
              
              <div className="bg-obsidian-surface p-3 rounded-lg">
                <p className="text-white font-medium text-sm">Monitoring</p>
                <p className="text-gray-400 text-xs">
                  Track daily sentiment changes during volatile periods
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}