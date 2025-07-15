import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Brain, Zap, Target, AlertCircle, TrendingUp, MessageSquare, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Post, GeminiReport } from "@shared/schema";
import { useState } from "react";

export default function AIInsightsHub() {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: geminiReports } = useQuery<GeminiReport[]>({
    queryKey: ['/api/gemini-reports'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch AI-powered insights
  const { data: aiInsights, isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['/api/ai-insights'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Generate AI insights from posts data (fallback)
  const generateInsights = () => {
    if (!posts || posts.length === 0) return [];

    const insights = [];

    // Sentiment Performance Insight
    const avgSentiment = posts.reduce((sum, p) => sum + parseFloat(p.avgSentimentScore || '0'), 0) / posts.length;
    const sentimentTrend = avgSentiment > 0 ? 'positive' : 'negative';
    insights.push({
      id: 'sentiment-performance',
      type: 'performance',
      title: 'Sentiment Performance Analysis',
      description: `Overall sentiment is ${sentimentTrend} with ${(avgSentiment * 100).toFixed(1)}% score`,
      confidence: Math.min(95, 60 + Math.abs(avgSentiment) * 40),
      priority: avgSentiment < -0.3 ? 'high' : avgSentiment > 0.3 ? 'low' : 'medium',
      actionable: true,
      recommendation: avgSentiment < 0 ? 'Focus on positive messaging and community building' : 'Maintain current positive sentiment strategy',
      impact: Math.abs(avgSentiment) > 0.3 ? 'high' : 'medium',
      icon: MessageSquare,
      color: avgSentiment > 0 ? 'verified-green' : 'danger-red'
    });

    // Engagement Opportunity Insight
    const avgEngagement = posts.reduce((sum, p) => sum + parseFloat(p.weightedEngagementRate || '0'), 0) / posts.length;
    const topEngagementPost = posts.sort((a, b) => parseFloat(b.weightedEngagementRate || '0') - parseFloat(a.weightedEngagementRate || '0'))[0];
    insights.push({
      id: 'engagement-opportunity',
      type: 'opportunity',
      title: 'Engagement Optimization',
      description: `Average engagement is ${(avgEngagement * 100).toFixed(2)}%, with top post achieving ${(parseFloat(topEngagementPost?.weightedEngagementRate || '0') * 100).toFixed(2)}%`,
      confidence: 88,
      priority: avgEngagement < 0.02 ? 'high' : 'medium',
      actionable: true,
      recommendation: `Replicate strategies from top-performing ${topEngagementPost?.contentType || 'content'} posts`,
      impact: 'high',
      icon: TrendingUp,
      color: 'electric-blue'
    });

    // Content Strategy Insight
    const contentTypes = posts.reduce((acc, p) => {
      const type = p.contentType || 'Standard';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const dominantType = Object.entries(contentTypes).sort(([,a], [,b]) => b - a)[0];
    insights.push({
      id: 'content-strategy',
      type: 'strategy',
      title: 'Content Mix Analysis',
      description: `${dominantType?.[0]} content dominates with ${dominantType?.[1]} posts (${((dominantType?.[1] / posts.length) * 100).toFixed(1)}%)`,
      confidence: 82,
      priority: 'medium',
      actionable: true,
      recommendation: 'Diversify content types to reduce dependency on single format',
      impact: 'medium',
      icon: Target,
      color: 'warning-amber'
    });

    // Topic Performance Insight
    const topicPerformance = posts.reduce((acc, p) => {
      const topic = p.mainTopic || 'General';
      if (!acc[topic]) acc[topic] = { posts: 0, totalEngagement: 0 };
      acc[topic].posts += 1;
      acc[topic].totalEngagement += parseFloat(p.weightedEngagementRate || '0');
      return acc;
    }, {} as Record<string, any>);
    
    const topTopic = Object.entries(topicPerformance)
      .map(([topic, data]) => ({ topic, avgEngagement: data.totalEngagement / data.posts }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)[0];
    
    insights.push({
      id: 'topic-performance',
      type: 'performance',
      title: 'Topic Performance Leader',
      description: `${topTopic?.topic} shows highest engagement at ${(topTopic?.avgEngagement * 100).toFixed(2)}%`,
      confidence: 91,
      priority: 'medium',
      actionable: true,
      recommendation: `Increase ${topTopic?.topic} content frequency by 30-40%`,
      impact: 'high',
      icon: Star,
      color: 'verified-green'
    });

    // Audience Engagement Insight
    const totalInteractions = posts.reduce((sum, p) => sum + p.totalLikes + p.numShares + p.commentCount, 0);
    insights.push({
      id: 'audience-engagement',
      type: 'audience',
      title: 'Audience Interaction Analysis',
      description: `${totalInteractions.toLocaleString()} total interactions across ${posts.length} posts`,
      confidence: 85,
      priority: 'low',
      actionable: false,
      recommendation: 'Monitor interaction patterns for optimal posting times',
      impact: 'medium',
      icon: Users,
      color: 'electric-blue'
    });

    return insights;
  };

  const insights = aiInsights || generateInsights();

  const getInsightIcon = (insight: any) => {
    const IconComponent = insight.icon || Brain;
    return <IconComponent className={`w-5 h-5 text-gray-400`} />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger-red';
      case 'medium': return 'warning-amber';
      case 'low': return 'verified-green';
      default: return 'gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return TrendingUp;
      case 'opportunity': return Zap;
      case 'strategy': return Target;
      case 'audience': return Users;
      default: return Brain;
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
          AI Insights Hub
        </h2>
        <p className="text-gray-400">
          Centralized AI-powered intelligence and strategic recommendations
        </p>
      </div>

      {/* AI Insights Overview */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold text-white">
            Intelligence Dashboard
          </h3>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-electric-blue">
              {insights.length} active insights
            </Badge>
            <Badge variant="outline" className="text-verified-green">
              {insights.filter(i => i.actionable).length} actionable
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchInsights()}
              disabled={insightsLoading}
              className="text-electric-blue border-electric-blue/30"
            >
              {insightsLoading ? 'Generating...' : 'Refresh AI'}
            </Button>
          </div>
        </div>

        {/* Insight Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="border-danger-red/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-danger-red">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {insights.filter(i => i.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-400">Require immediate attention</div>
            </CardContent>
          </Card>

          <Card className="border-warning-amber/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-warning-amber">Medium Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {insights.filter(i => i.priority === 'medium').length}
              </div>
              <div className="text-sm text-gray-400">Plan for next cycle</div>
            </CardContent>
          </Card>

          <Card className="border-verified-green/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-verified-green">Low Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {insights.filter(i => i.priority === 'low').length}
              </div>
              <div className="text-sm text-gray-400">Monitor and maintain</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:border-electric-blue/50 border-${getPriorityColor(insight.priority)}/20 ${
                  selectedInsight === insight.id ? 'border-electric-blue' : ''
                }`}
                onClick={() => setSelectedInsight(insight.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getInsightIcon(insight)}
                      <CardTitle className="text-lg text-white">{insight.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs text-${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-xs text-electric-blue">
                          Actionable
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">
                    {insight.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">AI Confidence</span>
                    <span className="text-sm font-medium text-white">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Impact Level</span>
                    <Badge variant="outline" className={`text-xs ${
                      insight.impact === 'high' ? 'text-danger-red' : 
                      insight.impact === 'medium' ? 'text-warning-amber' : 'text-verified-green'
                    }`}>
                      {insight.impact}
                    </Badge>
                  </div>
                  
                  <div className="pt-2 border-t border-obsidian-border">
                    <p className="text-sm text-gray-300 mb-2">Recommendation:</p>
                    <p className="text-xs text-gray-400">{insight.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Insight Analysis */}
      {selectedInsight && (
        <motion.div
          className="glass-morphism p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {(() => {
            const insight = insights.find(i => i.id === selectedInsight);
            if (!insight) return null;

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-bold text-white">
                    Deep Analysis: {insight.title}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setSelectedInsight(null)}>
                    Close
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-obsidian-surface p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-5 h-5 text-electric-blue" />
                      <h4 className="font-medium text-white">AI Assessment</h4>
                    </div>
                    <p className="text-sm text-gray-400">{insight.description}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Confidence</span>
                        <span className="text-xs text-white">{insight.confidence}%</span>
                      </div>
                      <Progress value={insight.confidence} className="h-1" />
                    </div>
                  </div>

                  <div className="bg-obsidian-surface p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-warning-amber" />
                      <h4 className="font-medium text-white">Strategic Impact</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Priority</span>
                        <Badge variant="outline" className={`text-xs text-${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Impact</span>
                        <Badge variant="outline" className={`text-xs ${
                          insight.impact === 'high' ? 'text-danger-red' : 
                          insight.impact === 'medium' ? 'text-warning-amber' : 'text-verified-green'
                        }`}>
                          {insight.impact}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Actionable</span>
                        <Badge variant="outline" className={`text-xs ${
                          insight.actionable ? 'text-verified-green' : 'text-gray-400'
                        }`}>
                          {insight.actionable ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-obsidian-surface p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="w-5 h-5 text-verified-green" />
                      <h4 className="font-medium text-white">Recommendation</h4>
                    </div>
                    <p className="text-sm text-gray-400">{insight.recommendation}</p>
                    {insight.actionable && (
                      <Button size="sm" className="mt-3 w-full">
                        Implement Strategy
                      </Button>
                    )}
                  </div>
                </div>

                {/* Additional Context */}
                <div className="bg-obsidian-surface p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-3">Additional Context</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Data Sources</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• {posts?.length || 0} posts analyzed</li>
                        <li>• Multi-dimensional sentiment analysis</li>
                        <li>• Engagement pattern recognition</li>
                        <li>• Content type performance metrics</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Next Steps</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Monitor implementation results</li>
                        <li>• Track key performance indicators</li>
                        <li>• Adjust strategy based on outcomes</li>
                        <li>• Schedule follow-up analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* AI Reports Integration */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-xl font-heading font-bold text-white mb-4">
          AI Generated Reports
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {geminiReports?.slice(0, 6).map((report, index) => (
            <Card key={report.id} className="cursor-pointer hover:border-electric-blue/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white">{report.title}</CardTitle>
                  <Badge variant="outline" className="text-xs text-electric-blue">
                    {report.reportType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-400 mb-3">
                  {report.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm" className="text-electric-blue">
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}