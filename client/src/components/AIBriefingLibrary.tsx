import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, Download, Search, BookOpen, Star, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { NarrativeReport, GeminiReport } from "@shared/schema";
import { useState } from "react";

export default function AIBriefingLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  const { data: narrativeReports } = useQuery<NarrativeReport[]>({
    queryKey: ['/api/narrative-reports'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: geminiReports } = useQuery<GeminiReport[]>({
    queryKey: ['/api/gemini-reports'],
    staleTime: 5 * 60 * 1000,
  });

  // Filter reports based on search term
  const filteredNarrativeReports = narrativeReports?.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredGeminiReports = geminiReports?.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getReportIcon = (reportType: string) => {
    switch (reportType) {
      case 'monthly': return <Calendar className="w-5 h-5" />;
      case 'strategic': return <Star className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'trend': return <TrendingUp className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getReportColor = (reportType: string) => {
    switch (reportType) {
      case 'monthly': return 'electric-blue';
      case 'strategic': return 'verified-green';
      case 'alert': return 'danger-red';
      case 'trend': return 'warning-amber';
      default: return 'gray-400';
    }
  };

  const ReportCard = ({ 
    report, 
    type, 
    onSelect 
  }: { 
    report: NarrativeReport | GeminiReport; 
    type: 'narrative' | 'gemini';
    onSelect: (id: string) => void;
  }) => {
    const isGemini = type === 'gemini';
    const reportType = isGemini ? (report as GeminiReport).reportType : 'narrative';
    const color = getReportColor(reportType);
    
    return (
      <motion.div
        className="glass-morphism p-4 rounded-lg border border-obsidian-border cursor-pointer hover:border-electric-blue/50 transition-colors"
        onClick={() => onSelect(report.id.toString())}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-${color}/20 mr-3`}>
              {getReportIcon(reportType)}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{report.title}</h3>
              <p className="text-xs text-gray-400">
                {new Date(report.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {isGemini ? 'AI Generated' : 'Narrative'}
            </Badge>
            <Badge variant="outline" className={`text-xs text-${color} border-${color}`}>
              {reportType}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {report.content.substring(0, 150)}...
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-400">
            <BookOpen className="w-3 h-3 mr-1" />
            {Math.ceil(report.content.length / 250)} min read
          </div>
          <Button variant="ghost" size="sm" className="text-electric-blue">
            <FileText className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
      </motion.div>
    );
  };

  const ReportViewer = ({ reportId }: { reportId: string }) => {
    const report = [...(narrativeReports || []), ...(geminiReports || [])].find(r => r.id.toString() === reportId);
    
    if (!report) return null;

    return (
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              {report.title}
            </h2>
            <p className="text-gray-400">
              Generated on {new Date(report.createdAt).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {report.content}
          </div>
        </div>
      </motion.div>
    );
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
          AI Strategic Briefing Library
        </h2>
        <p className="text-gray-400">
          Access comprehensive AI-generated reports and strategic insights
        </p>
      </div>

      {selectedReport ? (
        <ReportViewer reportId={selectedReport} />
      ) : (
        <>
          {/* Search and Filters */}
          <motion.div
            className="glass-morphism p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Filter by Date
              </Button>
            </div>

            {/* Report Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-obsidian-surface p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-electric-blue mb-1">
                  {filteredNarrativeReports.length}
                </div>
                <div className="text-sm text-gray-400">Narrative Reports</div>
              </div>
              <div className="bg-obsidian-surface p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-verified-green mb-1">
                  {filteredGeminiReports.length}
                </div>
                <div className="text-sm text-gray-400">AI Generated</div>
              </div>
              <div className="bg-obsidian-surface p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-warning-amber mb-1">
                  {filteredGeminiReports.filter(r => r.reportType === 'strategic').length}
                </div>
                <div className="text-sm text-gray-400">Strategic Reports</div>
              </div>
              <div className="bg-obsidian-surface p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-danger-red mb-1">
                  {filteredGeminiReports.filter(r => r.reportType === 'alert').length}
                </div>
                <div className="text-sm text-gray-400">Alert Reports</div>
              </div>
            </div>
          </motion.div>

          {/* Reports Grid */}
          <div className="space-y-8">
            {/* Narrative Reports */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-heading font-bold text-white mb-4">
                Narrative Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNarrativeReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ReportCard 
                      report={report} 
                      type="narrative"
                      onSelect={setSelectedReport}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Generated Reports */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-heading font-bold text-white mb-4">
                AI Generated Reports
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGeminiReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ReportCard 
                      report={report} 
                      type="gemini"
                      onSelect={setSelectedReport}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}