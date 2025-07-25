import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import api from '../services/api';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Favorites = () => {
  const [page, setPage] = useState(1);

  // Check if user is authenticated
  const isAuthenticated = api.isAuthenticated();

  // Fetch user favorites
  const { data: favoritesData, isLoading, refetch } = useQuery(
    ['favorites', page],
    () => api.getFavorites({ page, limit: 20 }),
    {
      enabled: isAuthenticated,
      keepPreviousData: true,
    }
  );

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveFavorite = async (articleId) => {
    try {
      await api.removeFromFavorites(articleId);
      refetch(); // Refresh the favorites list
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="favorites-page">
        <div className="container py-8">
          <div className="text-center">
            <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your Favorites</h1>
            <p className="text-gray-600 mb-6">
              Please log in to view and manage your favorite articles.
            </p>
            <button className="btn btn-primary">
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container py-8">
        {/* Header */}
        <div className="favorites-header mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiHeart className="text-3xl text-red-500" />
            <h1 className="text-4xl font-bold">Your Favorites</h1>
          </div>
          
          {favoritesData?.pagination && (
            <p className="text-gray-600">
              {favoritesData.pagination.totalFavorites} saved articles
            </p>
          )}
        </div>

        {/* Favorites Content */}
        <div className="favorites-content">
          {isLoading ? (
            <LoadingSpinner message="Loading your favorites..." />
          ) : favoritesData?.favorites?.length > 0 ? (
            <>
              {/* Favorites Grid */}
              <div className="favorites-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {favoritesData.favorites.map((favorite) => (
                  <div key={favorite._id} className="favorite-item relative">
                    <NewsCard 
                      article={favorite.article} 
                      showFavoriteButton={false}
                    />
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFavorite(favorite.article._id)}
                      className="remove-favorite absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Remove from favorites"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                    
                    {/* Favorite Meta */}
                    {(favorite.tags?.length > 0 || favorite.notes) && (
                      <div className="favorite-meta mt-4 p-4 bg-gray-50 rounded-lg">
                        {favorite.tags?.length > 0 && (
                          <div className="favorite-tags mb-2">
                            <span className="text-sm font-medium text-gray-700">Your tags:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {favorite.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {favorite.notes && (
                          <div className="favorite-notes">
                            <span className="text-sm font-medium text-gray-700">Your notes:</span>
                            <p className="text-sm text-gray-600 mt-1">{favorite.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {favoritesData.pagination.totalPages > 1 && (
                <div className="pagination">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!favoritesData.pagination.hasPrevPage}
                      className="btn btn-outline"
                    >
                      Previous
                    </button>
                    
                    <div className="page-info">
                      <span className="text-sm text-gray-600">
                        Page {page} of {favoritesData.pagination.totalPages}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!favoritesData.pagination.hasNextPage}
                      className="btn btn-outline"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-favorites text-center py-12">
              <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">No Favorites Yet</h3>
              <p className="text-gray-600 mb-6">
                Start building your collection by clicking the heart icon on articles you want to save.
              </p>
              <a href="/" className="btn btn-primary">
                Browse Articles
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
