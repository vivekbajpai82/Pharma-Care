import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      <header className="about-header">
        <div className="logo">
          <img src="/logo.jpg" alt="Pharma Care Logo"/>
          <span>Pharma Care</span>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about" className="active">About Us</Link>
          <a href="/#contact-section">Contact Us</a>
          <Link to="/login">Sign up/Log in</Link>
        </nav>
      </header>

      <main className="about-content">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1>About Pharma Care</h1>
            <p className="hero-subtitle">Revolutionizing healthcare through digital prescriptions</p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="container">
            <div className="mission-content">
              <h2>Our Mission</h2>
              <p>
                At Pharma Care, we're committed to eliminating the confusion and risks associated with 
                illegible handwritten prescriptions. Our digital prescription platform ensures that 
                every medication instruction is clear, accurate, and easily accessible to both patients 
                and pharmacies.
              </p>
            </div>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="problem-solution">
          <div className="container">
            <div className="content-grid">
              <div className="problem-card">
                <h3>The Problem</h3>
                <ul>
                  <li>Illegible handwritten prescriptions</li>
                  <li>Medication errors due to unclear instructions</li>
                  <li>Time wasted deciphering doctor's handwriting</li>
                  <li>Patient safety concerns</li>
                  <li>Inefficient pharmacy operations</li>
                </ul>
              </div>
              <div className="solution-card">
                <h3>Our Solution</h3>
                <ul>
                  <li>Clear, digital prescription generation</li>
                  <li>Standardized medication instructions</li>
                  <li>Instant prescription sharing via email</li>
                  <li>Secure patient data management</li>
                  <li>Streamlined doctor-patient workflow</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features Highlight */}
        <section className="features-section">
          <div className="container">
            <h2>Why Choose Pharma Care?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📋</div>
                <h4>Digital Prescriptions</h4>
                <p>Generate clear, professional digital prescriptions with comprehensive patient information and medication details.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📧</div>
                <h4>Email Integration</h4>
                <p>Send prescriptions directly to patients or pharmacies via email with PDF attachments for easy reference.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💊</div>
                <h4>Medicine Database</h4>
                <p>Access to comprehensive medicine database with dosage information and category-wise organization.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h4>Prescription History</h4>
                <p>Maintain complete prescription history with frequent medicine tracking for improved patient care.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👨‍⚕️</div>
                <h4>Doctor Profiles</h4>
                <p>Personalized doctor profiles with specialization details and hospital affiliation information.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h4>Secure Platform</h4>
                <p>HIPAA-compliant security measures to protect sensitive medical information and patient privacy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="impact-section">
          <div className="container">
            <h2>Making Healthcare Safer</h2>
            <div className="impact-stats">
              <div className="stat-card">
                <h3>99.9%</h3>
                <p>Prescription Accuracy</p>
              </div>
              <div className="stat-card">
                <h3>50%</h3>
                <p>Time Saved</p>
              </div>
              <div className="stat-card">
                <h3>Zero</h3>
                <p>Handwriting Errors</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="vision-section">
          <div className="container">
            <div className="vision-content">
              <h2>Our Vision</h2>
              <p>
                We envision a future where every prescription is crystal clear, every medication 
                instruction is perfectly understood, and healthcare professionals can focus on what 
                matters most - caring for their patients. Through technology and innovation, we're 
                building a safer, more efficient healthcare system for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Transform Your Practice?</h2>
            <p>Join thousands of healthcare professionals who trust Pharma Care for their digital prescription needs.</p>
            <Link to="/login">
              <button className="cta-button">Get Started Today</button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;