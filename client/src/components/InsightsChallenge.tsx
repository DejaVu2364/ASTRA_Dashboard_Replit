import { motion } from "framer-motion";
import { useState } from "react";
import { Target, Trophy, Clock, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Sentiment" | "Engagement" | "Trends" | "Analysis";
  points: number;
  timeLimit: string;
  completed: boolean;
  accuracy?: number;
}

export default function InsightsChallenge() {
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null);
  
  const challenges: Challenge[] = [
    {
      id: "1",
      title: "Sentiment Spike Detection",
      description: "Identify the posts with the most significant sentiment changes in the last 24 hours",
      difficulty: "Easy",
      category: "Sentiment",
      points: 100,
      timeLimit: "5 min",
      completed: true,
      accuracy: 94
    },
    {
      id: "2",
      title: "Engagement Pattern Analysis",
      description: "Find correlations between posting time and engagement rates across different topics",
      difficulty: "Medium",
      category: "Engagement",
      points: 250,
      timeLimit: "15 min",
      completed: true,
      accuracy: 87
    },
    {
      id: "3",
      title: "Narrative Trend Prediction",
      description: "Predict which topics will trend in the next 48 hours based on current data patterns",
      difficulty: "Hard",
      category: "Trends",
      points: 500,
      timeLimit: "30 min",
      completed: false
    },
    {
      id: "4",
      title: "Opposition Counter-Narrative",
      description: "Identify potential counter-narratives emerging from opposition sources",
      difficulty: "Hard",
      category: "Analysis",
      points: 750,
      timeLimit: "45 min",
      completed: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-verified-green/20 text-verified-green border-verified-green/30";
      case "Medium":
        return "bg-warning-amber/20 text-warning-amber border-warning-amber/30";
      case "Hard":
        return "bg-danger-red/20 text-danger-red border-danger-red/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Sentiment":
        return <Target className="w-4 h-4" />;
      case "Engagement":
        return <Users className="w-4 h-4" />;
      case "Trends":
        return <TrendingUp className="w-4 h-4" />;
      case "Analysis":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const totalPoints = challenges.reduce((sum, challenge) => 
    challenge.completed ? sum + challenge.points : sum, 0
  );

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <motion.div
        className="command-header p-6 rounded-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          Insights Challenge
        </h2>
        <p className="text-gray-400">
          Test your analytical skills with real-time intelligence challenges
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="data-card p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-8 h-8 text-warning-amber" />
            <span className="text-2xl font-bold text-warning-amber">{totalPoints}</span>
          </div>
          <div className="text-white font-medium">Total Points</div>
          <div className="text-sm text-gray-400">Rank: Elite Analyst</div>
        </motion.div>

        <motion.div
          className="data-card p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-verified-green" />
            <span className="text-2xl font-bold text-verified-green">91%</span>
          </div>
          <div className="text-white font-medium">Avg Accuracy</div>
          <div className="text-sm text-gray-400">Last 10 challenges</div>
        </motion.div>

        <motion.div
          className="data-card p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-electric-blue" />
            <span className="text-2xl font-bold text-electric-blue">
              {challenges.filter(c => c.completed).length}
            </span>
          </div>
          <div className="text-white font-medium">Completed</div>
          <div className="text-sm text-gray-400">
            {challenges.filter(c => !c.completed).length} remaining
          </div>
        </motion.div>
      </div>

      {/* Challenges Grid */}
      <motion.div
        className="grid gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            className={`data-card p-6 rounded-xl ${
              challenge.completed ? 'opacity-80' : ''
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(challenge.category)}
                    <span className="text-electric-blue font-medium">{challenge.category}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={getDifficultyColor(challenge.difficulty)}
                  >
                    {challenge.difficulty}
                  </Badge>
                  {challenge.completed && (
                    <Badge
                      variant="outline"
                      className="bg-verified-green/20 text-verified-green border-verified-green/30"
                    >
                      Completed
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  {challenge.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span>⏱️ {challenge.timeLimit}</span>
                  <span>🎯 {challenge.points} points</span>
                  {challenge.accuracy && (
                    <span className="text-verified-green">✓ {challenge.accuracy}% accuracy</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {challenge.completed ? (
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-warning-amber" />
                    <span className="text-warning-amber font-bold">+{challenge.points}</span>
                  </div>
                ) : (
                  <Button
                    className="bg-electric-blue hover:bg-electric-glow text-black font-medium"
                    onClick={() => setActiveChallenge(challenge.id)}
                  >
                    Start Challenge
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily Challenge */}
      <motion.div
        className="glass-morphism p-6 rounded-xl border-2 border-electric-blue/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-electric-blue/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-electric-blue" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-white">
                Daily Challenge
              </h3>
              <p className="text-gray-400 text-sm">
                Bonus points expire in 18:32:45
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-electric-blue">1000</div>
            <div className="text-sm text-gray-400">bonus points</div>
          </div>
        </div>
        <p className="text-white mb-4">
          Identify the most influential posts driving today's narrative shift regarding economic policy. 
          Analyze engagement patterns, sentiment variance, and comment thread dynamics.
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>⏱️ 60 min</span>
            <span>🎯 Expert Level</span>
            <span>🔥 2x Multiplier</span>
          </div>
          <Button
            className="bg-electric-blue hover:bg-electric-glow text-black font-medium"
            size="lg"
          >
            Accept Challenge
          </Button>
        </div>
      </motion.div>
    </div>
  );
}