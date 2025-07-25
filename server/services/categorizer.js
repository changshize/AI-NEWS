class Categorizer {
  constructor() {
    // Define category keywords and patterns
    this.categoryKeywords = {
      'machine-learning': [
        'machine learning', 'ml', 'supervised learning', 'unsupervised learning',
        'classification', 'regression', 'clustering', 'feature engineering',
        'model training', 'prediction', 'algorithm', 'scikit-learn', 'sklearn'
      ],
      'deep-learning': [
        'deep learning', 'neural network', 'cnn', 'rnn', 'lstm', 'gru',
        'transformer', 'attention', 'backpropagation', 'gradient descent',
        'tensorflow', 'pytorch', 'keras', 'neural', 'layers', 'weights'
      ],
      'computer-vision': [
        'computer vision', 'cv', 'image recognition', 'object detection',
        'image classification', 'face recognition', 'opencv', 'yolo',
        'image processing', 'convolutional', 'segmentation', 'detection'
      ],
      'natural-language-processing': [
        'natural language processing', 'nlp', 'text processing', 'sentiment analysis',
        'language model', 'bert', 'gpt', 'transformer', 'tokenization',
        'text classification', 'named entity recognition', 'ner', 'chatbot',
        'language understanding', 'text generation', 'llm', 'large language model'
      ],
      'robotics': [
        'robotics', 'robot', 'autonomous', 'navigation', 'manipulation',
        'robot learning', 'robotic', 'automation', 'control systems',
        'path planning', 'slam', 'ros', 'robot operating system'
      ],
      'reinforcement-learning': [
        'reinforcement learning', 'rl', 'q-learning', 'policy gradient',
        'actor-critic', 'reward', 'environment', 'agent', 'markov decision process',
        'mdp', 'deep q-network', 'dqn', 'policy optimization'
      ],
      'ai-tools': [
        'framework', 'library', 'tool', 'platform', 'sdk', 'api',
        'development', 'deployment', 'mlops', 'model serving',
        'jupyter', 'notebook', 'pipeline', 'workflow'
      ],
      'research-papers': [
        'paper', 'research', 'study', 'arxiv', 'conference', 'journal',
        'publication', 'academic', 'experiment', 'methodology',
        'findings', 'results', 'analysis', 'survey'
      ],
      'industry-news': [
        'company', 'startup', 'funding', 'acquisition', 'product launch',
        'announcement', 'partnership', 'investment', 'business',
        'market', 'industry', 'commercial', 'enterprise'
      ],
      'open-source': [
        'open source', 'github', 'repository', 'code', 'implementation',
        'library', 'framework', 'contribution', 'community',
        'free', 'license', 'mit', 'apache', 'gpl'
      ],
      'datasets': [
        'dataset', 'data', 'benchmark', 'corpus', 'collection',
        'training data', 'test data', 'validation', 'samples',
        'annotations', 'labels', 'ground truth'
      ],
      'tutorials': [
        'tutorial', 'guide', 'how to', 'step by step', 'walkthrough',
        'introduction', 'beginner', 'learn', 'course', 'lesson',
        'example', 'demo', 'hands-on', 'practical'
      ],
      'conferences': [
        'conference', 'workshop', 'symposium', 'summit', 'meetup',
        'neurips', 'icml', 'iclr', 'aaai', 'ijcai', 'cvpr', 'acl',
        'event', 'presentation', 'talk', 'keynote'
      ]
    };
  }

  async categorizeContent(text) {
    if (!text || typeof text !== 'string') {
      return ['other'];
    }

    const normalizedText = text.toLowerCase();
    const categories = [];

    // Check each category for keyword matches
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      const score = this.calculateCategoryScore(normalizedText, keywords);
      
      if (score > 0) {
        categories.push({ category, score });
      }
    }

    // Sort by score and return top categories
    categories.sort((a, b) => b.score - a.score);
    
    // Return top 3 categories or 'other' if no matches
    const topCategories = categories.slice(0, 3).map(c => c.category);
    return topCategories.length > 0 ? topCategories : ['other'];
  }

  calculateCategoryScore(text, keywords) {
    let score = 0;
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        // Weight longer keywords more heavily
        const keywordWeight = keyword.split(' ').length;
        score += matches.length * keywordWeight;
      }
    }
    
    return score;
  }

  // Get category display information
  getCategoryInfo(categoryName) {
    const categoryInfo = {
      'machine-learning': {
        displayName: 'Machine Learning',
        description: 'General machine learning algorithms, techniques, and applications',
        icon: '🤖',
        color: '#3B82F6'
      },
      'deep-learning': {
        displayName: 'Deep Learning',
        description: 'Neural networks, deep learning architectures, and frameworks',
        icon: '🧠',
        color: '#8B5CF6'
      },
      'computer-vision': {
        displayName: 'Computer Vision',
        description: 'Image processing, object detection, and visual recognition',
        icon: '👁️',
        color: '#10B981'
      },
      'natural-language-processing': {
        displayName: 'Natural Language Processing',
        description: 'Text processing, language models, and conversational AI',
        icon: '💬',
        color: '#F59E0B'
      },
      'robotics': {
        displayName: 'Robotics',
        description: 'Robotic systems, automation, and autonomous agents',
        icon: '🤖',
        color: '#EF4444'
      },
      'reinforcement-learning': {
        displayName: 'Reinforcement Learning',
        description: 'Agent-based learning, reward systems, and decision making',
        icon: '🎯',
        color: '#06B6D4'
      },
      'ai-tools': {
        displayName: 'AI Tools & Frameworks',
        description: 'Development tools, libraries, and platforms for AI',
        icon: '🛠️',
        color: '#84CC16'
      },
      'research-papers': {
        displayName: 'Research Papers',
        description: 'Academic publications, studies, and research findings',
        icon: '📄',
        color: '#6366F1'
      },
      'industry-news': {
        displayName: 'Industry News',
        description: 'Business updates, product launches, and market trends',
        icon: '📈',
        color: '#EC4899'
      },
      'open-source': {
        displayName: 'Open Source',
        description: 'Open source projects, repositories, and community contributions',
        icon: '🔓',
        color: '#14B8A6'
      },
      'datasets': {
        displayName: 'Datasets',
        description: 'Training data, benchmarks, and data collections',
        icon: '📊',
        color: '#F97316'
      },
      'tutorials': {
        displayName: 'Tutorials',
        description: 'Learning resources, guides, and educational content',
        icon: '📚',
        color: '#8B5CF6'
      },
      'conferences': {
        displayName: 'Conferences',
        description: 'Academic conferences, workshops, and events',
        icon: '🎤',
        color: '#DC2626'
      },
      'other': {
        displayName: 'Other',
        description: 'Miscellaneous AI-related content',
        icon: '📝',
        color: '#6B7280'
      }
    };

    return categoryInfo[categoryName] || categoryInfo['other'];
  }

  // Get all available categories
  getAllCategories() {
    return Object.keys(this.categoryKeywords).map(category => ({
      name: category,
      ...this.getCategoryInfo(category)
    }));
  }

  // Suggest categories based on partial text
  suggestCategories(text, limit = 5) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const normalizedText = text.toLowerCase();
    const suggestions = [];

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      const score = this.calculateCategoryScore(normalizedText, keywords);
      
      if (score > 0) {
        suggestions.push({
          category,
          score,
          ...this.getCategoryInfo(category)
        });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = new Categorizer();
