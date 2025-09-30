import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';
import './AuthPage.css';

const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    
    const [signupData, setSignupData] = useState({
        name: '', 
        email: '', 
        password: '', 
        registrationNumber: '', 
        speciality: '',
        education: '', 
        experience: '', 
        hospitalAffiliation: '',
        hospitalAddress: '', 
        hospitalPhone: '', 
        hospitalEmail: ''
    });
    
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('/default-doctor.png');

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleSignupChange = (e) => setSignupData({ ...signupData, [e.target.name]: e.target.value });
    
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/api/login', loginData);
            localStorage.setItem('token', response.data.token);
            showMessage("Login successful! Redirecting...", 'success');
            setTimeout(() => navigate('/prescription'), 1500);
        } catch (error) {
            showMessage("Login failed! Please check your credentials.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Validate required fields
        if (!signupData.name || !signupData.email || !signupData.password) {
            showMessage("Please fill in name, email, and password.", 'error');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        
        // Only append non-empty fields to prevent backend validation issues
        Object.keys(signupData).forEach(key => {
            const value = signupData[key];
            if (value && value.toString().trim() !== '') {
                formData.append(key, value.toString().trim());
            }
        });
        
        // Add profile image if selected
        if (photoFile) {
            formData.append('profileImage', photoFile);
        }

        try {
            await api.post('/api/register', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
            });
            showMessage("Signup successful! Please login.", 'success');
            setIsLoginView(true);
            // Reset form
            setSignupData({
                name: '', email: '', password: '', registrationNumber: '', speciality: '',
                education: '', experience: '', hospitalAffiliation: '',
                hospitalAddress: '', hospitalPhone: '', hospitalEmail: ''
            });
            setPhotoFile(null);
            setPhotoPreview('/default-doctor.png');
        } catch (error) {
            const errorMsg = error.response?.data?.msg || "Signup failed! User may already exist.";
            showMessage(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/api/forgot-password', { email: forgotPasswordEmail });
            showMessage(res.data.msg, 'success');
            setForgotPasswordEmail('');
            setIsForgotPasswordView(false);
        } catch (error) {
            const errorMsg = error.response?.data?.msg || "Failed to send reset email.";
            showMessage(errorMsg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setIsForgotPasswordView(false);
        setIsLoginView(true);
    };
    
    const handleSwitchToSignup = () => {
        setIsForgotPasswordView(false);
        setIsLoginView(false);
    };

    return (
        <div className="auth-page-container">
            <Link to="/" className="back-to-home-link">← Back to Home</Link>

            {message && (<div className={`message-container ${messageType}`}><span>{message}</span></div>)}

            <div className="auth-card">
                <div className="panel left-panel">
                    <div className="panel-content">
                        <div className="medical-icon"><div className="stethoscope"></div></div>
                        {isForgotPasswordView ? (
                          <>
                            <h2>Reset Password</h2>
                            <p>Enter your email and we'll send a reset link.</p>
                            <button className="panel-btn" onClick={handleBackToLogin}>Back to Login</button>
                          </>
                        ) : isLoginView ? (
                          <>
                            <h2>New to Pharma Care?</h2>
                            <p>Join our trusted network of medical professionals.</p>
                            <button className="panel-btn" onClick={handleSwitchToSignup}>Register Now</button>
                          </>
                        ) : (
                          <>
                            <h2>Welcome Back!</h2>
                            <p>Access your account with ease.</p>
                            <button className="panel-btn" onClick={() => setIsLoginView(true)}>Sign In</button>
                          </>
                        )}
                    </div>
                </div>

                <div className="panel right-panel">
                    {isForgotPasswordView ? (
                        <form className="form-container" onSubmit={handleForgotPasswordSubmit}>
                            <div className="form-header"><h2>Forgot Password?</h2><p>No problem. We've got you covered.</p></div>
                            <div className="form-group"><input type="email" placeholder="Enter your registered email" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} required /></div>
                            <button type="submit" className="form-btn" disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Reset Link'}</button>
                            <div className="form-footer"><button type="button" className="link-btn" onClick={handleBackToLogin}>← Back to Login</button></div>
                        </form>
                    ) : isLoginView ? (
                        <form className="form-container" onSubmit={handleLoginSubmit}>
                            <div className="form-header"><h2>Welcome Back</h2><p>Sign in to your medical account</p></div>
                            <div className="form-group"><input type="email" name="email" placeholder="Email Address" value={loginData.email} onChange={handleLoginChange} required /></div>
                            <div className="form-group"><input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required /></div>
                            <button type="submit" className="form-btn" disabled={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</button>
                            <div className="form-footer"><button type="button" className="link-btn forgot-password-link" onClick={() => setIsForgotPasswordView(true)}>Forgot Password?</button></div>
                        </form>
                    ) : (
                        <form className="form-container signup-form" onSubmit={handleSignupSubmit}>
                            <div className="form-header">
                                <h2>Join Pharma Care</h2>
                                <p>Create your medical account</p>
                            </div>
                            
                            <div className="photo-upload-container">
                                <img src={photoPreview} alt="Doctor" className="profile-preview"/>

                                <label htmlFor="photo-input" className="photo-upload-label">Upload Photo</label>
                                <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoChange} />
                            </div>
                            
                            {/* Required Fields */}
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="name" 
                                        placeholder="Full Name *" 
                                        value={signupData.name} 
                                        onChange={handleSignupChange} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="Email Address *" 
                                        value={signupData.email} 
                                        onChange={handleSignupChange} 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Create Password *" 
                                    value={signupData.password} 
                                    onChange={handleSignupChange} 
                                    required 
                                    minLength="6"
                                />
                            </div>
                            
                            {/* Optional Professional Fields */}
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="registrationNumber" 
                                        placeholder="Medical Registration No. (Optional)" 
                                        value={signupData.registrationNumber} 
                                        onChange={handleSignupChange} 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="speciality" 
                                        placeholder="Medical Speciality (Optional)" 
                                        value={signupData.speciality} 
                                        onChange={handleSignupChange} 
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="education" 
                                        placeholder="Education (MBBS, MD) (Optional)" 
                                        value={signupData.education} 
                                        onChange={handleSignupChange} 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        name="experience" 
                                        placeholder="Years of Experience (Optional)" 
                                        value={signupData.experience} 
                                        onChange={handleSignupChange} 
                                    />
                                </div>
                            </div>
                            
                            {/* Hospital Information */}
                            <div className="form-group full-width">
                                <input 
                                    type="text" 
                                    name="hospitalAffiliation" 
                                    placeholder="Hospital/Clinic Name (Optional)" 
                                    value={signupData.hospitalAffiliation} 
                                    onChange={handleSignupChange} 
                                />
                            </div>
                            
                            <div className="form-group full-width">
                                <input 
                                    type="text" 
                                    name="hospitalAddress" 
                                    placeholder="Hospital Address (Optional)" 
                                    value={signupData.hospitalAddress} 
                                    onChange={handleSignupChange} 
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="tel" 
                                        name="hospitalPhone" 
                                        placeholder="Hospital Phone (Optional)" 
                                        value={signupData.hospitalPhone} 
                                        onChange={handleSignupChange} 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="email" 
                                        name="hospitalEmail" 
                                        placeholder="Hospital Email (Optional)" 
                                        value={signupData.hospitalEmail} 
                                        onChange={handleSignupChange} 
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" className="form-btn" disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Create Medical Account'}
                            </button>
                            
                            <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
                                * Required fields. Other fields are optional and can be updated later.
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;