import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import SentimentChart from "./SentimentChart";
import TopicChart from "./TopicChart";
import MultiMonthSentimentTrend from "./MultiMonthSentimentTrend";

/**
 * EngagementAnalytics serves as a visualization hub, organizing various
 * data charts into a clean, tabbed interface.
 */
export default function EngagementAnalytics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Engagement Analytics</CardTitle>
          <CardDescription>
            Organized views for sentiment, topics, and long-term trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sentiment" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="sentiment" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <SentimentChart />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="topics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Topic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopicChart />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="trends" className="mt-4">
               <Card>
                <CardHeader>
                  <CardTitle>Multi-Month Sentiment Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiMonthSentimentTrend />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}