import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiExternalLink, FiClock, FiUser, FiTag, FiArrowLeft } from 'react-icons/fi';
import moment from 'moment';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Article = () => {
  const { articleId } = useParams();

  // Fetch article details
  const { data: articleData, isLoading, error } = useQuery(
    ['article', articleId],
    () => api.getArticle(articleId),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (error || !articleData?.article) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            The article you're looking for could not be found.
          </p>
          <Link to="/" className="btn btn-primary">
            <FiArrowLeft />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const article = articleData.article;

  return (
    <div className="article-page">
      <div className="container py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/" className="btn btn-outline">
            <FiArrowLeft />
            Back to Articles
          </Link>
        </div>

        {/* Article Header */}
        <article className="article-content">
          <header className="article-header mb-8">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            
            {/* Article Meta */}
            <div className="article-meta flex flex-wrap items-center gap-4 mb-6 text-gray-600">
              <div className="flex items-center gap-2">
                <span className="source-icon text-lg">
                  {article.source.type === 'github' && '🐙'}
                  {article.source.type === 'arxiv' && '📄'}
                  {article.source.type === 'reddit' && '🤖'}
                  {article.source.type === 'hackernews' && '🔶'}
                  {article.source.type === 'rss' && '📡'}
                  {article.source.type === 'blog' && '📝'}
                </span>
                <span className="font-medium">{article.source.name}</span>
              </div>
              
              {article.author?.name && (
                <div className="flex items-center gap-2">
                  <FiUser />
                  <span>{article.author.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <FiClock />
                <span>{moment(article.publishedAt).format('MMMM D, YYYY')}</span>
                <span className="text-sm">({moment(article.publishedAt).fromNow()})</span>
              </div>
              
              {article.metadata?.readingTime && (
                <div className="flex items-center gap-2">
                  <FiClock />
                  <span>{article.metadata.readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Categories */}
            {article.categories?.length > 0 && (
              <div className="categories mb-6">
                <div className="flex flex-wrap gap-2">
                  {article.categories.map((category) => (
                    <Link
                      key={category}
                      to={`/category/${category}`}
                      className="category-tag bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors"
                    >
                      {category.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* External Link */}
            <div className="external-link mb-6">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <FiExternalLink />
                View Original Article
              </a>
            </div>
          </header>

          {/* Article Image */}
          {article.imageUrl && (
            <div className="article-image mb-8">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Description/Content */}
          <div className="article-body mb-8">
            {article.description && (
              <div className="description bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-3">Summary</h2>
                <p className="text-gray-700 leading-relaxed">
                  {article.description}
                </p>
              </div>
            )}

            {article.content && article.content !== article.description && (
              <div className="content">
                <h2 className="text-xl font-semibold mb-3">Content</h2>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="tags mb-8">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FiTag />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Article Stats */}
          {article.popularity && (
            <div className="article-stats bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold mb-4">Article Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {article.popularity.views > 0 && (
                  <div className="stat">
                    <div className="stat-number text-2xl font-bold text-blue-600">
                      {article.popularity.views}
                    </div>
                    <div className="stat-label text-gray-600">Views</div>
                  </div>
                )}
                
                {article.popularity.likes > 0 && (
                  <div className="stat">
                    <div className="stat-number text-2xl font-bold text-red-600">
                      {article.popularity.likes}
                    </div>
                    <div className="stat-label text-gray-600">Likes</div>
                  </div>
                )}
                
                {article.popularity.comments > 0 && (
                  <div className="stat">
                    <div className="stat-number text-2xl font-bold text-green-600">
                      {article.popularity.comments}
                    </div>
                    <div className="stat-label text-gray-600">Comments</div>
                  </div>
                )}
                
                {article.popularity.stars > 0 && (
                  <div className="stat">
                    <div className="stat-number text-2xl font-bold text-yellow-600">
                      {article.popularity.stars}
                    </div>
                    <div className="stat-label text-gray-600">Stars</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          {article.metadata && (
            <div className="metadata bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {article.metadata.difficulty && (
                  <div>
                    <span className="font-medium">Difficulty:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      article.metadata.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      article.metadata.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      article.metadata.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {article.metadata.difficulty}
                    </span>
                  </div>
                )}
                
                {article.metadata.language && (
                  <div>
                    <span className="font-medium">Language:</span>
                    <span className="ml-2">{article.metadata.language.toUpperCase()}</span>
                  </div>
                )}
                
                {article.metadata.isOpenSource && (
                  <div>
                    <span className="font-medium">Open Source:</span>
                    <span className="ml-2 text-green-600">✓ Yes</span>
                  </div>
                )}
                
                {article.metadata.hasCode && (
                  <div>
                    <span className="font-medium">Includes Code:</span>
                    <span className="ml-2 text-blue-600">✓ Yes</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default Article;
