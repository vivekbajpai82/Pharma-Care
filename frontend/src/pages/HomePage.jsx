import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  // Handle home button click with visual feedback
  const handleHomeClick = () => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Brief visual feedback (optional)
    const button = document.querySelector('.home-link');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }
  };

  // Handle contact us click with smooth scroll and header visibility
  const handleContactClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Scroll to contact section
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <div className="logo">
          <img src="/logo.jpg" alt="Pharma Care Logo"/>
          <span>Pharma Care</span>
        </div>
        <nav>
          <Link 
            to="/" 
            className="home-link"
            onClick={handleHomeClick}
          >
            Home
          </Link>
          <Link to="/about">About Us</Link>
          <a 
            href="#contact-section" 
            onClick={handleContactClick}
          >
            Contact Us
          </a>
          <Link to="/login">Sign up/Log in</Link>
        </nav>
      </header>

      <main className="hero-section">
        <h1>Digital Prescriptions</h1>
        <p>Say goodbye to illegible prescriptions and hello to clear and precise digital prescriptions!</p>
        <Link to="/login">
          <button className="learn-more-btn">Get Started</button>
        </Link>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;