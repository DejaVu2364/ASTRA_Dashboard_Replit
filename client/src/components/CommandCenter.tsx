import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import TopicChart from "./TopicChart";
import SentimentChart from "./SentimentChart";
import PostTable from "./PostTable";
import IntelligenceSearch from "./IntelligenceSearch";
import ExecutiveCockpit from "./ExecutiveCockpit";
import ChatbotInterface from "./ChatbotInterface";
import PerformanceTrends from "./PerformanceTrends";
import ContentStrategy from "./ContentStrategy";
import PeriodComparison from "./PeriodComparison";
import AIBriefingLibrary from "./AIBriefingLibrary";
import NarrativeNavigator from "./NarrativeNavigator";
import DataDiscoveryZone from "./DataDiscoveryZone";
import MultiMonthSentimentTrend from "./MultiMonthSentimentTrend";

// Lazy-load the main page components for code splitting
const ExecutiveOverview = lazy(() => import("./ExecutiveOverview"));
const EngagementAnalytics = lazy(() => import("./EngagementAnalytics"));
const DataExplorer = lazy(() => import("./DataExplorer"));
const AIInsightsHub = lazy(() => import("./AIInsightsHub"));

interface CommandCenterProps {
  activeTab: string;
  selectedInsight: any;
}

export default function CommandCenter({ activeTab, selectedInsight }: CommandCenterProps) {

  const renderActiveTab = () => {
    // This switch now uses the route IDs from Sidebar.tsx
    switch (activeTab) {
      case 'command-center':
        return <ExecutiveOverview />;
      case 'data-explorer':
        return <DataExplorer />;
      case 'chat-astra':
        return <ChatbotInterface selectedInsight={selectedInsight} />;
      case 'narrative-scanner':
        return <NarrativeNavigator />;
      case 'predictive-analytics':
        return <PerformanceTrends />;
      // NOTE: The routes below from the old tab navigation are currently not mapped
      // in the new sidebar. They can be re-added to Sidebar.tsx if needed.
      // case 'executive':
      //   return <ExecutiveCockpit />;
      // case 'insights':
      //   return <AIInsightsHub />;
      // case 'engagement':
      //   return <EngagementAnalytics />;
      // case 'strategy':
      //   return (
      //     <div className="space-y-8">
      //       <ContentStrategy />
      //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      //         <TopicChart />
      //         <SentimentChart />
      //       </div>
      //       <PostTable />
      //     </div>
      //   );
      // case 'briefing':
      //   return <AIBriefingLibrary />;
      default:
        return <ExecutiveOverview />;
    }
  };

  return (
    <div className="w-full h-full p-0 m-0">
      {/* Dynamic Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        <Suspense fallback={<LoadingSpinner />}>
          {renderActiveTab()}
        </Suspense>
      </motion.div>
    </div>
  );
}