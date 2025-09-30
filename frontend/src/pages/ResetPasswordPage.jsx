import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../config/api';
import './AuthPage.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setIsValidToken(false);
      setMessage('Invalid reset link. Please request a new password reset.');
      setMessageType('error');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    if (type === 'success') {
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      showMessage('Passwords do not match!', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showMessage('Password must be at least 6 characters long!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/api/reset-password/${token}`, {
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      showMessage('Password reset successful! Redirecting to login...', 'success');
      setFormData({ password: '', confirmPassword: '' });
      
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMsg = error.response?.data?.msg || 'Password reset failed. Please try again.';
      showMessage(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="auth-page-container">
        <Link to="/" className="back-to-home-link">
          <span className="back-arrow">←</span>
          Back to Home
        </Link>

        <div className="auth-card">
          <div className="panel left-panel">
            <div className="panel-content">
              <div className="medical-icon">
                <div className="stethoscope"></div>
              </div>
              <h2>Invalid Reset Link</h2>
              <p>This password reset link is invalid or has expired. Please request a new password reset.</p>
              <Link to="/login" className="panel-btn">
                Back to Login
              </Link>
            </div>
          </div>
          <div className="panel right-panel">
            <div className="form-container">
              <div className="form-header">
                <h2>⚠️ Link Expired</h2>
                <p>Please request a new password reset link</p>
              </div>
              <Link to="/login" className="form-btn">
                Go to Login Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <Link to="/" className="back-to-home-link">
        <span className="back-arrow">←</span>
        Back to Home
      </Link>

      {/* Message Display */}
      {message && (
        <div className={`message-container ${messageType}`}>
          <div className="message-content">
            <span className="message-icon">
              {messageType === 'success' ? '✓' : '⚠'}
            </span>
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="auth-card">
        <div className="panel left-panel">
          <div className="panel-content">
            <div className="medical-icon">
              <div className="stethoscope"></div>
            </div>
            <h2>Reset Your Password</h2>
            <p>Create a new secure password for your Pharma Care account. Make sure it's strong and memorable.</p>
            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span>Secure Password Reset</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✓</span>
                <span>Encrypted & Protected</span>
              </div>
            </div>
            <Link to="/login" className="panel-btn">
              Back to Login
            </Link>
          </div>
        </div>

        <div className="panel right-panel">
          <form className="form-container" onSubmit={handleSubmit}>
            <div className="form-header">
              <h2>Create New Password</h2>
              <p>Enter your new password below</p>
            </div>
            
            <div className="form-group">
              <input 
                type="password" 
                name="password"
                placeholder="New Password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                minLength={6}
              />
              <span className="input-icon">🔑</span>
            </div>
            
            <div className="form-group">
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="Confirm New Password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
                minLength={6}
              />
              <span className="input-icon">🔒</span>
            </div>

            {/* Password Requirements */}
            <div className="password-requirements">
              <p style={{ fontSize: '13px', color: '#666', margin: '0 0 20px 0', lineHeight: '1.4' }}>
                Password must be at least 6 characters long and contain a mix of letters and numbers for security.
              </p>
            </div>
            
            <button type="submit" className="form-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="form-footer">
              <Link to="/login" className="link-btn">
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;