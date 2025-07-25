const cron = require('node-cron');
const githubScraper = require('./scrapers/githubScraper');
const arxivScraper = require('./scrapers/arxivScraper');
const redditScraper = require('./scrapers/redditScraper');
const hackerNewsScraper = require('./scrapers/hackerNewsScraper');
const rssParser = require('./rssParser');

class Scheduler {
  constructor() {
    this.isRunning = false;
    this.tasks = [];
  }

  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting content aggregation scheduler...');
    this.isRunning = true;

    // Schedule GitHub scraping every 2 hours
    const githubTask = cron.schedule('0 */2 * * *', async () => {
      console.log('Running GitHub scraper...');
      try {
        await githubScraper.scrapeTrendingRepositories();
      } catch (error) {
        console.error('GitHub scraper error:', error);
      }
    }, {
      scheduled: false
    });

    // Schedule arXiv scraping every 6 hours
    const arxivTask = cron.schedule('0 */6 * * *', async () => {
      console.log('Running arXiv scraper...');
      try {
        await arxivScraper.scrapeRecentPapers();
      } catch (error) {
        console.error('arXiv scraper error:', error);
      }
    }, {
      scheduled: false
    });

    // Schedule Reddit scraping every 4 hours
    const redditTask = cron.schedule('0 */4 * * *', async () => {
      console.log('Running Reddit scraper...');
      try {
        await redditScraper.scrapeAISubreddits();
      } catch (error) {
        console.error('Reddit scraper error:', error);
      }
    }, {
      scheduled: false
    });

    // Schedule Hacker News scraping every 3 hours
    const hackerNewsTask = cron.schedule('0 */3 * * *', async () => {
      console.log('Running Hacker News scraper...');
      try {
        await hackerNewsScraper.scrapeTopStories();
        await hackerNewsScraper.scrapeNewStories();
      } catch (error) {
        console.error('Hacker News scraper error:', error);
      }
    }, {
      scheduled: false
    });

    // Schedule RSS feed parsing every hour
    const rssTask = cron.schedule('0 * * * *', async () => {
      console.log('Running RSS parser...');
      try {
        await rssParser.parseAllFeeds();
      } catch (error) {
        console.error('RSS parser error:', error);
      }
    }, {
      scheduled: false
    });

    // Schedule comprehensive update every 12 hours
    const comprehensiveTask = cron.schedule('0 */12 * * *', async () => {
      console.log('Running comprehensive content update...');
      try {
        await this.runComprehensiveUpdate();
      } catch (error) {
        console.error('Comprehensive update error:', error);
      }
    }, {
      scheduled: false
    });

    // Store tasks for management
    this.tasks = [
      { name: 'github', task: githubTask },
      { name: 'arxiv', task: arxivTask },
      { name: 'reddit', task: redditTask },
      { name: 'hackernews', task: hackerNewsTask },
      { name: 'rss', task: rssTask },
      { name: 'comprehensive', task: comprehensiveTask }
    ];

    // Start all tasks
    this.tasks.forEach(({ name, task }) => {
      task.start();
      console.log(`Started ${name} scraping task`);
    });

    // Run initial scraping after a short delay
    setTimeout(() => {
      this.runInitialScraping();
    }, 5000);
  }

  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('Stopping content aggregation scheduler...');
    
    this.tasks.forEach(({ name, task }) => {
      task.stop();
      console.log(`Stopped ${name} scraping task`);
    });

    this.isRunning = false;
    this.tasks = [];
  }

  async runInitialScraping() {
    console.log('Running initial content scraping...');
    
    try {
      // Run all scrapers in parallel with delays to avoid overwhelming sources
      const scrapingPromises = [
        this.delayedExecution(() => githubScraper.scrapeTrendingRepositories(), 0),
        this.delayedExecution(() => arxivScraper.scrapeRecentPapers(), 2000),
        this.delayedExecution(() => redditScraper.scrapeAISubreddits(), 4000),
        this.delayedExecution(() => hackerNewsScraper.scrapeTopStories(), 6000),
        this.delayedExecution(() => rssParser.parseAllFeeds(), 8000)
      ];

      await Promise.allSettled(scrapingPromises);
      console.log('Initial content scraping completed');
      
    } catch (error) {
      console.error('Error during initial scraping:', error);
    }
  }

  async runComprehensiveUpdate() {
    console.log('Running comprehensive content update...');
    
    try {
      // Run all scrapers sequentially to avoid rate limiting
      await githubScraper.scrapeTrendingRepositories();
      await this.delay(5000);
      
      await arxivScraper.scrapeRecentPapers();
      await this.delay(5000);
      
      await redditScraper.scrapeAISubreddits();
      await this.delay(5000);
      
      await hackerNewsScraper.scrapeTopStories();
      await this.delay(3000);
      
      await hackerNewsScraper.scrapeNewStories();
      await this.delay(3000);
      
      await rssParser.parseAllFeeds();
      
      console.log('Comprehensive content update completed');
      
    } catch (error) {
      console.error('Error during comprehensive update:', error);
    }
  }

  async delayedExecution(fn, delay) {
    await this.delay(delay);
    return fn();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Manual trigger methods for testing
  async triggerGitHubScraping() {
    console.log('Manually triggering GitHub scraping...');
    try {
      return await githubScraper.scrapeTrendingRepositories();
    } catch (error) {
      console.error('Manual GitHub scraping error:', error);
      throw error;
    }
  }

  async triggerArxivScraping() {
    console.log('Manually triggering arXiv scraping...');
    try {
      return await arxivScraper.scrapeRecentPapers();
    } catch (error) {
      console.error('Manual arXiv scraping error:', error);
      throw error;
    }
  }

  async triggerRedditScraping() {
    console.log('Manually triggering Reddit scraping...');
    try {
      return await redditScraper.scrapeAISubreddits();
    } catch (error) {
      console.error('Manual Reddit scraping error:', error);
      throw error;
    }
  }

  async triggerHackerNewsScraping() {
    console.log('Manually triggering Hacker News scraping...');
    try {
      const [topStories, newStories] = await Promise.all([
        hackerNewsScraper.scrapeTopStories(),
        hackerNewsScraper.scrapeNewStories()
      ]);
      return [...topStories, ...newStories];
    } catch (error) {
      console.error('Manual Hacker News scraping error:', error);
      throw error;
    }
  }

  async triggerRSSParsing() {
    console.log('Manually triggering RSS parsing...');
    try {
      return await rssParser.parseAllFeeds();
    } catch (error) {
      console.error('Manual RSS parsing error:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: this.tasks.length,
      tasks: this.tasks.map(({ name, task }) => ({
        name,
        running: task.running
      }))
    };
  }
}

module.exports = new Scheduler();
