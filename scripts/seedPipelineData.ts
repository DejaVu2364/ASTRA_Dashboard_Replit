import { db } from "../server/db";
import { posts, comments, narrativeReports, geminiReports } from "../shared/schema";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

async function seedPipelineData() {
  console.log("Starting to seed FB Pipeline data...");

  try {
    // 1. Seed posts from monthly summaries
    const postSummaryPath = path.join(process.cwd(), "FB Pipeline - BACKUP/monthly_summaries/post_summary_2024-12.csv");
    
    if (fs.existsSync(postSummaryPath)) {
      const postsCsv = fs.readFileSync(postSummaryPath, "utf-8");
      const postRecords = parse(postsCsv, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
      });

      console.log(`Found ${postRecords.length} posts to seed`);

      for (const record of postRecords) {
        try {
          await db.insert(posts).values({
            postId: record.post_id?.toString() || Math.random().toString(),
            platform: "facebook",
            caption: record.post_caption || "",
            totalLikes: parseInt(record.total_likes) || 0,
            numShares: parseInt(record.num_shares) || 0,
            commentCount: parseInt(record.comment_count) || 0,
            avgSentimentScore: record.avg_sentiment_score?.toString() || "0",
            sentimentVariance: record.sentiment_variance?.toString() || "0",
            weightedEngagementRate: record.weighted_engagement_rate?.toString() || "0",
            negativeCommentRatio: record.negative_comment_ratio?.toString() || "0",
            mainTopic: record.main_topic || "General",
            mostNegativeComment: record.most_negative_comment || null,
            mostPositiveComment: record.most_positive_comment || null,
            originalNegativeContext: record.original_negative_context || null,
            originalPositiveContext: record.original_positive_context || null,
          }).onConflictDoNothing();
        } catch (error) {
          console.error(`Error inserting post ${record.post_id}:`, error);
        }
      }
    }

    // 2. Seed comments from main data file
    const commentsPath = path.join(process.cwd(), "FB Pipeline - BACKUP/fb_comments_data.json");
    
    if (fs.existsSync(commentsPath)) {
      const commentsData = JSON.parse(fs.readFileSync(commentsPath, "utf-8"));
      
      console.log(`Found ${commentsData.length} comments to seed`);

      // Get existing posts to link comments
      const existingPosts = await db.select().from(posts);
      const postMap = new Map(existingPosts.map(p => [p.postId, p.id]));

      for (const comment of commentsData.slice(0, 1000)) { // Limit to first 1000 for initial seed
        try {
          const postDbId = postMap.get(comment.post_id?.toString());
          if (postDbId) {
            await db.insert(comments).values({
              postId: postDbId,
              commentId: comment.comment_id?.toString() || null,
              facebookUrl: comment.facebook_url || null,
              content: comment.text || comment.original_comment || "",
              originalComment: comment.original_comment || null,
              originalLanguage: comment.original_language || null,
              textForAnalysis: comment.text_for_analysis || null,
              sentimentScore: comment.sentiment_score?.toString() || "0",
              topic: comment.topic || null,
              author: comment.profile_name || "Unknown",
              profileName: comment.profile_name || null,
              profileUrl: comment.profile_url || null,
              profilePicture: comment.profile_picture || null,
              likesCount: parseInt(comment.likes_count) || 0,
              threadingDepth: parseInt(comment.threading_depth) || 0,
            }).onConflictDoNothing();
          }
        } catch (error) {
          console.error(`Error inserting comment ${comment.comment_id}:`, error);
        }
      }
    }

    // 3. Create sample narrative reports
    await db.insert(narrativeReports).values({
      month: "12",
      year: 2024,
      totalPosts: 150,
      totalComments: 2500,
      averageSentiment: "0.65",
      topicDistribution: {
        "Praise": 45,
        "Development": 30,
        "Politics": 15,
        "General": 10
      },
      winningNarratives: [
        "Development initiatives gaining strong public support",
        "Educational programs showing positive impact",
        "Infrastructure projects well-received by constituents"
      ],
      losingNarratives: [
        "Some criticism on project timelines",
        "Mixed response to policy changes"
      ],
      keyInsights: "Overall positive sentiment with strong support for development initiatives. Educational programs particularly well-received.",
      reportSummary: "December 2024 showed strong positive sentiment across development and educational initiatives, with particularly high engagement on infrastructure projects."
    }).onConflictDoNothing();

    // 4. Create sample Gemini reports
    await db.insert(geminiReports).values({
      month: "12",
      year: 2024,
      reportType: "summary",
      content: "Comprehensive analysis of December 2024 social media engagement shows overwhelmingly positive sentiment towards development initiatives. Key themes include education, infrastructure, and community development programs.",
      metadata: {
        "analysis_date": "2024-12-31",
        "data_points": 2650,
        "sentiment_accuracy": 0.92,
        "topic_coverage": ["education", "infrastructure", "development", "community"]
      }
    }).onConflictDoNothing();

    console.log("FB Pipeline data seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding FB Pipeline data:", error);
    throw error;
  }
}

// Run the seeding function
seedPipelineData().catch(console.error);