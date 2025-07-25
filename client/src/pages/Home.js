import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiClock, FiStar, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryFilter from '../components/CategoryFilter';
import './Home.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch trending articles
  const { data: trendingData, isLoading: trendingLoading } = useQuery(
    'trending-articles',
    () => api.getTrendingArticles(12),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch recent articles
  const { data: recentData, isLoading: recentLoading } = useQuery(
    'recent-articles',
    () => api.getRecentArticles(12),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch featured articles
  const { data: featuredData, isLoading: featuredLoading } = useQuery(
    'featured-articles',
    () => api.getFeaturedArticles(6),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'categories',
    () => api.getCategories({ includeCount: true }),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Fetch news statistics
  const { data: statsData } = useQuery(
    'news-stats',
    () => api.getNewsStats(),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
    }
  );

  const getCurrentArticles = () => {
    switch (activeTab) {
      case 'trending':
        return trendingData?.articles || [];
      case 'recent':
        return recentData?.articles || [];
      case 'featured':
        return featuredData?.articles || [];
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'trending':
        return trendingLoading;
      case 'recent':
        return recentLoading;
      case 'featured':
        return featuredLoading;
      default:
        return false;
    }
  };

  const filterArticlesByCategory = (articles) => {
    if (selectedCategory === 'all') return articles;
    return articles.filter(article => 
      article.categories && article.categories.includes(selectedCategory)
    );
  };

  const filteredArticles = filterArticlesByCategory(getCurrentArticles());

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              获取最新AI技术资讯
            </h1>
            <p className="hero-description">
              发现前沿AI研究、开源项目和行业突破，汇聚GitHub、arXiv、Reddit等顶级资源。
            </p>
            
            {/* Stats */}
            {statsData && (
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">{statsData.overview?.totalArticles || 0}</span>
                  <span className="stat-label">总文章数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{statsData.overview?.todayArticles || 0}</span>
                  <span className="stat-label">今日新增</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{statsData.overview?.weekArticles || 0}</span>
                  <span className="stat-label">本周新增</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categoriesData?.categories && (
        <section className="categories-section">
          <div className="container">
            <h2 className="section-title">按分类浏览</h2>
            <div className="categories-grid">
              {categoriesData.categories.slice(0, 8).map((category) => (
                <Link
                  key={category.name}
                  to={`/category/${category.name}`}
                  className="category-card"
                >
                  <div className="category-icon">{category.icon || '📁'}</div>
                  <h3 className="category-name">{category.displayName}</h3>
                  <p className="category-count">{category.articleCount || 0} 篇文章</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="main-content-section">
        <div className="container">
          {/* Tab Navigation */}
          <div className="content-header">
            <div className="tab-navigation">
              <button
                className={`tab-button ${activeTab === 'trending' ? 'active' : ''}`}
                onClick={() => setActiveTab('trending')}
              >
                <FiTrendingUp className="tab-icon" />
                热门
              </button>
              <button
                className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveTab('recent')}
              >
                <FiClock className="tab-icon" />
                最新
              </button>
              <button
                className={`tab-button ${activeTab === 'featured' ? 'active' : ''}`}
                onClick={() => setActiveTab('featured')}
              >
                <FiStar className="tab-icon" />
                精选
              </button>
            </div>

            {/* Category Filter */}
            <CategoryFilter
              categories={categoriesData?.categories || []}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Articles Grid */}
          <div className="articles-section">
            {getCurrentLoading() ? (
              <LoadingSpinner />
            ) : filteredArticles.length > 0 ? (
              <>
                <div className="articles-grid">
                  {filteredArticles.map((article) => (
                    <NewsCard key={article._id} article={article} />
                  ))}
                </div>
                
                {/* View More Button */}
                <div className="view-more-section">
                  <Link to="/search" className="btn btn-primary btn-lg">
                    View More Articles
                    <FiArrowRight />
                  </Link>
                </div>
              </>
            ) : (
              <div className="no-articles">
                <h3>No articles found</h3>
                <p>Try selecting a different category or check back later for new content.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
