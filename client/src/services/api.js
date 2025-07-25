import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// News API endpoints
export const newsAPI = {
  // Get all articles with pagination and filtering
  getArticles: (params = {}) => {
    return api.get('/news', { params });
  },

  // Get trending articles
  getTrending: (limit = 10) => {
    return api.get('/news/trending', { params: { limit } });
  },

  // Get recent articles
  getRecent: (limit = 20) => {
    return api.get('/news/recent', { params: { limit } });
  },

  // Get featured articles
  getFeatured: (limit = 5) => {
    return api.get('/news/featured', { params: { limit } });
  },

  // Get single article by ID
  getArticle: (id) => {
    return api.get(`/news/${id}`);
  },

  // Get articles by category
  getArticlesByCategory: (category, params = {}) => {
    return api.get(`/news/category/${category}`, { params });
  },

  // Get news statistics
  getStats: () => {
    return api.get('/news/stats/overview');
  },
};

// Categories API endpoints
export const categoriesAPI = {
  // Get all categories
  getCategories: (params = {}) => {
    return api.get('/categories', { params });
  },

  // Get single category
  getCategory: (name) => {
    return api.get(`/categories/${name}`);
  },

  // Get category articles
  getCategoryArticles: (name, params = {}) => {
    return api.get(`/categories/${name}/articles`, { params });
  },

  // Get category distribution stats
  getDistribution: () => {
    return api.get('/categories/stats/distribution');
  },
};

// Search API endpoints
export const searchAPI = {
  // Search articles
  search: (params) => {
    return api.get('/search', { params });
  },

  // Get search suggestions
  getSuggestions: (query) => {
    return api.get('/search/suggestions', { params: { q: query } });
  },

  // Get filter options
  getFilters: () => {
    return api.get('/search/filters');
  },

  // Get trending search terms
  getTrending: () => {
    return api.get('/search/trending');
  },
};

// User API endpoints
export const userAPI = {
  // Register new user
  register: (userData) => {
    return api.post('/users/register', userData);
  },

  // Login user
  login: (credentials) => {
    return api.post('/users/login', credentials);
  },

  // Get user profile
  getProfile: () => {
    return api.get('/users/profile');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData);
  },

  // Add article to favorites
  addToFavorites: (articleId, data = {}) => {
    return api.post(`/users/favorites/${articleId}`, data);
  },

  // Remove article from favorites
  removeFromFavorites: (articleId) => {
    return api.delete(`/users/favorites/${articleId}`);
  },

  // Get user favorites
  getFavorites: (params = {}) => {
    return api.get('/users/favorites', { params });
  },

  // Add to reading history
  addToReadingHistory: (articleId, data = {}) => {
    return api.post(`/users/reading-history/${articleId}`, data);
  },
};

// Convenience methods for common operations
const apiService = {
  // News methods
  getArticles: newsAPI.getArticles,
  getTrendingArticles: newsAPI.getTrending,
  getRecentArticles: newsAPI.getRecent,
  getFeaturedArticles: newsAPI.getFeatured,
  getArticle: newsAPI.getArticle,
  getArticlesByCategory: newsAPI.getArticlesByCategory,
  getNewsStats: newsAPI.getStats,

  // Categories methods
  getCategories: categoriesAPI.getCategories,
  getCategory: categoriesAPI.getCategory,
  getCategoryArticles: categoriesAPI.getCategoryArticles,
  getCategoryDistribution: categoriesAPI.getDistribution,

  // Search methods
  searchArticles: searchAPI.search,
  getSearchSuggestions: searchAPI.getSuggestions,
  getSearchFilters: searchAPI.getFilters,
  getTrendingSearchTerms: searchAPI.getTrending,

  // User methods
  register: userAPI.register,
  login: userAPI.login,
  getProfile: userAPI.getProfile,
  updateProfile: userAPI.updateProfile,
  addToFavorites: userAPI.addToFavorites,
  removeFromFavorites: userAPI.removeFromFavorites,
  getFavorites: userAPI.getFavorites,
  addToReadingHistory: userAPI.addToReadingHistory,

  // Auth helpers
  setAuthToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  removeAuthToken: () => {
    localStorage.removeItem('authToken');
  },

  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

export default apiService;
