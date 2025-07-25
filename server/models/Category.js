const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true,
    default: '#3B82F6'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  articleCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for full hierarchy path
categorySchema.virtual('fullPath').get(function() {
  // This would need to be populated to work properly
  return this.parentCategory ? `${this.parentCategory.name}/${this.name}` : this.name;
});

// Static method to get main categories (no parent)
categorySchema.statics.getMainCategories = function() {
  return this.find({ 
    parentCategory: null, 
    isActive: true 
  }).sort({ sortOrder: 1, displayName: 1 });
};

// Static method to get category hierarchy
categorySchema.statics.getHierarchy = function() {
  return this.find({ isActive: true })
    .populate('subcategories')
    .sort({ sortOrder: 1, displayName: 1 });
};

// Method to get all articles in this category
categorySchema.methods.getArticles = function(limit = 20) {
  const Article = mongoose.model('Article');
  return Article.findByCategory(this.name, limit);
};

// Pre-save middleware to update article count
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    const Article = mongoose.model('Article');
    this.articleCount = await Article.countDocuments({ 
      categories: this.name,
      isActive: true 
    });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
