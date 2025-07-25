const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Category = require('../models/Category');

// GET /api/news - Get all articles with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      source,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      featured,
      timeRange
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) {
      query.categories = category;
    }
    
    if (source) {
      query['source.type'] = source;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (timeRange) {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.publishedAt = { $gte: startDate };
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Article.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      articles,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalArticles: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
});

// GET /api/news/trending - Get trending articles
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const articles = await Article.findTrending(parseInt(limit));
    
    res.json({ articles });
  } catch (error) {
    console.error('Error fetching trending articles:', error);
    res.status(500).json({ message: 'Error fetching trending articles', error: error.message });
  }
});

// GET /api/news/recent - Get recent articles
router.get('/recent', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const articles = await Article.findRecent(parseInt(limit));
    
    res.json({ articles });
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    res.status(500).json({ message: 'Error fetching recent articles', error: error.message });
  }
});

// GET /api/news/featured - Get featured articles
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const articles = await Article.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .lean();
    
    res.json({ articles });
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    res.status(500).json({ message: 'Error fetching featured articles', error: error.message });
  }
});

// GET /api/news/:id - Get single article by ID
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).lean();
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    // Increment view count
    await Article.findByIdAndUpdate(req.params.id, {
      $inc: { 'popularity.views': 1 }
    });
    
    res.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Error fetching article', error: error.message });
  }
});

// GET /api/news/category/:category - Get articles by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { 
      page = 1, 
      limit = 20,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Verify category exists
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [articles, total] = await Promise.all([
      Article.findByCategory(category, parseInt(limit))
        .skip(skip)
        .sort(sort)
        .lean(),
      Article.countDocuments({ 
        categories: category, 
        isActive: true 
      })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      articles,
      category: categoryDoc,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalArticles: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching articles by category:', error);
    res.status(500).json({ message: 'Error fetching articles by category', error: error.message });
  }
});

// GET /api/news/stats/overview - Get news statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalArticles,
      todayArticles,
      weekArticles,
      categoryStats,
      sourceStats
    ] = await Promise.all([
      Article.countDocuments({ isActive: true }),
      Article.countDocuments({
        isActive: true,
        publishedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Article.countDocuments({
        isActive: true,
        publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Article.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$categories' },
        { $group: { _id: '$categories', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Article.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$source.type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      overview: {
        totalArticles,
        todayArticles,
        weekArticles
      },
      categories: categoryStats,
      sources: sourceStats
    });

  } catch (error) {
    console.error('Error fetching news statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

module.exports = router;
