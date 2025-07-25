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
    { name: 'machine-learning', label: 'Machine Learning' },
    { name: 'deep-learning', label: 'Deep Learning' },
    { name: 'computer-vision', label: 'Computer Vision' },
    { name: 'natural-language-processing', label: 'NLP' },
    { name: 'robotics', label: 'Robotics' },
    { name: 'ai-tools', label: 'AI Tools' },
    { name: 'research-papers', label: 'Research' },
    { name: 'open-source', label: 'Open Source' }
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
              Trending
            </Link>
            <div className="nav-dropdown">
              <button className="nav-link dropdown-trigger">
                Categories
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
              Favorites
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
