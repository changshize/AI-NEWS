import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiClock, FiUser, FiTag, FiStar, FiEye } from 'react-icons/fi';
import moment from 'moment';
import './NewsCard.css';

const NewsCard = ({ article, showFavoriteButton = true }) => {
  const {
    _id,
    title,
    description,
    url,
    imageUrl,
    source,
    author,
    publishedAt,
    categories = [],
    tags = [],
    popularity = {},
    metadata = {}
  } = article;

  const formatDate = (date) => {
    return moment(date).fromNow();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'machine-learning': '#3B82F6',
      'deep-learning': '#8B5CF6',
      'computer-vision': '#10B981',
      'natural-language-processing': '#F59E0B',
      'robotics': '#EF4444',
      'reinforcement-learning': '#06B6D4',
      'ai-tools': '#84CC16',
      'research-papers': '#6366F1',
      'industry-news': '#EC4899',
      'open-source': '#14B8A6',
      'datasets': '#F97316',
      'tutorials': '#8B5CF6',
      'conferences': '#DC2626',
      'other': '#6B7280'
    };
    return colors[category] || colors.other;
  };

  const getSourceIcon = (sourceType) => {
    const icons = {
      github: '🐙',
      arxiv: '📄',
      reddit: '🤖',
      hackernews: '🔶',
      rss: '📡',
      blog: '📝'
    };
    return icons[sourceType] || '🌐';
  };

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement favorite functionality
    console.log('Add to favorites:', _id);
  };

  return (
    <article className="news-card">
      {/* Image */}
      {imageUrl && (
        <div className="news-card-image">
          <img src={imageUrl} alt={title} loading="lazy" />
          {metadata.isOpenSource && (
            <div className="open-source-badge">
              <span>Open Source</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="news-card-content">
        {/* Header */}
        <div className="news-card-header">
          <div className="source-info">
            <span className="source-icon">{getSourceIcon(source.type)}</span>
            <span className="source-name">{source.name}</span>
            <span className="publish-date">
              <FiClock className="icon" />
              {formatDate(publishedAt)}
            </span>
          </div>
          
          {showFavoriteButton && (
            <button
              onClick={handleFavorite}
              className="favorite-button"
              aria-label="Add to favorites"
            >
              <FiStar />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="news-card-title">
          <Link to={`/article/${_id}`} className="title-link">
            {title}
          </Link>
        </h3>

        {/* Description */}
        {description && (
          <p className="news-card-description">
            {description}
          </p>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="categories">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category}
                to={`/category/${category}`}
                className="category-tag"
                style={{ backgroundColor: getCategoryColor(category) }}
              >
                {category.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="tags">
            <FiTag className="tags-icon" />
            <div className="tags-list">
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
              {tags.length > 4 && (
                <span className="tag-more">+{tags.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="news-card-footer">
          <div className="article-meta">
            {author.name && (
              <span className="author">
                <FiUser className="icon" />
                {author.name}
              </span>
            )}
            
            {metadata.readingTime && (
              <span className="reading-time">
                <FiClock className="icon" />
                {metadata.readingTime} min read
              </span>
            )}

            {popularity.views > 0 && (
              <span className="views">
                <FiEye className="icon" />
                {popularity.views}
              </span>
            )}
          </div>

          <div className="article-actions">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="external-link"
              aria-label="Open original article"
            >
              <FiExternalLink />
            </a>
          </div>
        </div>

        {/* Difficulty Badge */}
        {metadata.difficulty && (
          <div className={`difficulty-badge difficulty-${metadata.difficulty}`}>
            {metadata.difficulty}
          </div>
        )}
      </div>
    </article>
  );
};

export default NewsCard;
