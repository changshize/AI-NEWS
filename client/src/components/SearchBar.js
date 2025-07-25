import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useQuery } from 'react-query';
import api from '../services/api';
import './SearchBar.css';

const SearchBar = ({ onSearch, autoFocus = false, placeholder = "搜索AI资讯..." }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch search suggestions
  const { data: suggestions = [] } = useQuery(
    ['search-suggestions', query],
    () => api.getSearchSuggestions(query),
    {
      enabled: query.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.value);
    onSearch(suggestion.value);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'title':
        return '📄';
      case 'tag':
        return '🏷️';
      case 'category':
        return '📁';
      default:
        return '🔍';
    }
  };

  const getSuggestionTypeText = (type) => {
    switch (type) {
      case 'title':
        return '标题';
      case 'tag':
        return '标签';
      case 'category':
        return '分类';
      default:
        return '搜索';
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <FiSearch className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(query.length >= 2)}
            placeholder={placeholder}
            className="search-input"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="search-clear"
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              <span className="suggestion-icon">
                {getSuggestionIcon(suggestion.type)}
              </span>
              <span className="suggestion-text">{suggestion.text}</span>
              <span className="suggestion-type">{getSuggestionTypeText(suggestion.type)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
