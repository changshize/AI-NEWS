# AI Technology News Aggregation Website

A comprehensive AI technology news aggregation platform that automatically collects and categorizes AI breakthroughs, research papers, and open-source projects from multiple trusted sources.

## 📸 Live Demo Screenshots

### Homepage with Real Data
![Homepage](screenshots/ai-news-homepage-full.png)
*Homepage showing 303+ articles with statistics, categories, and trending AI projects*

### Category Page
![Category Page](screenshots/ai-news-category-page.png)
*Machine Learning category page with 62 articles and sorting options*

### Article Detail Page
![Article Detail](screenshots/ai-news-article-detail.png)
*Detailed view of an arXiv research paper with full metadata and content*

### Search Functionality
![Search Demo](screenshots/ai-news-search-demo.png)
*Real-time search with suggestions and filtering capabilities*

### Mobile Responsive Design
![Mobile View](screenshots/ai-news-mobile-homepage.png)
*Fully responsive design optimized for mobile devices*

## 📊 Live Data Collection Results

The system has successfully collected and categorized real AI content:

- **📄 140 arXiv Research Papers** - Latest AI/ML research from top conferences
- **🐙 100 GitHub Projects** - Trending AI repositories and tools
- **🔶 23 Hacker News Articles** - Community discussions on AI topics
- **📡 103 RSS Articles** - Content from leading AI blogs and publications
- **📈 Total: 366+ Articles** automatically categorized across 14 AI technology areas

*Data collected during initial system deployment - numbers grow continuously with automated updates every 30 minutes*

## 🚀 Features

### Core Functionality
- **Automated Content Collection**: Real-time aggregation from GitHub, arXiv, Reddit, Hacker News, and AI blogs
- **Smart Categorization**: AI-powered content categorization (ML, Deep Learning, Computer Vision, NLP, Robotics, etc.)
- **Real-time Updates**: Automated content refresh every 30 minutes
- **Source Attribution**: Clear citations and direct links to original content

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Advanced Search**: Full-text search with filters by category, source, date, and difficulty
- **Personalization**: User favorites and bookmarking system
- **Multiple Views**: Trending, recent, and featured article feeds

### Content Sources
- **GitHub**: Trending AI repositories and releases
- **arXiv**: Latest research papers in AI/ML
- **Reddit**: AI communities (r/MachineLearning, r/artificial, etc.)
- **Hacker News**: Tech discussions and AI-related posts
- **RSS Feeds**: Google AI Blog, OpenAI, DeepMind, MIT Tech Review, and more

## 🛠 Technology Stack

### Frontend
- **React.js** - Modern UI with hooks and functional components
- **React Query** - Efficient data fetching and caching
- **React Router** - Client-side routing
- **CSS3** - Responsive design with modern styling
- **React Icons** - Comprehensive icon library

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **MongoDB** - Document database for flexible data storage
- **Mongoose** - MongoDB object modeling

### Data Collection
- **Axios** - HTTP client for API requests
- **Cheerio** - Server-side HTML parsing
- **RSS Parser** - RSS feed processing
- **node-cron** - Scheduled task automation

### Security & Performance
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection
- **Compression** - Response compression

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-news-aggregator.git
   cd ai-news-aggregator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-news-aggregator

# Server
PORT=5000
NODE_ENV=development

# API Keys (Optional)
GITHUB_TOKEN=your_github_token
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret

# JWT (for user authentication)
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### API Keys Setup

While the application works without API keys, adding them improves rate limits and data quality:

1. **GitHub Token**: Create at https://github.com/settings/tokens
2. **Reddit API**: Register at https://www.reddit.com/prefs/apps

## 🔧 Development

### Project Structure
```
ai-news-aggregator/
├── server/                 # Backend application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   ├── scrapers/      # Data collection services
│   │   ├── categorizer.js # Content categorization
│   │   ├── scheduler.js   # Task scheduling
│   │   └── rssParser.js   # RSS feed processing
│   └── server.js          # Main server file
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API communication
│   │   └── App.js         # Main app component
│   └── public/            # Static assets
└── README.md
```

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Development
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only

# Production
npm run build        # Build frontend for production
npm start           # Start production server

# Individual package management
npm run install-server  # Install backend dependencies
npm run install-client  # Install frontend dependencies
```

### Adding New Data Sources

1. Create a new scraper in `server/services/scrapers/`
2. Implement the scraping logic following existing patterns
3. Add the scraper to the scheduler in `server/services/scheduler.js`
4. Update categorization rules if needed

Example scraper structure:
```javascript
class NewScraper {
  async scrapeContent() {
    // Implement scraping logic
    // Return array of article objects
  }
  
  async saveArticles(articles) {
    // Save to database
  }
}
```

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Setup

- **Database**: MongoDB Atlas or self-hosted MongoDB
- **Server**: Any Node.js hosting platform (Heroku, DigitalOcean, AWS, etc.)
- **CDN**: Optional for static assets

## 📊 API Documentation

### Endpoints

#### News
- `GET /api/news` - Get articles with pagination and filtering
- `GET /api/news/trending` - Get trending articles
- `GET /api/news/recent` - Get recent articles
- `GET /api/news/:id` - Get single article

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:name` - Get category details
- `GET /api/categories/:name/articles` - Get category articles

#### Search
- `GET /api/search` - Search articles
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/search/filters` - Get filter options

#### Users (Authentication required)
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/favorites` - Get user favorites
- `POST /api/users/favorites/:id` - Add to favorites

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure responsive design for UI changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Data sources: GitHub, arXiv, Reddit, Hacker News, and AI research blogs
- Open source libraries and frameworks used in this project
- AI/ML community for inspiration and feedback

## 📞 Support

- Create an issue for bug reports or feature requests
- Check existing issues before creating new ones
- Provide detailed information for faster resolution

---

**Built with ❤️ for the AI community**
