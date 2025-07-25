const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },
    avatar: {
      type: String,
      trim: true
    },
    interests: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  preferences: {
    categories: [{
      type: String,
      trim: true
    }],
    sources: [{
      type: String,
      trim: true
    }],
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: false
    },
    digestFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'weekly'
    }
  },
  favorites: [{
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    tags: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  }],
  readingHistory: [{
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    },
    readAt: {
      type: Date,
      default: Date.now
    },
    readingTime: {
      type: Number, // in seconds
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  lastLoginAt: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'preferences.categories': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual for favorite count
userSchema.virtual('favoriteCount').get(function() {
  return this.favorites.length;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      userId: this._id, 
      username: this.username,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Add article to favorites
userSchema.methods.addToFavorites = function(articleId, tags = [], notes = '') {
  const existingFavorite = this.favorites.find(
    fav => fav.article.toString() === articleId.toString()
  );
  
  if (!existingFavorite) {
    this.favorites.push({
      article: articleId,
      tags,
      notes
    });
  }
  
  return this.save();
};

// Remove article from favorites
userSchema.methods.removeFromFavorites = function(articleId) {
  this.favorites = this.favorites.filter(
    fav => fav.article.toString() !== articleId.toString()
  );
  
  return this.save();
};

// Add to reading history
userSchema.methods.addToReadingHistory = function(articleId, readingTime = 0) {
  // Remove existing entry if it exists
  this.readingHistory = this.readingHistory.filter(
    item => item.article.toString() !== articleId.toString()
  );
  
  // Add new entry at the beginning
  this.readingHistory.unshift({
    article: articleId,
    readingTime
  });
  
  // Keep only last 100 items
  if (this.readingHistory.length > 100) {
    this.readingHistory = this.readingHistory.slice(0, 100);
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
