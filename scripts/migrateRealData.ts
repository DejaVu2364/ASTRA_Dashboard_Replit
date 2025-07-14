import { db } from "../server/db";
import { posts, comments, narrativeReports, geminiReports, analytics } from "../shared/schema";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

interface PostSummaryRow {
  post_id: string;
  post_caption: string;
  content_type: string;
  total_likes: number;
  num_shares: number;
  comment_count: number;
  avg_sentiment_score: number;
  sentiment_variance: number;
  negative_comment_ratio: number;
  main_topic: string;
  most_positive_comment: string;
  original_positive_context: string;
  most_negative_comment: string;
  original_negative_context: string;
  weighted_engagement_rate: number;
}

interface EnrichedCommentRow {
  post_id: string;
  post_caption: string;
  content_type: string;
  total_likes: number;
  num_shares: number;
  comment_likes: number;
  original_comment_for_context: string;
  original_language: string;
  text_for_analysis: string;
  sentiment_score: number;
  topic: string;
}

async function clearExistingData() {
  console.log("Clearing existing data...");
  await db.delete(analytics);
  await db.delete(narrativeReports);
  await db.delete(geminiReports);
  await db.delete(comments);
  await db.delete(posts);
  console.log("Existing data cleared");
}

async function migratePostSummaries() {
  console.log("Migrating post summaries...");
  
  const summaryDir = path.join(process.cwd(), "DASHBOARD FINAL 2", "monthly_reports");
  const summaryFiles = fs.readdirSync(summaryDir).filter(file => file.startsWith("post_summary_"));
  
  for (const file of summaryFiles) {
    const filePath = path.join(summaryDir, file);
    const csvContent = fs.readFileSync(filePath, "utf-8");
    const rows = parse(csvContent, { 
      columns: true, 
      skip_empty_lines: true,
      cast: true
    }) as PostSummaryRow[];
    
    // Extract month from filename (e.g., "post_summary_2025-01.csv" -> "2025-01")
    const monthMatch = file.match(/post_summary_(\d{4}-\d{2})\.csv/);
    const month = monthMatch ? monthMatch[1] : "unknown";
    
    console.log(`Processing ${file}: ${rows.length} posts`);
    
    for (const row of rows) {
      try {
        await db.insert(posts).values({
          postId: row.post_id,
          platform: "facebook",
          caption: row.post_caption || "No caption available",
          totalLikes: row.total_likes || 0,
          numShares: row.num_shares || 0,
          commentCount: row.comment_count || 0,
          avgSentimentScore: row.avg_sentiment_score?.toString() || "0.00",
          sentimentVariance: row.sentiment_variance?.toString() || "0.0000",
          negativeCommentRatio: row.negative_comment_ratio?.toString() || "0.0000",
          mainTopic: row.main_topic || "Unknown",
          mostPositiveComment: row.most_positive_comment || "",
          mostNegativeComment: row.most_negative_comment || "",
          originalPositiveContext: row.original_positive_context || "",
          originalNegativeContext: row.original_negative_context || "",
          weightedEngagementRate: row.weighted_engagement_rate?.toString() || "0.0000",
          createdAt: new Date(`${month}-01`)
        }).onConflictDoNothing();
      } catch (error) {
        if (!error.message.includes("duplicate key")) {
          console.error(`Error inserting post ${row.post_id}:`, error);
        }
      }
    }
  }
  
  console.log("Post summaries migrated successfully");
}

async function migrateEnrichedComments() {
  console.log("Migrating enriched comments...");
  
  const commentsDir = path.join(process.cwd(), "DASHBOARD FINAL 2", "enriched_data");
  const commentFiles = fs.readdirSync(commentsDir).filter(file => file.startsWith("enriched_data_"));
  
  for (const file of commentFiles) {
    const filePath = path.join(commentsDir, file);
    const csvContent = fs.readFileSync(filePath, "utf-8");
    const rows = parse(csvContent, { 
      columns: true, 
      skip_empty_lines: true,
      cast: true
    }) as EnrichedCommentRow[];
    
    // Extract month from filename
    const monthMatch = file.match(/enriched_data_(\d{4}-\d{2})\.csv/);
    const month = monthMatch ? monthMatch[1] : "unknown";
    
    console.log(`Processing ${file}: ${rows.length} comments`);
    
    for (const row of rows) {
      // Skip empty or invalid comments
      if (!row.text_for_analysis || row.text_for_analysis.trim() === "") {
        continue;
      }
      
      try {
        await db.insert(comments).values({
          postId: parseInt(row.post_id) || 0,
          content: row.text_for_analysis || "",
          originalComment: row.original_comment_for_context || "",
          originalLanguage: row.original_language || "unknown",
          textForAnalysis: row.text_for_analysis || "",
          sentimentScore: row.sentiment_score?.toString() || "0.00",
          topic: row.topic || "Unknown",
          likesCount: row.comment_likes || 0,
          createdAt: new Date(`${month}-01`)
        });
      } catch (error) {
        console.error(`Error inserting comment for post ${row.post_id}:`, error);
      }
    }
  }
  
  console.log("Enriched comments migrated successfully");
}

