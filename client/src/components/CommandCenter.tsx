import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import KPICard from "./KPICard";
import TopicChart from "./TopicChart";
import SentimentChart from "./SentimentChart";
import PostTable from "./PostTable";
import { kpiData } from "../data/mockData";

export default function CommandCenter() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 p-8 space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-heading font-bold text-white">
            Command Center
          </h2>
          <p className="text-gray-400 mt-1">
            Real-time political intelligence dashboard
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <motion.div 
            className="px-4 py-2 rounded-lg bg-electric-blue/20 border border-electric-blue/30 text-electric-blue"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm">Live Stream</span>
            <motion.span 
              className="ml-2 w-2 h-2 bg-electric-blue rounded-full inline-block"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Last Updated</div>
            <div className="text-sm font-medium">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            color={kpi.color}
            delay={index * 0.1}
          />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopicChart />
        <SentimentChart />
      </div>
      
      {/* Intelligence Table */}
      <PostTable />
    </div>
  );
}
