const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Category = require('../models/Category');

// GET /api/search - Search articles
router.get('/', async (req, res) => {
  try {
    const {
      q, // search query
      category,
      source,
      dateFrom,
      dateTo,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Build search query
    const searchQuery = {
      $and: [
        { isActive: true },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } },
            { 'author.name': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };

    // Add filters
    if (category) {
      searchQuery.$and.push({ categories: category });
    }

    if (source) {
      searchQuery.$and.push({ 'source.type': source });
    }

    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);
      searchQuery.$and.push({ publishedAt: dateFilter });
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'date':
        sort = { publishedAt: -1 };
        break;
      case 'popularity':
        sort = { 'popularity.score': -1, publishedAt: -1 };
        break;
      case 'relevance':
      default:
        // For relevance, we'll use text score if available, otherwise date
        sort = { publishedAt: -1 };
        break;
    }

    // Execute search with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [articles, total] = await Promise.all([
      Article.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Article.countDocuments(searchQuery)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      articles,
      searchQuery: q,
      filters: {
        category,
        source,
        dateFrom,
        dateTo
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ message: 'Error searching articles', error: error.message });
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get suggestions from article titles and tags
    const [titleSuggestions, tagSuggestions] = await Promise.all([
      Article.find({
        title: { $regex: q, $options: 'i' },
        isActive: true
      })
      .select('title')
      .limit(5)
      .lean(),
      
      Article.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$tags' },
        { $match: { tags: { $regex: q, $options: 'i' } } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const suggestions = [
      ...titleSuggestions.map(article => ({
        type: 'title',
        text: article.title,
        value: article.title
      })),
      ...tagSuggestions.map(tag => ({
        type: 'tag',
        text: tag._id,
        value: tag._id
      }))
    ];

    res.json({ suggestions: suggestions.slice(0, 10) });

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ message: 'Error getting suggestions', error: error.message });
  }
});

// GET /api/search/filters - Get available filter options
router.get('/filters', async (req, res) => {
  try {
    const [categories, sources] = await Promise.all([
      Category.find({ isActive: true })
        .select('name displayName')
        .sort({ displayName: 1 })
        .lean(),
      
      Article.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$source.type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      categories: categories.map(cat => ({
        value: cat.name,
        label: cat.displayName
      })),
      sources: sources.map(source => ({
        value: source._id,
        label: source._id.charAt(0).toUpperCase() + source._id.slice(1),
        count: source.count
      }))
    });

  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ message: 'Error getting filter options', error: error.message });
  }
});

// GET /api/search/trending - Get trending search terms
router.get('/trending', async (req, res) => {
  try {
    // Get most common tags from recent articles (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const trendingTerms = await Article.aggregate([
      {
        $match: {
          isActive: true,
          publishedAt: { $gte: weekAgo }
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          latestDate: { $max: '$publishedAt' }
        }
      },
      { $match: { count: { $gte: 2 } } }, // Only terms that appear at least twice
      { $sort: { count: -1, latestDate: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      trending: trendingTerms.map(term => ({
        term: term._id,
        count: term.count,
        latestDate: term.latestDate
      }))
    });

  } catch (error) {
    console.error('Error getting trending terms:', error);
    res.status(500).json({ message: 'Error getting trending terms', error: error.message });
  }
});

module.exports = router;
