const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /api/users/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName
      }
    });

    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// POST /api/users/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update login info
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('favorites.article', 'title url publishedAt categories')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, interests, preferences } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;
    if (interests !== undefined) user.profile.interests = interests;
    if (preferences !== undefined) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// POST /api/users/favorites/:articleId - Add article to favorites
router.post('/favorites/:articleId', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { tags, notes } = req.body;

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const user = await User.findById(req.user.userId);
    await user.addToFavorites(articleId, tags, notes);

    res.json({ message: 'Article added to favorites' });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
});

// DELETE /api/users/favorites/:articleId - Remove article from favorites
router.delete('/favorites/:articleId', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;

    const user = await User.findById(req.user.userId);
    await user.removeFromFavorites(articleId);

    res.json({ message: 'Article removed from favorites' });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
});

// GET /api/users/favorites - Get user's favorite articles
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(req.user.userId)
      .populate({
        path: 'favorites.article',
        select: 'title description url imageUrl publishedAt categories source author',
        options: {
          skip,
          limit: parseInt(limit),
          sort: { 'favorites.addedAt': -1 }
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalFavorites = user.favorites.length;
    const totalPages = Math.ceil(totalFavorites / parseInt(limit));

    res.json({
      favorites: user.favorites,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalFavorites,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

// POST /api/users/reading-history/:articleId - Add to reading history
router.post('/reading-history/:articleId', authenticateToken, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { readingTime } = req.body;

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const user = await User.findById(req.user.userId);
    await user.addToReadingHistory(articleId, readingTime);

    res.json({ message: 'Added to reading history' });

  } catch (error) {
    console.error('Error adding to reading history:', error);
    res.status(500).json({ message: 'Error adding to reading history', error: error.message });
  }
});

module.exports = router;
