import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail, FiRss } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <div className="brand-icon">🤖</div>
              <h3 className="brand-name">AI Tech News</h3>
            </div>
            <p className="footer-description">
              Your comprehensive source for the latest AI technology news, 
              research papers, and open-source projects.
            </p>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="mailto:contact@aitechnews.com" aria-label="Email">
                <FiMail />
              </a>
              <a href="/rss" aria-label="RSS Feed">
                <FiRss />
              </a>
            </div>
          </div>

          {/* Categories Section */}
          <div className="footer-section">
            <h4 className="footer-title">Categories</h4>
            <ul className="footer-links">
              <li><Link to="/category/machine-learning">Machine Learning</Link></li>
              <li><Link to="/category/deep-learning">Deep Learning</Link></li>
              <li><Link to="/category/computer-vision">Computer Vision</Link></li>
              <li><Link to="/category/natural-language-processing">NLP</Link></li>
              <li><Link to="/category/robotics">Robotics</Link></li>
              <li><Link to="/category/open-source">Open Source</Link></li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="footer-section">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/favorites">Favorites</Link></li>
              <li><a href="/api/docs" target="_blank" rel="noopener noreferrer">API</a></li>
              <li><a href="/rss" target="_blank" rel="noopener noreferrer">RSS Feed</a></li>
            </ul>
          </div>

          {/* Sources Section */}
          <div className="footer-section">
            <h4 className="footer-title">Data Sources</h4>
            <ul className="footer-links">
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://arxiv.org" target="_blank" rel="noopener noreferrer">arXiv</a></li>
              <li><a href="https://reddit.com/r/MachineLearning" target="_blank" rel="noopener noreferrer">Reddit</a></li>
              <li><a href="https://news.ycombinator.com" target="_blank" rel="noopener noreferrer">Hacker News</a></li>
              <li><a href="https://ai.googleblog.com" target="_blank" rel="noopener noreferrer">Google AI Blog</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} AI Tech News. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
