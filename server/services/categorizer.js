class Categorizer {
  constructor() {
    // Define category keywords and patterns (支持中英文关键词)
    this.categoryKeywords = {
      'machine-learning': [
        'machine learning', 'ml', 'supervised learning', 'unsupervised learning',
        'classification', 'regression', 'clustering', 'feature engineering',
        'model training', 'prediction', 'algorithm', 'scikit-learn', 'sklearn',
        '机器学习', '监督学习', '无监督学习', '分类', '回归', '聚类', '特征工程',
        '模型训练', '预测', '算法', '机器学习算法'
      ],
      'deep-learning': [
        'deep learning', 'neural network', 'cnn', 'rnn', 'lstm', 'gru',
        'transformer', 'attention', 'backpropagation', 'gradient descent',
        'tensorflow', 'pytorch', 'keras', 'neural', 'layers', 'weights',
        '深度学习', '神经网络', '卷积神经网络', '循环神经网络', '长短期记忆',
        '变换器', '注意力机制', '反向传播', '梯度下降', '神经元', '权重'
      ],
      'computer-vision': [
        'computer vision', 'cv', 'image recognition', 'object detection',
        'image classification', 'face recognition', 'opencv', 'yolo',
        'image processing', 'convolutional', 'segmentation', 'detection',
        '计算机视觉', '图像识别', '目标检测', '图像分类', '人脸识别',
        '图像处理', '卷积', '图像分割', '物体检测', '视觉识别'
      ],
      'natural-language-processing': [
        'natural language processing', 'nlp', 'text processing', 'sentiment analysis',
        'language model', 'bert', 'gpt', 'transformer', 'tokenization',
        'text classification', 'named entity recognition', 'ner', 'chatbot',
        'language understanding', 'text generation', 'llm', 'large language model',
        '自然语言处理', '文本处理', '情感分析', '语言模型', '文本分类',
        '命名实体识别', '聊天机器人', '语言理解', '文本生成', '大语言模型'
      ],
      'robotics': [
        'robotics', 'robot', 'autonomous', 'navigation', 'manipulation',
        'robot learning', 'robotic', 'automation', 'control systems',
        'path planning', 'slam', 'ros', 'robot operating system',
        '机器人', '机器人技术', '自主导航', '机械臂', '机器人学习',
        '自动化', '控制系统', '路径规划', '机器人操作系统'
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
        displayName: '机器学习',
        description: '机器学习算法、技术和应用，包括监督学习、无监督学习等',
        icon: '🤖',
        color: '#3B82F6'
      },
      'deep-learning': {
        displayName: '深度学习',
        description: '神经网络、深度学习架构和框架，包括CNN、RNN、Transformer等',
        icon: '🧠',
        color: '#8B5CF6'
      },
      'computer-vision': {
        displayName: '计算机视觉',
        description: '图像处理、目标检测和视觉识别技术',
        icon: '👁️',
        color: '#10B981'
      },
      'natural-language-processing': {
        displayName: '自然语言处理',
        description: '文本处理、语言模型和对话AI技术',
        icon: '💬',
        color: '#F59E0B'
      },
      'robotics': {
        displayName: '机器人技术',
        description: '机器人系统、自动化和自主智能体',
        icon: '🤖',
        color: '#EF4444'
      },
      'reinforcement-learning': {
        displayName: '强化学习',
        description: '基于智能体的学习、奖励系统和决策制定',
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
