import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiHeart, FiTrendingUp } from 'react-icons/fi';
import SearchBar from './SearchBar';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  };

  const categories = [
    { name: 'machine-learning', label: '机器学习' },
    { name: 'deep-learning', label: '深度学习' },
    { name: 'computer-vision', label: '计算机视觉' },
    { name: 'natural-language-processing', label: '自然语言处理' },
    { name: 'robotics', label: '机器人技术' },
    { name: 'ai-tools', label: 'AI工具' },
    { name: 'research-papers', label: '研究论文' },
    { name: 'open-source', label: '开源项目' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Brand */}
        <div className="header-brand">
          <Link to="/" className="brand-link">
            <div className="brand-icon">🤖</div>
            <div className="brand-text">
              <h1 className="brand-title">AI科技资讯</h1>
              <p className="brand-subtitle">最新人工智能技术动态</p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <FiTrendingUp className="nav-icon" />
              热门
            </Link>
            <div className="nav-dropdown">
              <button className="nav-link dropdown-trigger">
                分类
                <span className="dropdown-arrow">▼</span>
              </button>
              <div className="dropdown-menu">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={`/category/${category.name}`}
                    className="dropdown-item"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/favorites" className="nav-link">
              <FiHeart className="nav-icon" />
              收藏
            </Link>
          </div>
        </nav>

        {/* Search and Mobile Menu */}
        <div className="header-actions">
          {/* Desktop Search */}
          <div className="desktop-search">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Mobile Search Toggle */}
          <button
            className="mobile-search-toggle"
            onClick={toggleSearch}
            aria-label="Toggle search"
          >
            <FiSearch />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="mobile-search">
          <div className="mobile-search-container">
            <SearchBar onSearch={handleSearch} autoFocus />
            <button
              className="mobile-search-close"
              onClick={toggleSearch}
              aria-label="Close search"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <Link
              to="/"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiTrendingUp className="nav-icon" />
              Trending
            </Link>
            
            <div className="mobile-nav-section">
              <h3 className="mobile-nav-title">Categories</h3>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/category/${category.name}`}
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.label}
                </Link>
              ))}
            </div>

            <Link
              to="/favorites"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <FiHeart className="nav-icon" />
              Favorites
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
