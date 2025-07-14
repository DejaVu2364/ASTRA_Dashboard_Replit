export const mockDashboardData = [
  {
    post_id: "123_456",
    post_caption: "Celebrating the opening of the new community center. A wonderful day for our city!",
    total_likes: 2100,
    num_shares: 350,
    comment_count: 150,
    avg_sentiment_score: 0.78,
    sentiment_variance: 0.2,
    negative_comment_ratio: 0.02,
    weighted_engagement_rate: 0.035,
    main_topic: "Praise"
  },
  {
    post_id: "123_789",
    post_caption: "Our new proposal to tackle rising inflation will provide relief to families across the state.",
    total_likes: 850,
    num_shares: 450,
    comment_count: 320,
    avg_sentiment_score: -0.25,
    sentiment_variance: 0.85,
    negative_comment_ratio: 0.65,
    weighted_engagement_rate: 0.029,
    main_topic: "Economy"
  },
  {
    post_id: "123_101",
    post_caption: "A detailed look at our environmental protection plan and the steps we're taking to ensure a green future.",
    total_likes: 1200,
    num_shares: 180,
    comment_count: 95,
    avg_sentiment_score: 0.45,
    sentiment_variance: 0.4,
    negative_comment_ratio: 0.10,
    weighted_engagement_rate: 0.021,
    main_topic: "Environment"
  }
];

export const topicDistribution = [
  { name: 'Economy', value: 400, color: '#fbbf24' },
  { name: 'Praise', value: 300, color: '#10b981' },
  { name: 'Environment', value: 200, color: '#8b5cf6' },
  { name: 'Public Safety', value: 150, color: '#f59e0b' },
  { name: 'Healthcare', value: 100, color: '#ef4444' },
];

export const sentimentData = [
  { month: 'Jan', score: 0.65 },
  { month: 'Feb', score: 0.59 },
  { month: 'Mar', score: 0.80 },
  { month: 'Apr', score: 0.81 },
  { month: 'May', score: 0.56 },
  { month: 'Jun', score: 0.78 },
];

export const kpiData = [
  {
    title: "Total Engagements",
    value: 2847,
    change: "+12.5%",
    icon: "📊",
    color: "electric-blue"
  },
  {
    title: "Sentiment Score",
    value: 1234,
    change: "+8.2%",
    icon: "💬",
    color: "verified-green"
  },
  {
    title: "Narrative Trends",
    value: 892,
    change: "+15.7%",
    icon: "🎯",
    color: "purple-500"
  },
  {
    title: "Critical Alerts",
    value: 156,
    change: "-2.1%",
    icon: "⚠️",
    color: "red-500"
  }
];
