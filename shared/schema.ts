import { pgTable, text, serial, integer, boolean, decimal, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  postId: text("post_id").unique().notNull(),
  platform: text("platform").notNull(),
  caption: text("caption").notNull(),
  totalLikes: integer("total_likes").default(0).notNull(),
  numShares: integer("num_shares").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  avgSentimentScore: decimal("avg_sentiment_score", { precision: 5, scale: 2 }).default("0.00").notNull(),
  sentimentVariance: decimal("sentiment_variance", { precision: 5, scale: 4 }).default("0.0000"),
  weightedEngagementRate: decimal("weighted_engagement_rate", { precision: 5, scale: 4 }).default("0.0000").notNull(),
  negativeCommentRatio: decimal("negative_comment_ratio", { precision: 5, scale: 4 }).default("0.0000").notNull(),
  mainTopic: text("main_topic").notNull(),
  mostNegativeComment: text("most_negative_comment"),
  mostPositiveComment: text("most_positive_comment"),
  originalNegativeContext: text("original_negative_context"),
  originalPositiveContext: text("original_positive_context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  commentId: text("comment_id"),
  facebookUrl: text("facebook_url"),
  content: text("content").notNull(),
  originalComment: text("original_comment"),
  originalLanguage: text("original_language"),
  textForAnalysis: text("text_for_analysis"),
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }).default("0.00").notNull(),
  topic: text("topic"),
  author: text("author"),
  profileName: text("profile_name"),
  profileUrl: text("profile_url"),
  profilePicture: text("profile_picture"),
  likesCount: integer("likes_count").default(0),
  threadingDepth: integer("threading_depth").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const narrativeReports = pgTable("narrative_reports", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  totalPosts: integer("total_posts").notNull(),
  totalComments: integer("total_comments").notNull(),
  averageSentiment: decimal("average_sentiment", { precision: 5, scale: 2 }).notNull(),
  topicDistribution: json("topic_distribution"),
  winningNarratives: json("winning_narratives"),
  losingNarratives: json("losing_narratives"),
  keyInsights: text("key_insights"),
  reportSummary: text("report_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const geminiReports = pgTable("gemini_reports", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  reportType: text("report_type").notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  metricType: text("metric_type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  metadata: json("metadata"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  category: text("category").notNull(),
  points: integer("points").notNull(),
  timeLimit: text("time_limit").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userChallenges = pgTable("user_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  completed: boolean("completed").default(false).notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const narrativeReportsRelations = relations(narrativeReports, ({ many }) => ({
  geminiReports: many(geminiReports),
}));

export const geminiReportsRelations = relations(geminiReports, ({ one }) => ({
  narrativeReport: one(narrativeReports, {
    fields: [geminiReports.month, geminiReports.year],
    references: [narrativeReports.month, narrativeReports.year],
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  recordedAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertNarrativeReportSchema = createInsertSchema(narrativeReports).omit({
  id: true,
  createdAt: true,
});

export const insertGeminiReportSchema = createInsertSchema(geminiReports).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;

export type InsertNarrativeReport = z.infer<typeof insertNarrativeReportSchema>;
export type NarrativeReport = typeof narrativeReports.$inferSelect;

export type InsertGeminiReport = z.infer<typeof insertGeminiReportSchema>;
export type GeminiReport = typeof geminiReports.$inferSelect;
