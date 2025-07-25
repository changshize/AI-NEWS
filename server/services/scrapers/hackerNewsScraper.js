const axios = require('axios');
const Article = require('../../models/Article');
const categorizer = require('../categorizer');

class HackerNewsScraper {
  constructor() {
    this.baseURL = 'https://hacker-news.firebaseio.com/v0';
  }

  async scrapeTopStories() {
    try {
      console.log('Scraping Hacker News top stories...');
      
      // Get top story IDs
      const topStoriesResponse = await axios.get(`${this.baseURL}/topstories.json`);
      const storyIds = topStoriesResponse.data.slice(0, 100); // Get top 100 stories
      
      const articles = [];
      
      for (const storyId of storyIds) {
        try {
          // Get story details
          const storyResponse = await axios.get(`${this.baseURL}/item/${storyId}.json`);
          const story = storyResponse.data;
          
          // Skip if not a story or no URL
          if (story.type !== 'story' || !story.url) continue;
          
          // Filter for AI-related content
          if (!this.isAIRelated(story.title, story.text)) continue;
          
          // Check if article already exists
          const existingArticle = await Article.findOne({ url: story.url });
          if (existingArticle) continue;
          
          const article = {
            title: story.title,
            description: this.extractDescription(story),
            url: story.url,
            source: {
              name: 'Hacker News',
              url: 'https://news.ycombinator.com',
              type: 'hackernews'
            },
            author: {
              name: story.by || 'Anonymous',
              url: story.by ? `https://news.ycombinator.com/user?id=${story.by}` : null
            },
            publishedAt: new Date(story.time * 1000),
            categories: await categorizer.categorizeContent(story.title),
            tags: this.extractTags(story),
            popularity: {
              score: story.score || 0,
              comments: story.descendants || 0
            },
            metadata: {
              language: 'en',
              readingTime: this.estimateReadingTime(story.title),
              difficulty: this.estimateDifficulty(story.title, story.url),
              hasCode: this.hasCodeContent(story.title, story.url)
            }
          };
          
          articles.push(article);
          
          // Rate limiting
          await this.delay(100);
          
        } catch (error) {
          console.error(`Error processing story ${storyId}:`, error.message);
          continue;
        }
      }
      
      // Save articles to database
      if (articles.length > 0) {
        await this.saveArticles(articles);
        console.log(`Saved ${articles.length} Hacker News articles`);
      }
      
      return articles;
      
    } catch (error) {
      console.error('Error scraping Hacker News:', error);
      throw error;
    }
  }

  async scrapeNewStories() {
    try {
      console.log('Scraping Hacker News new stories...');
      
      // Get new story IDs
      const newStoriesResponse = await axios.get(`${this.baseURL}/newstories.json`);
      const storyIds = newStoriesResponse.data.slice(0, 50); // Get top 50 new stories
      
      const articles = [];
      
      for (const storyId of storyIds) {
        try {
          const storyResponse = await axios.get(`${this.baseURL}/item/${storyId}.json`);
          const story = storyResponse.data;
          
          if (story.type !== 'story' || !story.url) continue;
          if (!this.isAIRelated(story.title, story.text)) continue;
          
          const existingArticle = await Article.findOne({ url: story.url });
          if (existingArticle) continue;
          
          const article = {
            title: story.title,
            description: this.extractDescription(story),
            url: story.url,
            source: {
              name: 'Hacker News',
              url: 'https://news.ycombinator.com',
              type: 'hackernews'
            },
            author: {
              name: story.by || 'Anonymous',
              url: story.by ? `https://news.ycombinator.com/user?id=${story.by}` : null
            },
            publishedAt: new Date(story.time * 1000),
            categories: await categorizer.categorizeContent(story.title),
            tags: this.extractTags(story),
            popularity: {
              score: story.score || 0,
              comments: story.descendants || 0
            },
            metadata: {
              language: 'en',
              readingTime: this.estimateReadingTime(story.title),
              difficulty: this.estimateDifficulty(story.title, story.url),
              hasCode: this.hasCodeContent(story.title, story.url)
            }
          };
          
          articles.push(article);
          await this.delay(100);
          
        } catch (error) {
          console.error(`Error processing new story ${storyId}:`, error.message);
          continue;
        }
      }
      
      if (articles.length > 0) {
        await this.saveArticles(articles);
        console.log(`Saved ${articles.length} new Hacker News articles`);
      }
      
      return articles;
      
    } catch (error) {
      console.error('Error scraping Hacker News new stories:', error);
      throw error;
    }
  }

  isAIRelated(title, text) {
    const content = `${title} ${text || ''}`.toLowerCase();
    
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
      'neural network', 'computer vision', 'nlp', 'natural language processing',
      'reinforcement learning', 'transformer', 'bert', 'gpt', 'openai',
      'tensorflow', 'pytorch', 'keras', 'algorithm', 'model', 'dataset',
      'robotics', 'automation', 'chatbot', 'llm', 'large language model',
      'generative ai', 'diffusion', 'stable diffusion', 'midjourney'
    ];

    return aiKeywords.some(keyword => content.includes(keyword));
  }

  extractDescription(story) {
    if (story.text) {
      return this.truncateText(story.text, 300);
    }
    
    // Try to infer description from URL domain
    if (story.url) {
      const domain = new URL(story.url).hostname;
      return `Article from ${domain}`;
    }
    
    return story.title;
  }

  extractTags(story) {
    const tags = ['hackernews', 'tech-news'];
    
    const title = story.title.toLowerCase();
    
    // Extract technology-specific tags
    const techTags = [
      'python', 'javascript', 'react', 'tensorflow', 'pytorch',
      'github', 'open source', 'startup', 'research', 'paper',
      'tutorial', 'framework', 'library', 'api', 'cloud'
    ];

    techTags.forEach(tag => {
      if (title.includes(tag)) {
        tags.push(tag.replace(/\s+/g, '-'));
      }
    });

    // Add domain-based tags
    if (story.url) {
      try {
        const domain = new URL(story.url).hostname;
        if (domain.includes('github.com')) tags.push('github', 'open-source');
        if (domain.includes('arxiv.org')) tags.push('arxiv', 'research');
        if (domain.includes('youtube.com')) tags.push('video');
        if (domain.includes('medium.com')) tags.push('blog');
      } catch (error) {
        // Invalid URL, skip domain tags
      }
    }

    return [...new Set(tags)];
  }

  estimateReadingTime(title) {
    // For Hacker News, we only have the title, so estimate based on linked content type
    return 3; // Default 3 minutes for external articles
  }

  estimateDifficulty(title, url) {
    const text = title.toLowerCase();
    
    if (text.includes('beginner') || text.includes('intro') || text.includes('getting started')) {
      return 'beginner';
    }
    if (text.includes('advanced') || text.includes('deep dive') || text.includes('research')) {
      return 'advanced';
    }
    if (text.includes('expert') || text.includes('cutting edge') || text.includes('breakthrough')) {
      return 'expert';
    }
    
    // Check URL for academic sources
    if (url && (url.includes('arxiv.org') || url.includes('research') || url.includes('paper'))) {
      return 'advanced';
    }
    
    return 'intermediate';
  }

  hasCodeContent(title, url) {
    const text = title.toLowerCase();
    const codeKeywords = ['github', 'code', 'implementation', 'library', 'framework', 'api'];
    
    if (codeKeywords.some(keyword => text.includes(keyword))) {
      return true;
    }
    
    if (url && url.includes('github.com')) {
      return true;
    }
    
    return false;
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
          continue; // Duplicate URL, skip
        }
        console.error('Error saving Hacker News article:', error.message);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new HackerNewsScraper();
