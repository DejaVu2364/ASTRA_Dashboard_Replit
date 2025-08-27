import { motion } from "framer-motion";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePosts } from "@/hooks/usePosts";
import { useAiInsights } from "@/hooks/useAiInsights";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIInsight } from "@shared/schema";

export default function AIInsightsHub() {
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: aiInsights, isLoading: insightsLoading, refetch: refetchInsights } = useAiInsights();

  // Generate AI insights from posts data (fallback)
  const generateInsights = (): AIInsight[] => {
    if (!posts || posts.length === 0) return [];

    const insights: AIInsight[] = [];
    const avgSentiment = posts.reduce((sum, p) => sum + parseFloat(p.avgSentimentScore || '0'), 0) / posts.length;
    insights.push({
      id: 'sentiment-performance',
      type: 'performance',
      title: 'Sentiment Performance Analysis',
      description: `Overall sentiment is trending ${avgSentiment > 0 ? 'positive' : 'negative'}.`,
      confidence: 85,
      priority: 'medium',
      actionable: true,
      recommendation: 'Focus on positive messaging to maintain upward trend.',
      impact: 'high',
      dataPoints: [],
      generatedAt: new Date(),
    });
    return insights;
  };

  const insights = aiInsights || generateInsights();

  // Group insights by type for the accordion
  const groupedInsights = insights.reduce((acc, insight) => {
    const type = insight.type || 'general';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(insight);
    return acc;
  }, {} as Record<string, AIInsight[]>);

  if (postsLoading || insightsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="command-header">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          AI Insights Hub
        </h2>
        <p className="text-gray-400">
          Centralized AI-powered intelligence and strategic recommendations
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => refetchInsights()}
        disabled={insightsLoading}
        className="text-electric-blue border-electric-blue/30"
      >
        {insightsLoading ? 'Generating...' : 'Refresh AI Insights'}
      </Button>

      <Accordion type="multiple" defaultValue={Object.keys(groupedInsights)} className="w-full space-y-4">
        {Object.entries(groupedInsights).map(([type, insightGroup]) => (
          <AccordionItem key={type} value={type} className="border-none">
            <AccordionTrigger className="text-lg font-medium capitalize bg-gray-900/50 border border-gray-800 px-4 py-3 rounded-lg hover:bg-gray-800/60">
              {type} Insights ({insightGroup.length})
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-4">
              {insightGroup.map((insight) => (
                <Alert key={insight.id} variant={insight.priority === 'high' ? 'destructive' : 'default'}>
                  <WandSparkles className="h-4 w-4" />
                  <AlertTitle className="font-semibold">{insight.title}</AlertTitle>
                  <AlertDescription>
                    {insight.description}
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-semibold">Recommendation:</span> {insight.recommendation}
                    </p>
                  </AlertDescription>
                </Alert>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}