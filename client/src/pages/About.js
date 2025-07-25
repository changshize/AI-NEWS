import React from 'react';
import { FiGithub, FiDatabase, FiRefreshCw, FiSearch, FiHeart } from 'react-icons/fi';

const About = () => {
  return (
    <div className="about-page">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About AI Tech News</h1>
            <p className="text-xl text-gray-600">
              Your comprehensive source for the latest AI technology news and research
            </p>
          </div>

          {/* Mission */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-lg leading-relaxed mb-4">
                AI Tech News is dedicated to providing developers, researchers, and AI enthusiasts 
                with the most up-to-date information about artificial intelligence breakthroughs, 
                open-source projects, and industry developments.
              </p>
              <p className="text-lg leading-relaxed">
                We aggregate content from trusted sources to help you stay informed about the 
                rapidly evolving AI landscape, with a special focus on open-source projects 
                that enable innovation and collaboration.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">Key Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <FiRefreshCw className="text-3xl text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Real-time Updates</h3>
                <p className="text-gray-600">
                  Automated content aggregation every 30 minutes ensures you never miss 
                  important AI developments.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <FiDatabase className="text-3xl text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Multiple Sources</h3>
                <p className="text-gray-600">
                  Content from GitHub, arXiv, Reddit, Hacker News, and leading AI blogs 
                  in one convenient location.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <FiSearch className="text-3xl text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Smart Categorization</h3>
                <p className="text-gray-600">
                  Intelligent content categorization helps you find exactly what you're 
                  looking for in machine learning, NLP, computer vision, and more.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <FiGithub className="text-3xl text-gray-700 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Open Source Focus</h3>
                <p className="text-gray-600">
                  Special emphasis on open-source projects to facilitate learning, 
                  contribution, and innovation.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <FiHeart className="text-3xl text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Personalization</h3>
                <p className="text-gray-600">
                  Save your favorite articles and customize your feed based on your 
                  interests and preferences.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <FiSearch className="text-3xl text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Advanced Search</h3>
                <p className="text-gray-600">
                  Powerful search functionality with filters by category, source, 
                  date, and difficulty level.
                </p>
              </div>
            </div>
          </section>

          {/* Data Sources */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">Data Sources</h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-lg mb-6">
                We aggregate content from the following trusted sources:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Research & Academia</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• arXiv - Latest research papers</li>
                    <li>• Google AI Blog</li>
                    <li>• OpenAI Blog</li>
                    <li>• DeepMind Blog</li>
                    <li>• MIT Technology Review</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Community & Development</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• GitHub Trending</li>
                    <li>• Reddit AI Communities</li>
                    <li>• Hacker News</li>
                    <li>• Towards Data Science</li>
                    <li>• The Gradient</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">Technology Stack</h2>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-3">Frontend</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• React.js with modern hooks</li>
                    <li>• React Query for data fetching</li>
                    <li>• Responsive CSS design</li>
                    <li>• Progressive Web App features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Backend</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Node.js with Express</li>
                    <li>• MongoDB for data storage</li>
                    <li>• Automated web scraping</li>
                    <li>• RESTful API design</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-3xl font-semibold mb-6">Get Involved</h2>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-lg mb-6">
                AI Tech News is an open-source project. We welcome contributions, 
                feedback, and suggestions from the community.
              </p>
              <div className="flex justify-center gap-4">
                <a 
                  href="https://github.com/your-repo/ai-news-aggregator" 
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiGithub className="mr-2" />
                  View on GitHub
                </a>
                <a href="mailto:contact@aitechnews.com" className="btn btn-secondary">
                  Contact Us
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
