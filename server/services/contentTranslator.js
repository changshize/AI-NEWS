class ContentTranslator {
  constructor() {
    // 技术术语翻译映射
    this.techTerms = {
      // AI基础术语
      'artificial intelligence': '人工智能',
      'machine learning': '机器学习',
      'deep learning': '深度学习',
      'neural network': '神经网络',
      'algorithm': '算法',
      'model': '模型',
      'dataset': '数据集',
      'training': '训练',
      'inference': '推理',
      'prediction': '预测',
      
      // 深度学习术语
      'convolutional neural network': '卷积神经网络',
      'recurrent neural network': '循环神经网络',
      'transformer': '变换器',
      'attention mechanism': '注意力机制',
      'backpropagation': '反向传播',
      'gradient descent': '梯度下降',
      'overfitting': '过拟合',
      'underfitting': '欠拟合',
      'regularization': '正则化',
      'dropout': '丢弃法',
      
      // 计算机视觉
      'computer vision': '计算机视觉',
      'image recognition': '图像识别',
      'object detection': '目标检测',
      'image classification': '图像分类',
      'semantic segmentation': '语义分割',
      'face recognition': '人脸识别',
      'optical character recognition': '光学字符识别',
      
      // 自然语言处理
      'natural language processing': '自然语言处理',
      'text processing': '文本处理',
      'sentiment analysis': '情感分析',
      'language model': '语言模型',
      'large language model': '大语言模型',
      'tokenization': '分词',
      'named entity recognition': '命名实体识别',
      'machine translation': '机器翻译',
      'text generation': '文本生成',
      'chatbot': '聊天机器人',
      
      // 强化学习
      'reinforcement learning': '强化学习',
      'q-learning': 'Q学习',
      'policy gradient': '策略梯度',
      'actor-critic': '演员-评论家',
      'reward function': '奖励函数',
      'exploration': '探索',
      'exploitation': '利用',
      
      // 机器人技术
      'robotics': '机器人技术',
      'autonomous navigation': '自主导航',
      'path planning': '路径规划',
      'slam': '同步定位与建图',
      'manipulation': '机械臂操作',
      'human-robot interaction': '人机交互',
      
      // 框架和工具
      'tensorflow': 'TensorFlow',
      'pytorch': 'PyTorch',
      'keras': 'Keras',
      'scikit-learn': 'Scikit-learn',
      'opencv': 'OpenCV',
      'pandas': 'Pandas',
      'numpy': 'NumPy',
      'jupyter': 'Jupyter',
      
      // 研究相关
      'research paper': '研究论文',
      'conference': '会议',
      'journal': '期刊',
      'peer review': '同行评议',
      'benchmark': '基准测试',
      'state-of-the-art': '最先进的',
      'baseline': '基线',
      'evaluation': '评估',
      'metrics': '指标',
      
      // 开发相关
      'open source': '开源',
      'repository': '代码仓库',
      'framework': '框架',
      'library': '库',
      'api': '应用程序接口',
      'documentation': '文档',
      'tutorial': '教程',
      'implementation': '实现'
    };
  }

  // 翻译技术术语
  translateTechTerms(text) {
    if (!text || typeof text !== 'string') return text;
    
    let translatedText = text;
    
    // 按长度排序，优先匹配长词组
    const sortedTerms = Object.entries(this.techTerms)
      .sort(([a], [b]) => b.length - a.length);
    
    for (const [english, chinese] of sortedTerms) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, chinese);
    }
    
    return translatedText;
  }

  // 生成中文摘要
  generateChineseSummary(title, description, content) {
    try {
      // 合并所有文本内容
      const fullText = `${title || ''} ${description || ''} ${content || ''}`;
      
      // 翻译技术术语
      const translatedText = this.translateTechTerms(fullText);
      
      // 提取关键信息
      const summary = this.extractKeyInformation(translatedText, title, description);
      
      return summary;
    } catch (error) {
      console.error('Error generating Chinese summary:', error);
      return description || title || '暂无描述';
    }
  }

  // 提取关键信息
  extractKeyInformation(text, originalTitle, originalDescription) {
    // 如果原始描述较短且包含中文，直接使用
    if (originalDescription && originalDescription.length < 200 && /[\u4e00-\u9fff]/.test(originalDescription)) {
      return originalDescription;
    }

    // 基于关键词提取和简化
    const keyPhrases = this.extractKeyPhrases(text);
    const translatedTitle = this.translateTechTerms(originalTitle || '');
    
    // 构建摘要
    let summary = '';
    
    if (keyPhrases.length > 0) {
      summary = `${translatedTitle}。`;
      
      // 添加主要技术点
      const techPoints = keyPhrases.slice(0, 3).join('、');
      if (techPoints) {
        summary += `主要涉及${techPoints}等技术。`;
      }
      
      // 添加应用场景或目标
      const applications = this.extractApplications(text);
      if (applications) {
        summary += `${applications}`;
      }
    } else {
      // 回退到简单翻译
      summary = this.translateTechTerms(originalDescription || originalTitle || '');
    }
    
    // 限制长度
    return summary.length > 300 ? summary.substring(0, 300) + '...' : summary;
  }

  // 提取关键短语
  extractKeyPhrases(text) {
    const phrases = [];
    const lowerText = text.toLowerCase();
    
    // 检查常见的AI技术模式
    const patterns = [
      /(\w+)\s*(neural network|网络)/gi,
      /(\w+)\s*(learning|学习)/gi,
      /(\w+)\s*(algorithm|算法)/gi,
      /(\w+)\s*(model|模型)/gi,
      /(\w+)\s*(detection|检测)/gi,
      /(\w+)\s*(recognition|识别)/gi,
      /(\w+)\s*(processing|处理)/gi,
      /(\w+)\s*(generation|生成)/gi
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim().toLowerCase();
          if (cleaned.length > 3 && !phrases.includes(cleaned)) {
            phrases.push(this.translateTechTerms(cleaned));
          }
        });
      }
    });
    
    return phrases.slice(0, 5);
  }

  // 提取应用场景
  extractApplications(text) {
    const applications = [];
    const lowerText = text.toLowerCase();
    
    // 常见应用场景关键词
    const appPatterns = [
      { pattern: /autonomous|self-driving|自动驾驶/, app: '自动驾驶' },
      { pattern: /medical|healthcare|医疗/, app: '医疗健康' },
      { pattern: /finance|financial|金融/, app: '金融科技' },
      { pattern: /education|educational|教育/, app: '教育科技' },
      { pattern: /security|surveillance|安全/, app: '安全监控' },
      { pattern: /recommendation|推荐/, app: '推荐系统' },
      { pattern: /translation|翻译/, app: '机器翻译' },
      { pattern: /gaming|game|游戏/, app: '游戏AI' },
      { pattern: /robotics|robot|机器人/, app: '机器人应用' },
      { pattern: /speech|voice|语音/, app: '语音技术' }
    ];
    
    appPatterns.forEach(({ pattern, app }) => {
      if (pattern.test(lowerText)) {
        applications.push(app);
      }
    });
    
    if (applications.length > 0) {
      return `适用于${applications.slice(0, 2).join('、')}等领域。`;
    }
    
    return '';
  }

  // 翻译标签
  translateTags(tags) {
    if (!Array.isArray(tags)) return [];
    
    return tags.map(tag => {
      // 如果已经是中文，保持不变
      if (/[\u4e00-\u9fff]/.test(tag)) {
        return tag;
      }
      
      // 翻译技术术语
      const translated = this.translateTechTerms(tag);
      
      // 如果没有翻译变化，保留原文
      return translated === tag ? tag : translated;
    });
  }

  // 翻译难度等级
  translateDifficulty(difficulty) {
    const difficultyMap = {
      'beginner': '入门',
      'intermediate': '中级',
      'advanced': '高级',
      'expert': '专家'
    };
    
    return difficultyMap[difficulty] || difficulty;
  }

  // 翻译来源类型
  translateSourceType(sourceType) {
    const sourceMap = {
      'github': 'GitHub开源',
      'arxiv': 'arXiv论文',
      'reddit': 'Reddit社区',
      'hackernews': 'Hacker News',
      'rss': '技术博客',
      'blog': '技术博客'
    };
    
    return sourceMap[sourceType] || sourceType;
  }

  // 处理文章内容的完整翻译
  processArticleContent(article) {
    try {
      const processed = { ...article };
      
      // 生成中文摘要
      processed.chineseSummary = this.generateChineseSummary(
        article.title,
        article.description,
        article.content
      );
      
      // 翻译标签
      if (article.tags) {
        processed.chineseTags = this.translateTags(article.tags);
      }
      
      // 翻译难度等级
      if (article.metadata?.difficulty) {
        processed.chineseDifficulty = this.translateDifficulty(article.metadata.difficulty);
      }
      
      // 翻译来源类型
      if (article.source?.type) {
        processed.chineseSourceType = this.translateSourceType(article.source.type);
      }
      
      return processed;
    } catch (error) {
      console.error('Error processing article content:', error);
      return article;
    }
  }
}

module.exports = new ContentTranslator();