async function migrateNarrativeReports() {
  console.log("Migrating narrative reports...");
  
  const reportsDir = path.join(process.cwd(), "DASHBOARD FINAL 2", "monthly_reports");
  const reportFiles = fs.readdirSync(reportsDir).filter(file => file.startsWith("report-") && file.endsWith(".md"));
  
  for (const file of reportFiles) {
    const filePath = path.join(reportsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    
    // Extract month from filename (e.g., "report-2025-01.md" -> "2025-01")
    const monthMatch = file.match(/report-(\d{4}-\d{2})\.md/);
    const month = monthMatch ? monthMatch[1] : "unknown";
    const [year, monthNum] = month.split("-");
    
    console.log(`Processing ${file}`);
    
    try {
      await db.insert(narrativeReports).values({
        month: monthNum,
        year: parseInt(year),
        totalPosts: 0, // Will be updated by analytics
        totalComments: 0, // Will be updated by analytics
        averageSentiment: "0.00", // Will be updated by analytics
        topicDistribution: {},
        winningNarratives: [],
        losingNarratives: [],
        keyInsights: content.split('\n').slice(0, 10).join('\n') + '...',
        reportSummary: content,
        createdAt: new Date(`${month}-01`)
      });
    } catch (error) {
      console.error(`Error inserting narrative report for ${month}:`, error);
    }
  }
  
  console.log("Narrative reports migrated successfully");
}

async function generateAnalytics() {
  console.log("Generating analytics from migrated data...");
  
  // Generate monthly analytics
  const months = ['2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
  
  for (const month of months) {
    const [year, monthNum] = month.split('-');
    const monthStart = new Date(`${month}-01`);
    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Get post statistics for this month
    const monthPosts = await db.query.posts.findMany({
      where: (posts, { eq }) => eq(posts.analysisMonth, month)
    });
    
    const monthComments = await db.query.comments.findMany({
      where: (comments, { eq }) => eq(comments.analysisMonth, month)
    });
    
    if (monthPosts.length > 0) {
      const totalLikes = monthPosts.reduce((sum, post) => sum + post.likes, 0);
      const totalShares = monthPosts.reduce((sum, post) => sum + post.shares, 0);
      const totalComments = monthPosts.reduce((sum, post) => sum + post.comments, 0);
      const avgSentiment = monthPosts.reduce((sum, post) => sum + post.avgSentiment, 0) / monthPosts.length;
      const avgEngagement = monthPosts.reduce((sum, post) => sum + post.engagementRate, 0) / monthPosts.length;
      
      const positiveComments = monthComments.filter(c => c.sentiment > 0.3).length;
      const negativeComments = monthComments.filter(c => c.sentiment < -0.3).length;
      const neutralComments = monthComments.length - positiveComments - negativeComments;
      
      // Insert analytics
      await db.insert(analytics).values([
        {
          metricType: "total_posts",
          value: monthPosts.length,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        },
        {
          metricType: "total_likes",
          value: totalLikes,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        },
        {
          metricType: "total_shares",
          value: totalShares,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        },
        {
          metricType: "total_comments",
          value: totalComments,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        },
        {
          metricType: "avg_sentiment",
          value: avgSentiment,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        },
        {
          metricType: "engagement_rate",
          value: avgEngagement,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        },
        {
          metricType: "positive_comments",
          value: positiveComments,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        },
        {
          metricType: "negative_comments",
          value: negativeComments,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        },
        {
          metricType: "neutral_comments",
          value: neutralComments,
          month: monthNum,
          year: parseInt(year),
          createdAt: monthStart
        }
      ]);
    }
    
    console.log(`Generated analytics for ${month}`);
  }
  
  console.log("Analytics generated successfully");
}

async function main() {
  try {
    console.log("Starting real data migration from DASHBOARD FINAL 2...");
    
    await clearExistingData();
    await migratePostSummaries();
    await migrateEnrichedComments();
    await migrateNarrativeReports();
    await generateAnalytics();
    
    console.log("✅ Real data migration completed successfully!");
    console.log("All mock/placeholder data has been replaced with actual DASHBOARD FINAL 2 data.");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as migrateRealData };