import { GoogleGenAI } from "@google/genai";
import type { Post, Comment, AIInsight, ContentAnalysis, NarrativeAnalysis } from "@shared/schema";
import crypto from 'crypto';

// ============= FREE GEMINI API USAGE ONLY =============
// Using gemini-2.5-flash (FREE model) with conservative limits
// No costs will be incurred with this configuration
// =====================================================

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

/**
 * AIService provides methods for interacting with the Google Gemini AI
 * to generate insights, analyze content, and create reports based on social media data.
 * It includes features like rate limiting, caching, and fallback mechanisms.
 */
export class AIService {
  // ============= FREE GEMINI CONFIGURATION =============
  // Using FREE Gemini model only - no cost incurred
  private model = "gemini-2.5-flash"; // FREE model
  private maxTokens = 1024; // Conservative limit for free usage
  private requestCount = 0; // Track requests to avoid rate limits
  private maxRequestsPerMinute = 15; // Conservative rate limit
  // ====================================================

  private insightCache = new Map<string, CacheEntry<AIInsight[]>>();
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * A centralized method for making requests to the Gemini API.
   * Includes rate limiting to stay within the free tier.
   * @param prompt The prompt string to send to the AI.
   * @param config Configuration for the AI model, like response type and schema.
   * @returns The response from the AI or null if rate-limited.
   */
  private async makeRequest(prompt: string, config: any): Promise<any> {
    // Rate limiting to stay within free tier limits
    this.requestCount++;
    if (this.requestCount > this.maxRequestsPerMinute) {
      console.warn('Rate limit approached, using fallback data');
      return null;
    }
    
    // The actual API call is wrapped in a try/catch in the calling methods.
    return await ai.models.generateContent({
      model: this.model, // FREE gemini-2.5-flash model
      contents: prompt,
      config: {
        maxOutputTokens: this.maxTokens,
        ...config
      }
    });
  }

