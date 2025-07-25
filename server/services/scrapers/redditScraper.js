const axios = require('axios');
const Article = require('../../models/Article');
const categorizer = require('../categorizer');

class RedditScraper {
  constructor() {
    this.baseURL = 'https://www.reddit.com';
    this.headers = {
      'User-Agent': 'AI-News-Aggregator/1.0.0'
    };
  }

  async scrapeAISubreddits() {
    try {
      console.log('Scraping Reddit AI subreddits...');
      
      const subreddits = [
        'MachineLearning',
        'artificial',
        'deeplearning',
        'computervision',
        'LanguageTechnology',
        'robotics',
        'reinforcementlearning',
        'datascience',
        'MLQuestions',
        'ArtificialIntelligence'
      ];

      const articles = [];

      for (const subreddit of subreddits) {
        try {
          // Get hot posts from subreddit
          const response = await axios.get(`${this.baseURL}/r/${subreddit}/hot.json`, {
            headers: this.headers,
            params: {
              limit: 25,
              t: 'week' // Posts from the last week
            }
          });

          const posts = response.data.data.children;

          for (const post of posts) {
            const data = post.data;
            
            // Skip if not relevant or already exists
            if (data.stickied || data.is_self === false && !data.url) continue;
            
            const url = data.is_self ? `https://reddit.com${data.permalink}` : data.url;
            const existingArticle = await Article.findOne({ url });
            if (existingArticle) continue;

            // Filter for AI-related content
            if (!this.isAIRelated(data.title, data.selftext)) continue;

            const article = {
              title: data.title,
              description: this.extractDescription(data),
              content: data.selftext || '',
              url,
              source: {
                name: `Reddit - r/${subreddit}`,
                url: `https://reddit.com/r/${subreddit}`,
                type: 'reddit'
              },
              author: {
                name: data.author,
                url: `https://reddit.com/u/${data.author}`
              },
              publishedAt: new Date(data.created_utc * 1000),
              categories: await categorizer.categorizeContent(
                `${data.title} ${data.selftext || ''}`
              ),
              tags: this.extractTags(data, subreddit),
              popularity: {
                score: data.score,
                likes: data.ups,
                comments: data.num_comments
              },
              metadata: {
                language: 'en',
                readingTime: this.estimateReadingTime(data.selftext || data.title),
                difficulty: this.estimateDifficulty(data.title, data.selftext),
                hasCode: this.hasCodeContent(data.selftext || '')
              },
              imageUrl: this.extractImageUrl(data)
            };

            articles.push(article);
          }

          // Rate limiting
          await this.delay(2000);

        } catch (error) {
          console.error(`Error scraping subreddit ${subreddit}:`, error.message);
          continue;
        }
      }

      // Save articles to database
      if (articles.length > 0) {
        await this.saveArticles(articles);
        console.log(`Saved ${articles.length} Reddit articles`);
      }

      return articles;

    } catch (error) {
      console.error('Error scraping Reddit:', error);
      throw error;
    }
  }

  isAIRelated(title, content) {
    const text = `${title} ${content || ''}`.toLowerCase();
    
    const aiKeywords = [
      'machine learning', 'deep learning', 'neural network', 'artificial intelligence',
      'computer vision', 'natural language processing', 'nlp', 'reinforcement learning',
      'transformer', 'bert', 'gpt', 'ai', 'ml', 'algorithm', 'model', 'dataset',
      'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'opencv', 'robotics',
      'automation', 'classification', 'regression', 'clustering', 'optimization'
    ];

    return aiKeywords.some(keyword => text.includes(keyword));
  }

  extractDescription(data) {
    if (data.selftext) {
      // For self posts, use the beginning of the text
      return this.truncateText(data.selftext, 300);
    } else if (data.url && data.url !== data.title) {
      // For link posts, create a description
      return `Discussion about: ${data.url}`;
    } else {
      // Fallback to title
      return data.title;
    }
  }

  extractTags(data, subreddit) {
    const tags = ['reddit', subreddit.toLowerCase()];
    
    // Add flair as tag if available
    if (data.link_flair_text) {
      tags.push(data.link_flair_text.toLowerCase().replace(/\s+/g, '-'));
    }

    // Extract tags from title and content
    const text = `${data.title} ${data.selftext || ''}`.toLowerCase();
    
    const keywordTags = [
      'research', 'paper', 'tutorial', 'discussion', 'question',
      'project', 'dataset', 'model', 'framework', 'library',
      'beginner', 'advanced', 'open source', 'github'
    ];

    keywordTags.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword.replace(/\s+/g, '-'));
      }
    });

    // Add domain-specific tags
    if (data.domain) {
      if (data.domain.includes('github.com')) tags.push('github', 'open-source');
      if (data.domain.includes('arxiv.org')) tags.push('arxiv', 'research');
      if (data.domain.includes('youtube.com')) tags.push('video', 'tutorial');
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  extractImageUrl(data) {
    if (data.thumbnail && data.thumbnail !== 'self' && data.thumbnail !== 'default') {
      return data.thumbnail;
    }
    if (data.preview && data.preview.images && data.preview.images[0]) {
      return data.preview.images[0].source.url.replace(/&amp;/g, '&');
    }
    return null;
  }

  estimateReadingTime(text) {
    if (!text) return 1;
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / 200));
  }

  estimateDifficulty(title, content) {
    const text = `${title} ${content || ''}`.toLowerCase();
    
    if (text.includes('beginner') || text.includes('eli5') || text.includes('simple')) {
      return 'beginner';
    }
    if (text.includes('advanced') || text.includes('research') || text.includes('paper')) {
      return 'advanced';
    }
    if (text.includes('phd') || text.includes('cutting-edge') || text.includes('sota')) {
      return 'expert';
    }
    
    return 'intermediate';
  }

  hasCodeContent(text) {
    const codeIndicators = [
      'github.com', 'code', 'implementation', 'repository', 'script',
      'function', 'class', 'import', 'def ', 'return ', '```'
    ];
    
    return codeIndicators.some(indicator => text.toLowerCase().includes(indicator));
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  async saveArticles(articles) {
    for (const articleData of articles) {
      try {
        const article = new Article(articleData);
        await article.save();
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate URL, skip
          continue;
        }
        console.error('Error saving Reddit article:', error.message);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new RedditScraper();
