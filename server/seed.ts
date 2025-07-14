import { storage } from "./storage";
import { mockDashboardData } from "../client/src/data/mockData";

async function seedDatabase() {
  console.log("🌱 Seeding database with initial data...");
  
  try {
    // Seed posts from mock data
    for (const mockPost of mockDashboardData) {
      await storage.createPost({
        postId: mockPost.post_id,
        platform: "facebook",
        caption: mockPost.post_caption,
        totalLikes: mockPost.total_likes,
        numShares: mockPost.num_shares,
        commentCount: mockPost.comment_count,
        avgSentimentScore: mockPost.avg_sentiment_score.toString(),
        weightedEngagementRate: mockPost.weighted_engagement_rate.toString(),
        negativeCommentRatio: mockPost.negative_comment_ratio.toString(),
        mainTopic: mockPost.main_topic,
      });
    }
    
    // Seed analytics data
    await storage.createAnalytics({
      metricType: "total_posts",
      value: "2400000",
      metadata: { description: "Total posts analyzed" }
    });
    
    await storage.createAnalytics({
      metricType: "sentiment_score",
      value: "0.67",
      metadata: { description: "Average sentiment score" }
    });
    
    await storage.createAnalytics({
      metricType: "engagement_rate",
      value: "0.089",
      metadata: { description: "Average engagement rate" }
    });
    
    // Seed challenges
    const challenges = [
      {
        title: "Sentiment Spike Detection",
        description: "Identify the posts with the most significant sentiment changes in the last 24 hours",
        difficulty: "Easy",
        category: "Sentiment",
        points: 100,
        timeLimit: "5 min",
        isActive: true
      },
      {
        title: "Engagement Pattern Analysis",
        description: "Find correlations between posting time and engagement rates across different topics",
        difficulty: "Medium",
        category: "Engagement",
        points: 250,
        timeLimit: "15 min",
        isActive: true
      },
      {
        title: "Narrative Trend Prediction",
        description: "Predict which topics will trend in the next 48 hours based on current data patterns",
        difficulty: "Hard",
        category: "Trends",
        points: 500,
        timeLimit: "30 min",
        isActive: true
      }
    ];
    
    for (const challenge of challenges) {
      await storage.createChallenge(challenge);
    }
    
    console.log("✅ Database seeded successfully!");
    console.log(`   - ${mockDashboardData.length} posts added`);
    console.log(`   - 3 analytics metrics added`);
    console.log(`   - ${challenges.length} challenges added`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };