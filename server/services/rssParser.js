const Parser = require('rss-parser');
const Article = require('../models/Article');
const categorizer = require('./categorizer');

class RSSParser {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['media:content', 'media:thumbnail', 'enclosure']
      }
    });
    
    // Define RSS feeds to parse
    this.feeds = [
      {
        name: 'Google AI Blog',
        url: 'https://ai.googleblog.com/feeds/posts/default',
        source: 'Google AI',
        type: 'blog'
      },
      {
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss.xml',
        source: 'OpenAI',
        type: 'blog'
      },
      {
        name: 'DeepMind Blog',
        url: 'https://deepmind.com/blog/feed/basic/',
        source: 'DeepMind',
        type: 'blog'
      },
      {
        name: 'MIT Technology Review AI',
        url: 'https://www.technologyreview.com/feed/',
        source: 'MIT Technology Review',
        type: 'blog'
      },
      {
        name: 'VentureBeat AI',
        url: 'https://venturebeat.com/ai/feed/',
        source: 'VentureBeat',
        type: 'blog'
      },
      {
        name: 'Towards Data Science',
        url: 'https://towardsdatascience.com/feed',
        source: 'Towards Data Science',
        type: 'blog'
      },
      {
        name: 'The Gradient',
        url: 'https://thegradient.pub/rss/',
        source: 'The Gradient',
        type: 'blog'
      },
      {
        name: 'Distill',
        url: 'https://distill.pub/rss.xml',
        source: 'Distill',
        type: 'blog'
      },
      {
        name: 'AI News',
        url: 'https://artificialintelligence-news.com/feed/',
        source: 'AI News',
        type: 'blog'
      },
      {
        name: 'Machine Learning Mastery',
        url: 'https://machinelearningmastery.com/feed/',
        source: 'Machine Learning Mastery',
        type: 'blog'
      }
    ];
  }

  async parseAllFeeds() {
    console.log('Parsing all RSS feeds...');
    
    const allArticles = [];
    
    for (const feed of this.feeds) {
      try {
        console.log(`Parsing feed: ${feed.name}`);
        const articles = await this.parseFeed(feed);
        allArticles.push(...articles);
        
        // Rate limiting between feeds
        await this.delay(2000);
        
      } catch (error) {
        console.error(`Error parsing feed ${feed.name}:`, error.message);
        continue;
      }
    }
    
    if (allArticles.length > 0) {
      await this.saveArticles(allArticles);
      console.log(`Saved ${allArticles.length} RSS articles`);
    }
    
    return allArticles;
  }

  async parseFeed(feedConfig) {
    try {
      const feed = await this.parser.parseURL(feedConfig.url);
      const articles = [];
      
      for (const item of feed.items.slice(0, 20)) { // Limit to 20 most recent items
        // Check if article already exists
        const existingArticle = await Article.findOne({ url: item.link });
        if (existingArticle) continue;
        
        // Filter for AI-related content
        if (!this.isAIRelated(item.title, item.contentSnippet || item.content)) continue;
        
        const article = {
          title: this.cleanTitle(item.title),
          description: this.extractDescription(item),
          content: this.extractContent(item),
          url: item.link,
          source: {
            name: feedConfig.source,
            url: feedConfig.url,
            type: feedConfig.type
          },
          author: {
            name: this.extractAuthor(item),
            url: null
          },
          publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
          categories: await categorizer.categorizeContent(
            `${item.title} ${item.contentSnippet || item.content || ''}`
          ),
          tags: this.extractTags(item, feedConfig),
          popularity: {
            score: this.calculatePopularityScore(item, feedConfig)
          },
          metadata: {
            language: 'en',
            readingTime: this.estimateReadingTime(item.contentSnippet || item.content || ''),
            difficulty: this.estimateDifficulty(item.title, item.contentSnippet),
            hasCode: this.hasCodeContent(item.contentSnippet || item.content || '')
          },
          imageUrl: this.extractImageUrl(item)
        };
        
        articles.push(article);
      }
      
      return articles;
      
    } catch (error) {
      console.error(`Error parsing feed ${feedConfig.name}:`, error);
      return [];
    }
  }

  isAIRelated(title, content) {
    const text = `${title} ${content || ''}`.toLowerCase();
    
    const aiKeywords = [
      'artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning',
      'neural network', 'computer vision', 'nlp', 'natural language processing',
      'reinforcement learning', 'transformer', 'bert', 'gpt', 'algorithm',
      'model', 'dataset', 'tensorflow', 'pytorch', 'robotics', 'automation',
      'chatbot', 'generative', 'diffusion', 'llm', 'large language model'
    ];

    return aiKeywords.some(keyword => text.includes(keyword));
  }

  cleanTitle(title) {
    if (!title) return 'Untitled';
    
    // Remove HTML tags and clean up whitespace
    return title
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractDescription(item) {
    // Try different fields for description
    const description = item.contentSnippet || 
                       item.summary || 
                       item.description || 
                       item.content;
    
    if (!description) return '';
    
    // Clean HTML and truncate
    const cleaned = description
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return this.truncateText(cleaned, 500);
  }

  extractContent(item) {
    const content = item.content || 
                   item['content:encoded'] || 
                   item.description || 
                   item.summary;
    
    if (!content) return '';
    
    // Clean HTML but preserve some structure
    return content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  extractAuthor(item) {
    return item.creator || 
           item.author || 
           item['dc:creator'] || 
           'Unknown';
  }

  extractTags(item, feedConfig) {
    const tags = ['rss', 'blog'];
    
    // Add source-specific tags
    tags.push(feedConfig.source.toLowerCase().replace(/\s+/g, '-'));
    
    // Extract from categories
    if (item.categories) {
      item.categories.forEach(category => {
        if (typeof category === 'string') {
          tags.push(category.toLowerCase().replace(/\s+/g, '-'));
        } else if (category._ || category.name) {
          tags.push((category._ || category.name).toLowerCase().replace(/\s+/g, '-'));
        }
      });
    }
    
    // Extract from title and content
    const text = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
    
    const keywordTags = [
      'tutorial', 'research', 'paper', 'guide', 'introduction',
      'advanced', 'beginner', 'framework', 'library', 'tool',
      'python', 'javascript', 'tensorflow', 'pytorch'
    ];

    keywordTags.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return [...new Set(tags)]; // Remove duplicates
  }

  extractImageUrl(item) {
    // Try different fields for images
    if (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
      return item.enclosure.url;
    }
    
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
      return item['media:content'].$.url;
    }
    
    if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
      return item['media:thumbnail'].$.url;
    }
    
    // Extract from content
    if (item.content) {
      const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) {
        return imgMatch[1];
      }
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
    
    if (text.includes('beginner') || text.includes('introduction') || text.includes('getting started')) {
      return 'beginner';
    }
    if (text.includes('advanced') || text.includes('deep dive') || text.includes('research')) {
      return 'advanced';
    }
    if (text.includes('expert') || text.includes('cutting edge') || text.includes('state-of-the-art')) {
      return 'expert';
    }
    
    return 'intermediate';
  }

  hasCodeContent(text) {
    if (!text) return false;
    
    const codeIndicators = [
      'github', 'code', 'implementation', 'script', 'function',
      'import', 'def ', 'class ', 'return ', '```', 'repository'
    ];
    
    return codeIndicators.some(indicator => text.toLowerCase().includes(indicator));
  }

  calculatePopularityScore(item, feedConfig) {
    let score = 10; // Base score
    
    // Boost score for certain sources
    const sourceBoosts = {
      'Google AI': 20,
      'OpenAI': 20,
      'DeepMind': 20,
      'MIT Technology Review': 15,
      'Towards Data Science': 10
    };
    
    score += sourceBoosts[feedConfig.source] || 0;
    
    // Boost for recent articles
    const publishDate = new Date(item.pubDate || item.isoDate || Date.now());
    const daysSincePublished = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSincePublished < 1) score += 15;
    else if (daysSincePublished < 7) score += 10;
    else if (daysSincePublished < 30) score += 5;
    
    return Math.round(score);
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
        console.error('Error saving RSS article:', error.message);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new RSSParser();
