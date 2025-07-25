const contentTranslator = require('../services/contentTranslator');

// 内容本地化中间件
const localizeContent = (req, res, next) => {
  // 保存原始的 res.json 方法
  const originalJson = res.json;
  
  // 重写 res.json 方法
  res.json = function(data) {
    try {
      // 检查是否需要本地化
      const shouldLocalize = req.headers['accept-language']?.includes('zh') || 
                           req.query.lang === 'zh' || 
                           true; // 默认为中文用户
      
      if (shouldLocalize && data) {
        data = localizeResponseData(data);
      }
      
      // 调用原始的 json 方法
      return originalJson.call(this, data);
    } catch (error) {
      console.error('Error in content localization:', error);
      return originalJson.call(this, data);
    }
  };
  
  next();
};

// 本地化响应数据
function localizeResponseData(data) {
  if (!data) return data;
  
  // 处理单篇文章
  if (data.article) {
    data.article = localizeArticle(data.article);
  }
  
  // 处理文章列表
  if (data.articles && Array.isArray(data.articles)) {
    data.articles = data.articles.map(article => localizeArticle(article));
  }
  
  // 处理分类信息
  if (data.categories && Array.isArray(data.categories)) {
    data.categories = data.categories.map(category => localizeCategory(category));
  }
  
  if (data.category) {
    data.category = localizeCategory(data.category);
  }
  
  // 处理搜索建议
  if (data.suggestions && Array.isArray(data.suggestions)) {
    data.suggestions = data.suggestions.map(suggestion => localizeSuggestion(suggestion));
  }
  
  return data;
}

// 本地化单篇文章
function localizeArticle(article) {
  if (!article) return article;
  
  try {
    const localized = { ...article };
    
    // 生成中文摘要
    localized.chineseSummary = contentTranslator.generateChineseSummary(
      article.title,
      article.description,
      article.content
    );
    
    // 翻译标签
    if (article.tags) {
      localized.chineseTags = contentTranslator.translateTags(article.tags);
    }
    
    // 翻译难度等级
    if (article.metadata?.difficulty) {
      localized.chineseDifficulty = contentTranslator.translateDifficulty(article.metadata.difficulty);
    }
    
    // 翻译来源类型
    if (article.source?.type) {
      localized.chineseSourceType = contentTranslator.translateSourceType(article.source.type);
    }
    
    // 翻译分类
    if (article.categories) {
      localized.chineseCategories = article.categories.map(cat => 
        getCategoryDisplayName(cat)
      );
    }
    
    return localized;
  } catch (error) {
    console.error('Error localizing article:', error);
    return article;
  }
}

// 本地化分类信息
function localizeCategory(category) {
  if (!category) return category;
  
  const localized = { ...category };
  
  // 确保使用中文显示名称
  const chineseNames = {
    'machine-learning': '机器学习',
    'deep-learning': '深度学习',
    'computer-vision': '计算机视觉',
    'natural-language-processing': '自然语言处理',
    'robotics': '机器人技术',
    'reinforcement-learning': '强化学习',
    'ai-tools': 'AI工具',
    'research-papers': '研究论文',
    'industry-news': '行业资讯',
    'open-source': '开源项目',
    'datasets': '数据集',
    'tutorials': '教程',
    'conferences': '会议',
    'other': '其他'
  };
  
  if (chineseNames[category.name]) {
    localized.displayName = chineseNames[category.name];
  }
  
  return localized;
}

// 本地化搜索建议
function localizeSuggestion(suggestion) {
  if (!suggestion) return suggestion;
  
  const localized = { ...suggestion };
  
  // 翻译建议类型
  const typeTranslations = {
    'title': '标题',
    'tag': '标签',
    'category': '分类'
  };
  
  if (typeTranslations[suggestion.type]) {
    localized.typeText = typeTranslations[suggestion.type];
  }
  
  // 如果是技术术语，尝试翻译
  if (suggestion.text) {
    localized.translatedText = contentTranslator.translateTechTerms(suggestion.text);
  }
  
  return localized;
}

// 获取分类的中文显示名称
function getCategoryDisplayName(categoryName) {
  const chineseNames = {
    'machine-learning': '机器学习',
    'deep-learning': '深度学习',
    'computer-vision': '计算机视觉',
    'natural-language-processing': '自然语言处理',
    'robotics': '机器人技术',
    'reinforcement-learning': '强化学习',
    'ai-tools': 'AI工具',
    'research-papers': '研究论文',
    'industry-news': '行业资讯',
    'open-source': '开源项目',
    'datasets': '数据集',
    'tutorials': '教程',
    'conferences': '会议',
    'other': '其他'
  };
  
  return chineseNames[categoryName] || categoryName;
}

module.exports = {
  localizeContent,
  localizeArticle,
  localizeCategory,
  getCategoryDisplayName
};
