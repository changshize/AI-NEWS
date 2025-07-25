const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  content: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  source: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['github', 'arxiv', 'reddit', 'hackernews', 'rss', 'blog', 'other'],
      default: 'other'
    }
  },
  author: {
    name: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    }
  },
  categories: [{
    type: String,
    enum: [
      'machine-learning',
      'deep-learning',
      'computer-vision',
      'natural-language-processing',
      'robotics',
      'reinforcement-learning',
      'ai-tools',
      'research-papers',
      'industry-news',
      'open-source',
      'datasets',
      'tutorials',
      'conferences',
      'other'
    ]
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  publishedAt: {
    type: Date,
    required: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  popularity: {
    score: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    stars: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    language: {
      type: String,
      default: 'en'
    },
    readingTime: {
      type: Number, // in minutes
      default: 0
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    isOpenSource: {
      type: Boolean,
      default: false
    },
    hasCode: {
      type: Boolean,
      default: false
    },
    isPaper: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ categories: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ 'source.type': 1 });
articleSchema.index({ 'popularity.score': -1 });
articleSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for formatted publish date
articleSchema.virtual('formattedDate').get(function() {
  return this.publishedAt.toLocaleDateString();
});

// Virtual for relative time
articleSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.publishedAt;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Less than an hour ago';
});

// Static method to find trending articles
articleSchema.statics.findTrending = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'popularity.score': -1, publishedAt: -1 })
    .limit(limit);
};

// Static method to find recent articles
articleSchema.statics.findRecent = function(limit = 20) {
  return this.find({ isActive: true })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Static method to find by category
articleSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({ 
    categories: category, 
    isActive: true 
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Article', articleSchema);
