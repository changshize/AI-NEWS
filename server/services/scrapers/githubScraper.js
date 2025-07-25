const axios = require('axios');
const Article = require('../../models/Article');
const categorizer = require('../categorizer');
const contentTranslator = require('../contentTranslator');

class GitHubScraper {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-News-Aggregator/1.0.0'
    };
    
    // Add GitHub token if available
    if (process.env.GITHUB_TOKEN) {
      this.headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
  }

  async scrapeTrendingRepositories() {
    try {
      console.log('Scraping GitHub trending repositories...');
      
      // Get trending repositories for AI-related topics
      const topics = [
        'machine-learning',
        'artificial-intelligence',
        'deep-learning',
        'computer-vision',
        'natural-language-processing',
        'tensorflow',
        'pytorch',
        'neural-network',
        'data-science',
        'reinforcement-learning'
      ];

      const articles = [];

      for (const topic of topics) {
        try {
          // Search for repositories by topic
          const response = await axios.get(`${this.baseURL}/search/repositories`, {
            headers: this.headers,
            params: {
              q: `topic:${topic} stars:>100 pushed:>2024-01-01`,
              sort: 'updated',
              order: 'desc',
              per_page: 10
            }
          });

          for (const repo of response.data.items) {
            // Check if article already exists
            const existingArticle = await Article.findOne({ url: repo.html_url });
            if (existingArticle) continue;

            // Get additional repository details
            const repoDetails = await this.getRepositoryDetails(repo.full_name);
            
            const article = {
              title: repo.name,
              description: repo.description || 'No description available',
              url: repo.html_url,
              source: {
                name: 'GitHub',
                url: 'https://github.com',
                type: 'github'
              },
              author: {
                name: repo.owner.login,
                url: repo.owner.html_url
              },
              publishedAt: new Date(repo.created_at),
              categories: await categorizer.categorizeContent(
                `${repo.name} ${repo.description || ''} ${repo.topics?.join(' ') || ''}`
              ),
              tags: [
                ...repo.topics || [],
                repo.language,
                'open-source',
                'github'
              ].filter(Boolean),
              popularity: {
                stars: repo.stargazers_count,
                score: this.calculatePopularityScore(repo)
              },
              metadata: {
                language: repo.language,
                isOpenSource: true,
                hasCode: true,
                difficulty: this.estimateDifficulty(repo)
              },
              imageUrl: repo.owner.avatar_url
            };

            articles.push(article);
          }

          // Rate limiting - wait between requests
          await this.delay(1000);

        } catch (error) {
          console.error(`Error scraping topic ${topic}:`, error.message);
          continue;
        }
      }

      // Save articles to database
      if (articles.length > 0) {
        await this.saveArticles(articles);
        console.log(`Saved ${articles.length} GitHub articles`);
      }

      return articles;

    } catch (error) {
      console.error('Error scraping GitHub:', error);
      throw error;
    }
  }

  async getRepositoryDetails(fullName) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${fullName}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error(`Error getting repository details for ${fullName}:`, error.message);
      return null;
    }
  }

  calculatePopularityScore(repo) {
    // Calculate a popularity score based on various metrics
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const watchers = repo.watchers_count || 0;
    const issues = repo.open_issues_count || 0;
    
    // Recent activity bonus
    const lastUpdate = new Date(repo.updated_at);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    const recentActivityBonus = Math.max(0, 100 - daysSinceUpdate);
    
    return Math.round(
      (stars * 1.0) + 
      (forks * 0.5) + 
      (watchers * 0.3) + 
      (recentActivityBonus * 0.1) - 
      (issues * 0.1)
    );
  }

  estimateDifficulty(repo) {
    const description = (repo.description || '').toLowerCase();
    const topics = (repo.topics || []).join(' ').toLowerCase();
    const content = `${description} ${topics}`;
    
    if (content.includes('tutorial') || content.includes('beginner') || content.includes('intro')) {
      return 'beginner';
    }
    if (content.includes('advanced') || content.includes('research') || content.includes('paper')) {
      return 'advanced';
    }
    if (content.includes('expert') || content.includes('phd') || content.includes('cutting-edge')) {
      return 'expert';
    }
    
    return 'intermediate';
  }

  async saveArticles(articles) {
    for (const articleData of articles) {
      try {
        // 处理中文内容
        const processedArticle = contentTranslator.processArticleContent(articleData);

        const article = new Article(processedArticle);
        await article.save();
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate URL, skip
          continue;
        }
        console.error('Error saving GitHub article:', error.message);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new GitHubScraper();
