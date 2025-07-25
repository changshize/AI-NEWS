const axios = require('axios');
const xml2js = require('xml2js');
const Article = require('../../models/Article');
const categorizer = require('../categorizer');

class ArxivScraper {
  constructor() {
    this.baseURL = 'http://export.arxiv.org/api/query';
    this.parser = new xml2js.Parser();
  }

  async scrapeRecentPapers() {
    try {
      console.log('Scraping arXiv recent papers...');
      
      // AI-related categories on arXiv
      const categories = [
        'cs.AI',  // Artificial Intelligence
        'cs.LG',  // Machine Learning
        'cs.CV',  // Computer Vision
        'cs.CL',  // Computation and Language (NLP)
        'cs.NE',  // Neural and Evolutionary Computing
        'cs.RO',  // Robotics
        'stat.ML' // Machine Learning (Statistics)
      ];

      const articles = [];

      for (const category of categories) {
        try {
          // Get recent papers from the last 7 days
          const response = await axios.get(this.baseURL, {
            params: {
              search_query: `cat:${category}`,
              start: 0,
              max_results: 20,
              sortBy: 'submittedDate',
              sortOrder: 'descending'
            }
          });

          const result = await this.parser.parseStringPromise(response.data);
          const entries = result.feed.entry || [];

          for (const entry of entries) {
            // Check if article already exists
            const arxivId = this.extractArxivId(entry.id[0]);
            const url = `https://arxiv.org/abs/${arxivId}`;
            
            const existingArticle = await Article.findOne({ url });
            if (existingArticle) continue;

            // Parse paper data
            const title = entry.title[0].replace(/\s+/g, ' ').trim();
            const summary = entry.summary[0].replace(/\s+/g, ' ').trim();
            const authors = this.parseAuthors(entry.author);
            const publishedDate = new Date(entry.published[0]);
            const updatedDate = new Date(entry.updated[0]);

            // Extract categories and tags
            const paperCategories = await categorizer.categorizeContent(`${title} ${summary}`);
            const tags = this.extractTags(entry, category);

            const article = {
              title,
              description: this.truncateDescription(summary),
              content: summary,
              url,
              source: {
                name: 'arXiv',
                url: 'https://arxiv.org',
                type: 'arxiv'
              },
              author: {
                name: authors.join(', '),
                url: null
              },
              publishedAt: publishedDate,
              categories: paperCategories,
              tags,
              popularity: {
                score: this.calculatePopularityScore(publishedDate, updatedDate)
              },
              metadata: {
                language: 'en',
                readingTime: this.estimateReadingTime(summary),
                difficulty: 'advanced',
                isPaper: true,
                hasCode: this.hasCodeAvailable(summary)
              }
            };

            articles.push(article);
          }

          // Rate limiting
          await this.delay(1000);

        } catch (error) {
          console.error(`Error scraping arXiv category ${category}:`, error.message);
          continue;
        }
      }

      // Save articles to database
      if (articles.length > 0) {
        await this.saveArticles(articles);
        console.log(`Saved ${articles.length} arXiv papers`);
      }

      return articles;

    } catch (error) {
      console.error('Error scraping arXiv:', error);
      throw error;
    }
  }

  extractArxivId(idString) {
    // Extract arXiv ID from the full ID string
    const match = idString.match(/arxiv\.org\/abs\/(.+)$/);
    return match ? match[1] : idString;
  }

  parseAuthors(authorArray) {
    if (!authorArray) return ['Unknown'];
    
    return authorArray.map(author => {
      if (typeof author === 'string') return author;
      if (author.name && author.name[0]) return author.name[0];
      return 'Unknown';
    }).filter(name => name !== 'Unknown').slice(0, 5); // Limit to first 5 authors
  }

  extractTags(entry, category) {
    const tags = ['research', 'paper', 'arxiv'];
    
    // Add category-specific tags
    const categoryTags = {
      'cs.AI': ['artificial-intelligence', 'ai'],
      'cs.LG': ['machine-learning', 'ml'],
      'cs.CV': ['computer-vision', 'cv'],
      'cs.CL': ['natural-language-processing', 'nlp'],
      'cs.NE': ['neural-networks', 'evolutionary-computing'],
      'cs.RO': ['robotics'],
      'stat.ML': ['statistics', 'machine-learning']
    };
    
    if (categoryTags[category]) {
      tags.push(...categoryTags[category]);
    }

    // Extract additional tags from title and summary
    const text = `${entry.title[0]} ${entry.summary[0]}`.toLowerCase();
    
    const keywordTags = [
      'deep learning', 'neural network', 'transformer', 'attention',
      'reinforcement learning', 'supervised learning', 'unsupervised learning',
      'gan', 'cnn', 'rnn', 'lstm', 'bert', 'gpt', 'diffusion',
      'classification', 'regression', 'clustering', 'optimization'
    ];

    keywordTags.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword.replace(/\s+/g, '-'));
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  truncateDescription(text, maxLength = 500) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  estimateReadingTime(text) {
    // Estimate reading time based on word count (average 200 words per minute)
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / 200));
  }

  hasCodeAvailable(summary) {
    const codeKeywords = [
      'code', 'implementation', 'github', 'repository', 'open source',
      'algorithm', 'method', 'approach', 'framework', 'library'
    ];
    
    const text = summary.toLowerCase();
    return codeKeywords.some(keyword => text.includes(keyword));
  }

  calculatePopularityScore(publishedDate, updatedDate) {
    // Calculate score based on recency and update frequency
    const now = new Date();
    const daysSincePublished = (now - publishedDate) / (1000 * 60 * 60 * 24);
    const daysSinceUpdated = (now - updatedDate) / (1000 * 60 * 60 * 24);
    
    // Newer papers get higher scores
    const recencyScore = Math.max(0, 100 - daysSincePublished);
    
    // Papers that were updated recently get a bonus
    const updateBonus = publishedDate.getTime() !== updatedDate.getTime() ? 10 : 0;
    
    return Math.round(recencyScore + updateBonus);
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
        console.error('Error saving arXiv article:', error.message);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new ArxivScraper();
