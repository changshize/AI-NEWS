const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Article = require('../models/Article');

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const { includeCount = 'true', hierarchy = 'false' } = req.query;
    
    let categories;
    
    if (hierarchy === 'true') {
      // Get hierarchical structure
      categories = await Category.getHierarchy();
    } else {
      // Get flat list of main categories
      categories = await Category.getMainCategories();
    }
    
    // Include article counts if requested
    if (includeCount === 'true') {
      for (let category of categories) {
        const count = await Article.countDocuments({
          categories: category.name,
          isActive: true
        });
        category.articleCount = count;
      }
    }
    
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// GET /api/categories/:name - Get single category by name
router.get('/:name', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      name: req.params.name,
      isActive: true 
    }).populate('subcategories');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get article count
    const articleCount = await Article.countDocuments({
      categories: category.name,
      isActive: true
    });
    
    category.articleCount = articleCount;
    
    res.json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
});

// GET /api/categories/:name/articles - Get articles for a specific category
router.get('/:name/articles', async (req, res) => {
  try {
    const { name } = req.params;
    const { 
      page = 1, 
      limit = 20,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Verify category exists
    const category = await Category.findOne({ name, isActive: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [articles, total] = await Promise.all([
      Article.find({ 
        categories: name, 
        isActive: true 
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
      Article.countDocuments({ 
        categories: name, 
        isActive: true 
      })
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      articles,
      category,
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
    console.error('Error fetching category articles:', error);
    res.status(500).json({ message: 'Error fetching category articles', error: error.message });
  }
});

// GET /api/categories/stats/distribution - Get category distribution statistics
router.get('/stats/distribution', async (req, res) => {
  try {
    const distribution = await Article.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories',
          count: { $sum: 1 },
          latestArticle: { $max: '$publishedAt' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: 'name',
          as: 'categoryInfo'
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          latestArticle: 1,
          displayName: { $arrayElemAt: ['$categoryInfo.displayName', 0] },
          color: { $arrayElemAt: ['$categoryInfo.color', 0] }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ distribution });
  } catch (error) {
    console.error('Error fetching category distribution:', error);
    res.status(500).json({ message: 'Error fetching category distribution', error: error.message });
  }
});

module.exports = router;
