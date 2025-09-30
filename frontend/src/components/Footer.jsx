import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const location = useLocation();

  // Handle back to top click
  const handleBackToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  // Check if we should show back to top button
  useEffect(() => {
    const handleScroll = () => {
      // Show button only if user has scrolled down significantly
      const scrolled = window.scrollY > 300;
      
      // Only show on home page if scrolled, always show on other pages
      if (location.pathname === '/') {
        setShowBackToTop(scrolled);
      } else {
        setShowBackToTop(true);
      }
    };

    // Initial check
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <footer id="contact-section" className="site-footer">
      {/* Conditional Back to Top Button */}
      {showBackToTop && (
        <div className="back-to-top-container">
          <button onClick={handleBackToTop} className="back-to-top-btn">
            ↑ Back to Top
          </button>
        </div>
      )}

      <div className="footer-content">
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>PDT Kanpur</p>
          <p>(800) 555-5555</p>
          <p>PharmaCare@gmail.com</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Social Media</h4>
          <p>Facebook | Twitter | Instagram</p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2025 Team Pharma Care. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;