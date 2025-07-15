import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Download, Eye, BarChart3, TrendingUp, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Post, Comment } from "@shared/schema";
import { useState, useMemo } from "react";

export default function DataDiscoveryZone() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'engagement' | 'sentiment' | 'date'>('engagement');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'detailed'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  const { data: posts } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: ['/api/comments'],
    staleTime: 5 * 60 * 1000,
  });

  // Get unique values for filters
  const uniqueTopics = useMemo(() => {
    const topics = new Set(posts?.map(p => p.mainTopic).filter(Boolean) || []);
    return ['all', ...Array.from(topics)];
  }, [posts]);

  const uniqueContentTypes = useMemo(() => {
    const types = new Set(posts?.map(p => p.contentType).filter(Boolean) || []);
    return ['all', ...Array.from(types)];
  }, [posts]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    let filtered = posts.filter(post => {
      // Text search
      if (searchQuery && !post.postCaption?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== 'all' && post.mainTopic !== selectedTopic) {
        return false;
      }

      // Content type filter
      if (selectedContentType !== 'all' && post.contentType !== selectedContentType) {
        return false;
      }

      // Sentiment filter
      if (sentimentFilter !== 'all') {
        const sentiment = parseFloat(post.avgSentimentScore || '0');
        if (sentimentFilter === 'positive' && sentiment <= 0) return false;
        if (sentimentFilter === 'negative' && sentiment >= 0) return false;
        if (sentimentFilter === 'neutral' && Math.abs(sentiment) > 0.1) return false;
      }

      return true;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return parseFloat(b.weightedEngagementRate || '0') - parseFloat(a.weightedEngagementRate || '0');
        case 'sentiment':
          return parseFloat(b.avgSentimentScore || '0') - parseFloat(a.avgSentimentScore || '0');
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, searchQuery, selectedTopic, selectedContentType, sentimentFilter, sortBy]);

  // Data insights
  const dataInsights = useMemo(() => {
    if (!posts) return null;

    const totalPosts = posts.length;
    const avgSentiment = posts.reduce((sum, p) => sum + parseFloat(p.avgSentimentScore || '0'), 0) / totalPosts;
    const avgEngagement = posts.reduce((sum, p) => sum + parseFloat(p.weightedEngagementRate || '0'), 0) / totalPosts;
    const topicDistribution = posts.reduce((acc, p) => {
      const topic = p.mainTopic || 'Unknown';
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPosts,
      avgSentiment,
      avgEngagement,
      topicDistribution,
      filteredCount: filteredPosts.length
    };
  }, [posts, filteredPosts]);

  const PostCard = ({ post }: { post: Post }) => (
    <Card 
      className="cursor-pointer hover:border-electric-blue/50 transition-all duration-300"
      onClick={() => setSelectedPost(post)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {post.contentType || 'Standard'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {post.mainTopic || 'General'}
          </Badge>
        </div>
        <CardTitle className="text-sm text-white line-clamp-2">
          {post.postCaption?.substring(0, 80)}...
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Engagement</span>
            <div className="font-medium text-white">
              {(parseFloat(post.weightedEngagementRate || '0') * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <span className="text-gray-400">Sentiment</span>
            <div className={`font-medium ${
              parseFloat(post.avgSentimentScore || '0') > 0 ? 'text-verified-green' : 'text-danger-red'
            }`}>
              {parseFloat(post.avgSentimentScore || '0').toFixed(3)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>👍 {post.totalLikes.toLocaleString()}</span>
          <span>💬 {post.commentCount.toLocaleString()}</span>
          <span>🔄 {post.numShares.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  const PostDetailModal = ({ post }: { post: Post }) => (
    <motion.div
      className="glass-morphism p-6 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-bold text-white">
          Post Analysis
        </h3>
        <Button variant="outline" size="sm" onClick={() => setSelectedPost(null)}>
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-medium text-white mb-2">Content</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {post.postCaption}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-obsidian-surface p-3 rounded-lg">
              <div className="text-sm text-gray-400">Content Type</div>
              <div className="font-medium text-white">{post.contentType || 'Standard'}</div>
            </div>
            <div className="bg-obsidian-surface p-3 rounded-lg">
              <div className="text-sm text-gray-400">Main Topic</div>
              <div className="font-medium text-white">{post.mainTopic || 'General'}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Performance Metrics</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-obsidian-surface p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-verified-green">
                {(parseFloat(post.weightedEngagementRate || '0') * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">Engagement Rate</div>
            </div>
            <div className="bg-obsidian-surface p-3 rounded-lg text-center">
              <div className={`text-2xl font-bold ${
                parseFloat(post.avgSentimentScore || '0') > 0 ? 'text-verified-green' : 'text-danger-red'
              }`}>
                {parseFloat(post.avgSentimentScore || '0').toFixed(3)}
              </div>
              <div className="text-sm text-gray-400">Sentiment Score</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-obsidian-surface p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-electric-blue">
                {post.totalLikes.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Likes</div>
            </div>
            <div className="bg-obsidian-surface p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-warning-amber">
                {post.commentCount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Comments</div>
            </div>
            <div className="bg-obsidian-surface p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-verified-green">
                {post.numShares.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Shares</div>
            </div>
          </div>
        </div>
      </div>

      {post.mostPositiveComment && (
        <div className="mt-6 space-y-4">
          <h4 className="text-lg font-medium text-white">Top Comments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-obsidian-surface p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-verified-green rounded-full"></div>
                <span className="text-sm font-medium text-verified-green">Most Positive</span>
              </div>
              <p className="text-sm text-gray-300">{post.mostPositiveComment}</p>
            </div>
            {post.mostNegativeComment && (
              <div className="bg-obsidian-surface p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-danger-red rounded-full"></div>
                  <span className="text-sm font-medium text-danger-red">Most Negative</span>
                </div>
                <p className="text-sm text-gray-300">{post.mostNegativeComment}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="command-header p-6 rounded-xl">
        <h2 className="text-3xl font-heading font-bold text-white mb-2">
          Data Discovery Zone
        </h2>
        <p className="text-gray-400">
          Advanced data exploration and filtering for deep insights
        </p>
      </div>

      {/* Search and Filters */}
      <motion.div
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {uniqueTopics.map(topic => (
                <SelectItem key={topic} value={topic}>
                  {topic === 'all' ? 'All Topics' : topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedContentType} onValueChange={setSelectedContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              {uniqueContentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('table')}
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
            >
              <Database className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Data Insights */}
        {dataInsights && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-obsidian-surface p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-electric-blue">
                {dataInsights.filteredCount}
              </div>
              <div className="text-sm text-gray-400">Filtered Results</div>
            </div>
            <div className="bg-obsidian-surface p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-white">
                {dataInsights.totalPosts}
              </div>
              <div className="text-sm text-gray-400">Total Posts</div>
            </div>
            <div className="bg-obsidian-surface p-4 rounded-lg text-center">
              <div className={`text-2xl font-bold ${
                dataInsights.avgSentiment > 0 ? 'text-verified-green' : 'text-danger-red'
              }`}>
                {dataInsights.avgSentiment.toFixed(3)}
              </div>
              <div className="text-sm text-gray-400">Avg Sentiment</div>
            </div>
            <div className="bg-obsidian-surface p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-warning-amber">
                {(dataInsights.avgEngagement * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">Avg Engagement</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Results */}
      {selectedPost ? (
        <PostDetailModal post={selectedPost} />
      ) : (
        <motion.div
          className="glass-morphism p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold text-white">
              Discovery Results
            </h3>
            <Badge variant="outline" className="text-electric-blue">
              {filteredPosts.length} posts found
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
              <p className="text-gray-400">
                Try adjusting your filters or search terms to discover more data
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}