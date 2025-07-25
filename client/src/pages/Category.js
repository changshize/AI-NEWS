import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Category = () => {
  const { categoryName } = useParams();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('publishedAt');

  // Fetch category details
  const { data: categoryData, isLoading: categoryLoading } = useQuery(
    ['category', categoryName],
    () => api.getCategory(categoryName),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
    }
  );

  // Fetch category articles
  const { data: articlesData, isLoading: articlesLoading } = useQuery(
    ['category-articles', categoryName, page, sortBy],
    () => api.getCategoryArticles(categoryName, {
      page,
      limit: 20,
      sortBy,
      sortOrder: 'desc'
    }),
    {
      keepPreviousData: true,
    }
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  if (categoryLoading) {
    return <LoadingSpinner message="Loading category..." />;
  }

  if (!categoryData?.category) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-gray-600">
            The category "{categoryName}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  const category = categoryData.category;

  return (
    <div className="category-page">
      <div className="container py-8">
        {/* Category Header */}
        <div className="category-header mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="category-icon text-4xl">
              {category.icon || '📁'}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{category.displayName}</h1>
              <p className="text-gray-600 text-lg">
                {category.articleCount || 0} articles
              </p>
            </div>
          </div>
          
          {category.description && (
            <p className="text-lg text-gray-700 max-w-3xl">
              {category.description}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="controls mb-6">
          <div className="flex justify-between items-center">
            <div className="sort-controls">
              <label className="text-sm font-medium text-gray-700 mr-3">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="publishedAt">Latest</option>
                <option value="popularity.score">Most Popular</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
            
            {articlesData?.pagination && (
              <div className="results-info text-sm text-gray-600">
                Showing {((articlesData.pagination.currentPage - 1) * 20) + 1}-
                {Math.min(
                  articlesData.pagination.currentPage * 20,
                  articlesData.pagination.totalArticles
                )} of {articlesData.pagination.totalArticles} articles
              </div>
            )}
          </div>
        </div>

        {/* Articles */}
        <div className="articles-section">
          {articlesLoading ? (
            <LoadingSpinner message="Loading articles..." />
          ) : articlesData?.articles?.length > 0 ? (
            <>
              <div className="articles-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {articlesData.articles.map((article) => (
                  <NewsCard key={article._id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {articlesData.pagination.totalPages > 1 && (
                <div className="pagination">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!articlesData.pagination.hasPrevPage}
                      className="btn btn-outline"
                    >
                      Previous
                    </button>
                    
                    <div className="page-info">
                      <span className="text-sm text-gray-600">
                        Page {page} of {articlesData.pagination.totalPages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!articlesData.pagination.hasNextPage}
                      className="btn btn-outline"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-articles text-center py-12">
              <h3 className="text-xl font-semibold mb-4">No Articles Found</h3>
              <p className="text-gray-600">
                No articles are currently available in this category. 
                Check back later for new content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
