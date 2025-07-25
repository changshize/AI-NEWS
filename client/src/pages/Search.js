import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import api from '../services/api';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    source: searchParams.get('source') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch search results
  const { data: searchResults, isLoading, error } = useQuery(
    ['search', query, filters, page],
    () => api.searchArticles({
      q: query,
      ...filters,
      page,
      limit: 20
    }),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  // Fetch filter options
  const { data: filterOptions } = useQuery(
    'search-filters',
    () => api.getSearchFilters(),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl && queryFromUrl !== query) {
      setQuery(queryFromUrl);
    }
  }, [searchParams, query]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    setPage(1);
    updateURL({ q: newQuery, ...filters });
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setPage(1);
    updateURL({ q: query, ...newFilters });
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      source: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'relevance'
    };
    setFilters(clearedFilters);
    setPage(1);
    updateURL({ q: query, ...clearedFilters });
  };

  const updateURL = (params) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'relevance');

  return (
    <div className="search-page">
      <div className="container py-8">
        {/* Search Header */}
        <div className="search-header mb-8">
          <h1 className="text-3xl font-bold mb-4">Search AI News</h1>
          <div className="search-bar-container mb-4">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search articles, papers, projects..."
            />
          </div>
          
          {/* Filter Toggle */}
          <div className="filter-controls">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-outline ${showFilters ? 'active' : ''}`}
            >
              <FiFilter />
              Filters
              {hasActiveFilters && <span className="filter-badge">•</span>}
            </button>
            
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn btn-secondary">
                <FiX />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && filterOptions && (
          <div className="filters-panel mb-8">
            <div className="card">
              <div className="card-body">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Categories</option>
                      {filterOptions.categories?.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Source Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Source</label>
                    <select
                      value={filters.source}
                      onChange={(e) => handleFilterChange('source', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">All Sources</option>
                      {filterOptions.sources?.map((source) => (
                        <option key={source.value} value={source.value}>
                          {source.label} ({source.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium mb-2">From Date</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="popularity">Popularity</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="search-results">
          {!query ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Start Your Search</h2>
              <p className="text-gray-600">
                Enter keywords to search through thousands of AI articles, papers, and projects.
              </p>
            </div>
          ) : isLoading ? (
            <LoadingSpinner message="Searching..." />
          ) : error ? (
            <div className="error-message">
              <h3>Search Error</h3>
              <p>There was an error performing your search. Please try again.</p>
            </div>
          ) : searchResults?.articles?.length > 0 ? (
            <>
              {/* Results Info */}
              <div className="results-info mb-6">
                <p className="text-gray-600">
                  Found {searchResults.pagination.totalResults} results for "{query}"
                  {hasActiveFilters && ' with filters applied'}
                </p>
              </div>

              {/* Articles Grid */}
              <div className="articles-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {searchResults.articles.map((article) => (
                  <NewsCard key={article._id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {searchResults.pagination.totalPages > 1 && (
                <div className="pagination flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!searchResults.pagination.hasPrevPage}
                    className="btn btn-outline"
                  >
                    Previous
                  </button>
                  
                  <span className="flex items-center px-4">
                    Page {page} of {searchResults.pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!searchResults.pagination.hasNextPage}
                    className="btn btn-outline"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results text-center py-12">
              <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
              <p className="text-gray-600 mb-4">
                No articles found for "{query}". Try:
              </p>
              <ul className="text-gray-600 text-left max-w-md mx-auto">
                <li>• Using different keywords</li>
                <li>• Removing some filters</li>
                <li>• Checking your spelling</li>
                <li>• Using more general terms</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