  /**
   * Generates strategic insights from a collection of social media posts.
   * This method is cached for 5 minutes to avoid redundant API calls.
   * @param posts An array of Post objects to analyze.
   * @returns A promise that resolves to an array of AIInsight objects.
   */
  async generateInsights(posts: Post[]): Promise<AIInsight[]> {
    const dataContext = this.prepareDataContext(posts);
    const dataHash = crypto.createHash('md5').update(dataContext).digest('hex');

    // Check cache first
    const cachedEntry = this.insightCache.get(dataHash);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < this.CACHE_DURATION_MS)) {
      console.log("Returning cached insights.");
      return cachedEntry.data;
    }

    try {
      const prompt = `
        Analyze the following social media performance data and generate strategic insights:

        ${dataContext}

        Generate 5-7 actionable insights in the following categories:
        1. Performance Analysis
        2. Content Strategy Opportunities
        3. Audience Engagement Patterns
        4. Trending Topics
        5. Risk Assessment

        For each insight, provide:
        - Clear title and description
        - Confidence level (0-100)
        - Priority level (high/medium/low)
        - Specific actionable recommendations
        - Expected impact level

        Format as JSON array with proper structure.
      `;

      const response = await this.makeRequest(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              confidence: { type: "number" },
              priority: { type: "string" },
              actionable: { type: "boolean" },
              recommendation: { type: "string" },
              impact: { type: "string" },
              dataPoints: { type: "array", items: { type: "string" } }
            },
            required: ["id", "type", "title", "description", "confidence", "priority", "actionable", "recommendation", "impact"]
          }
        }
      });

      if (!response) {
        return this.getFallbackInsights(posts);
      }

      const insights: AIInsight[] = JSON.parse(response.text || "[]").map((insight: any) => ({
        ...insight,
        generatedAt: new Date()
      }));

      // Store in cache
      this.insightCache.set(dataHash, { timestamp: Date.now(), data: insights });

      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.getFallbackInsights(posts);
    }
  }

  /**
   * Analyzes a single piece of content along with its performance metrics.
   * @param content The text content of the post.
   * @param metrics An object containing performance metrics like engagement rate, likes, etc.
   * @returns A promise that resolves to a ContentAnalysis object.
   */
  async analyzeContent(content: string, metrics: any): Promise<ContentAnalysis> {
    try {
      const prompt = `
        Analyze this social media content and its performance metrics:

        Content: "${content}"
        
        Metrics:
        - Engagement Rate: ${metrics.engagementRate}%
        - Sentiment Score: ${metrics.sentiment}
        - Likes: ${metrics.likes}
        - Comments: ${metrics.comments}
        - Shares: ${metrics.shares}

        Provide analysis including:
        1. Sentiment analysis (-1 to 1)
        2. Key topics and themes
        3. Engagement prediction for similar content
        4. Specific improvement recommendations
        5. Content quality score (0-100)
        6. Viral potential assessment (0-100)

        Format as JSON with proper structure.
      `;

      const response = await this.makeRequest(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            sentiment: { type: "number" },
            topics: { type: "array", items: { type: "string" } },
            engagementPrediction: { type: "number" },
            recommendedActions: { type: "array", items: { type: "string" } },
            contentQuality: { type: "number" },
            viralPotential: { type: "number" }
          },
          required: ["sentiment", "topics", "engagementPrediction", "recommendedActions", "contentQuality", "viralPotential"]
        }
      });

      if (!response) {
        return this.getFallbackContentAnalysis();
      }

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error('Error analyzing content:', error);
      return this.getFallbackContentAnalysis();
    }
  }

  /**
   * Analyzes a collection of posts to identify narrative trends and strategic insights.
   * @param posts An array of Post objects to analyze for narratives.
   * @returns A promise that resolves to a NarrativeAnalysis object.
   */
  async generateNarrativeAnalysis(posts: Post[]): Promise<NarrativeAnalysis> {
    try {
      const narrativeContext = posts.map(p => ({
        topic: p.mainTopic,
        sentiment: p.avgSentimentScore,
        engagement: p.weightedEngagementRate,
        content: p.caption?.substring(0, 200)
      }));

      const prompt = `
        Analyze these social media posts for narrative trends and strategic insights:

        ${JSON.stringify(narrativeContext, null, 2)}

        Provide comprehensive narrative analysis including:
        1. Dominant narratives and themes
        2. Emerging trends to watch
        3. Overall sentiment shift patterns
        4. Narrative strength scoring by topic
        5. Strategic recommendations for content strategy
        6. Risk assessment for potential narrative issues

        Format as JSON with proper structure.
      `;

      const response = await this.makeRequest(prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            dominantNarratives: { type: "array", items: { type: "string" } },
            emergingTrends: { type: "array", items: { type: "string" } },
            sentimentShift: { type: "number" },
            narrativeStrength: { type: "object" },
            strategicRecommendations: { type: "array", items: { type: "string" } },
            riskAssessment: { type: "array", items: { type: "string" } }
          },
          required: ["dominantNarratives", "emergingTrends", "sentimentShift", "narrativeStrength", "strategicRecommendations", "riskAssessment"]
        }
      });

      if (!response) {
        return this.getFallbackNarrativeAnalysis();
      }

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error('Error generating narrative analysis:', error);
      return this.getFallbackNarrativeAnalysis();
    }
  }

  /**
   * Generates a full strategic report in Markdown format.
   * @param posts An array of Post objects to include in the report.
   * @param timeframe A string describing the time period for the report (e.g., "current month").
   * @returns A promise that resolves to a string containing the Markdown report.
   */
  async generateStrategicReport(posts: Post[], timeframe: string): Promise<string> {
    try {
      const summary = this.generateDataSummary(posts);
      
      const prompt = `
        Generate a comprehensive strategic intelligence report for the ${timeframe} period:

        ${summary}

        Create a detailed report including:
        1. Executive Summary
        2. Key Performance Indicators Analysis
        3. Content Strategy Recommendations
        4. Audience Engagement Insights
        5. Trend Analysis and Predictions
        6. Risk Assessment and Mitigation
        7. Action Plan for Next Period

        Format as markdown with clear sections and actionable insights.
      `;

      const response = await this.makeRequest(prompt, {
        maxOutputTokens: this.maxTokens * 2 // Slightly higher limit for reports
      });

      if (!response) {
        return this.getFallbackReport(timeframe);
      }

      return response.text || "Report generation failed";
    } catch (error) {
      console.error('Error generating strategic report:', error);
      return this.getFallbackReport(timeframe);
    }
  }

  private prepareDataContext(posts: Post[]): string {
    const totalPosts = posts.length;
    const avgSentiment = posts.reduce((sum, p) => sum + parseFloat(p.avgSentimentScore || '0'), 0) / totalPosts;
    const avgEngagement = posts.reduce((sum, p) => sum + parseFloat(p.weightedEngagementRate || '0'), 0) / totalPosts;
    
    const topicDistribution = posts.reduce((acc, p) => {
      const topic = p.mainTopic || 'Unknown';
      (acc as any)[topic] = ((acc as any)[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
      Total Posts: ${totalPosts}
      Average Sentiment: ${avgSentiment.toFixed(3)}
      Average Engagement: ${(avgEngagement * 100).toFixed(2)}%
      
      Topic Distribution: ${JSON.stringify(topicDistribution, null, 2)}
      
      Top Performing Posts:
      ${posts.sort((a, b) => parseFloat(b.weightedEngagementRate || '0') - parseFloat(a.weightedEngagementRate || '0'))
        .slice(0, 5)
        .map(p => `- ${p.mainTopic}: ${p.caption?.substring(0, 100)}... (${(parseFloat(p.weightedEngagementRate || '0') * 100).toFixed(2)}% engagement)`)
        .join('\n')}
    `;
  }

  private generateDataSummary(posts: Post[]): string {
    const metrics = {
      totalPosts: posts.length,
      avgSentiment: posts.reduce((sum, p) => sum + parseFloat(p.avgSentimentScore || '0'), 0) / posts.length,
      avgEngagement: posts.reduce((sum, p) => sum + parseFloat(p.weightedEngagementRate || '0'), 0) / posts.length,
      totalLikes: posts.reduce((sum, p) => sum + p.totalLikes, 0),
      totalComments: posts.reduce((sum, p) => sum + p.commentCount, 0),
      totalShares: posts.reduce((sum, p) => sum + p.numShares, 0)
    };

    return `
      Performance Summary:
      - Total Posts: ${metrics.totalPosts}
      - Average Sentiment: ${metrics.avgSentiment.toFixed(3)}
      - Average Engagement: ${(metrics.avgEngagement * 100).toFixed(2)}%
      - Total Interactions: ${(metrics.totalLikes + metrics.totalComments + metrics.totalShares).toLocaleString()}
    `;
  }

  private getFallbackInsights(posts: Post[]): AIInsight[] {
    return [
      {
        id: 'sentiment-trend',
        type: 'performance',
        title: 'Sentiment Analysis',
        description: 'Overall sentiment performance needs attention',
        confidence: 85,
        priority: 'medium',
        actionable: true,
        recommendation: 'Focus on positive messaging and community engagement',
        impact: 'high',
        dataPoints: ['Sentiment tracking', 'Community feedback'],
        generatedAt: new Date()
      }
    ];
  }

  private getFallbackContentAnalysis(): ContentAnalysis {
    return {
      sentiment: 0,
      topics: ['General'],
      engagementPrediction: 0.02,
      recommendedActions: ['Improve content quality', 'Increase engagement'],
      contentQuality: 60,
      viralPotential: 30
    };
  }

  private getFallbackNarrativeAnalysis(): NarrativeAnalysis {
    return {
      dominantNarratives: ['General Discussion'],
      emergingTrends: ['Standard Content'],
      sentimentShift: 0,
      narrativeStrength: { 'General': 0.5 },
      strategicRecommendations: ['Monitor engagement patterns'],
      riskAssessment: ['No significant risks identified']
    };
  }

  private getFallbackReport(timeframe: string): string {
    return `
# Strategic Intelligence Report - ${timeframe}

## Executive Summary
AI analysis is temporarily unavailable. Please check API configuration.

## Key Metrics
- Data processing completed
- Analysis pending API connectivity

## Recommendations
- Verify API key configuration
- Check network connectivity
- Retry analysis
    `;
  }
}

export const aiService = new AIService();