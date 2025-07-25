import React from 'react';
import { FiFilter } from 'react-icons/fi';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const handleCategoryChange = (event) => {
    onCategoryChange(event.target.value);
  };

  return (
    <div className="category-filter">
      <div className="filter-label">
        <FiFilter className="filter-icon" />
        <span>Filter by Category:</span>
      </div>
      
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="category-select"
      >
        <option value="all">All Categories</option>
        {categories.map((category) => (
          <option key={category.name} value={category.name}>
            {category.displayName} ({category.articleCount || 0})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
