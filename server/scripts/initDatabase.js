const mongoose = require('mongoose');
require('dotenv').config();

// Import all models to ensure they are registered
const Article = require('../models/Article');
const Category = require('../models/Category');
const User = require('../models/User');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-news-aggregator', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize categories
const initializeCategories = async () => {
  try {
    console.log('Initializing categories...');

    const categories = [
      {
        name: 'machine-learning',
        displayName: '机器学习',
        description: '机器学习算法、技术和应用，包括监督学习、无监督学习和半监督学习方法。',
        icon: '🤖',
        color: '#3B82F6',
        keywords: ['machine learning', 'ml', 'supervised learning', 'unsupervised learning', 'classification', 'regression', 'clustering', '机器学习', '监督学习', '无监督学习'],
        sortOrder: 1
      },
      {
        name: 'deep-learning',
        displayName: '深度学习',
        description: '神经网络、深度学习架构和框架，包括CNN、RNN、Transformer等。',
        icon: '🧠',
        color: '#8B5CF6',
        keywords: ['deep learning', 'neural network', 'cnn', 'rnn', 'lstm', 'transformer', 'attention', 'tensorflow', 'pytorch', '深度学习', '神经网络'],
        sortOrder: 2
      },
      {
        name: 'computer-vision',
        displayName: 'Computer Vision',
        description: 'Image processing, object detection, facial recognition, and visual recognition technologies.',
        icon: '👁️',
        color: '#10B981',
        keywords: ['computer vision', 'cv', 'image recognition', 'object detection', 'opencv', 'yolo', 'image processing'],
        sortOrder: 3
      },
      {
        name: 'natural-language-processing',
        displayName: 'Natural Language Processing',
        description: 'Text processing, language models, chatbots, and conversational AI technologies.',
        icon: '💬',
        color: '#F59E0B',
        keywords: ['natural language processing', 'nlp', 'text processing', 'language model', 'bert', 'gpt', 'chatbot', 'llm'],
        sortOrder: 4
      },
      {
        name: 'robotics',
        displayName: 'Robotics',
        description: 'Robotic systems, automation, autonomous agents, and human-robot interaction.',
        icon: '🤖',
        color: '#EF4444',
        keywords: ['robotics', 'robot', 'autonomous', 'automation', 'ros', 'manipulation', 'navigation'],
        sortOrder: 5
      },
      {
        name: 'reinforcement-learning',
        displayName: 'Reinforcement Learning',
        description: 'Agent-based learning, reward systems, decision making, and game AI.',
        icon: '🎯',
        color: '#06B6D4',
        keywords: ['reinforcement learning', 'rl', 'q-learning', 'policy gradient', 'agent', 'reward', 'dqn'],
        sortOrder: 6
      },
      {
        name: 'ai-tools',
        displayName: 'AI Tools & Frameworks',
        description: 'Development tools, libraries, platforms, and frameworks for AI development.',
        icon: '🛠️',
        color: '#84CC16',
        keywords: ['framework', 'library', 'tool', 'platform', 'sdk', 'api', 'mlops', 'jupyter'],
        sortOrder: 7
      },
      {
        name: 'research-papers',
        displayName: 'Research Papers',
        description: 'Academic publications, studies, research findings, and scientific papers.',
        icon: '📄',
        color: '#6366F1',
        keywords: ['paper', 'research', 'study', 'arxiv', 'conference', 'journal', 'academic'],
        sortOrder: 8
      },
      {
        name: 'industry-news',
        displayName: 'Industry News',
        description: 'Business updates, product launches, market trends, and industry developments.',
        icon: '📈',
        color: '#EC4899',
        keywords: ['company', 'startup', 'funding', 'product launch', 'business', 'industry', 'market'],
        sortOrder: 9
      },
      {
        name: 'open-source',
        displayName: 'Open Source',
        description: 'Open source projects, repositories, community contributions, and collaborative development.',
        icon: '🔓',
        color: '#14B8A6',
        keywords: ['open source', 'github', 'repository', 'community', 'contribution', 'license'],
        sortOrder: 10
      },
      {
        name: 'datasets',
        displayName: 'Datasets',
        description: 'Training data, benchmarks, data collections, and dataset releases.',
        icon: '📊',
        color: '#F97316',
        keywords: ['dataset', 'data', 'benchmark', 'corpus', 'training data', 'annotations'],
        sortOrder: 11
      },
      {
        name: 'tutorials',
        displayName: 'Tutorials',
        description: 'Learning resources, guides, educational content, and how-to articles.',
        icon: '📚',
        color: '#8B5CF6',
        keywords: ['tutorial', 'guide', 'how to', 'learn', 'course', 'education', 'beginner'],
        sortOrder: 12
      },
      {
        name: 'conferences',
        displayName: 'Conferences',
        description: 'Academic conferences, workshops, events, and symposiums.',
        icon: '🎤',
        color: '#DC2626',
        keywords: ['conference', 'workshop', 'event', 'neurips', 'icml', 'iclr', 'cvpr', 'acl'],
        sortOrder: 13
      },
      {
        name: 'other',
        displayName: 'Other',
        description: 'Miscellaneous AI-related content that doesn\'t fit into other categories.',
        icon: '📝',
        color: '#6B7280',
        keywords: ['other', 'miscellaneous', 'general'],
        sortOrder: 14
      }
    ];

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
      console.log(`Created category: ${category.displayName}`);
    }

    console.log('Categories initialized successfully');
    return categories.length;

  } catch (error) {
    console.error('Error initializing categories:', error);
    throw error;
  }
};

// Create indexes for better performance
const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');

    // Article indexes (already imported at top)
    
    await Article.collection.createIndex({ publishedAt: -1 });
    await Article.collection.createIndex({ categories: 1 });
    await Article.collection.createIndex({ tags: 1 });
    await Article.collection.createIndex({ 'source.type': 1 });
    await Article.collection.createIndex({ 'popularity.score': -1 });
    await Article.collection.createIndex({ url: 1 }, { unique: true });
    await Article.collection.createIndex({ 
      title: 'text', 
      description: 'text', 
      tags: 'text' 
    });

    // Category indexes
    await Category.collection.createIndex({ name: 1 }, { unique: true });
    await Category.collection.createIndex({ sortOrder: 1 });

    // User indexes (already imported at top)
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });

    console.log('Database indexes created successfully');

  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
};

// Main initialization function
const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    await connectDB();
    
    const categoriesCount = await initializeCategories();
    await createIndexes();
    
    console.log(`\n✅ Database initialization completed successfully!`);
    console.log(`📁 Created ${categoriesCount} categories`);
    console.log(`🔍 Database indexes created`);
    console.log(`🚀 Ready to start the application\n`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = {
  initializeDatabase,
  initializeCategories,
  createIndexes
};
