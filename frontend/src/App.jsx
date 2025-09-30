import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AboutUs from './pages/AboutUs.jsx';  // NEW IMPORT
import AuthPage from './pages/AuthPage.jsx';
import PrescriptionPage from './pages/PrescriptionPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx'; 
import ProfilePage from './pages/ProfilePage.jsx';

// Import i18n configuration
import './i18n/i18n';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />  {/* NEW ROUTE */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/prescription" element={<PrescriptionPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;