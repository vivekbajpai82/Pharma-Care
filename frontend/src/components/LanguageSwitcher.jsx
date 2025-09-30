import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button 
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title="Switch to English"
      >
        EN
      </button>
      <button 
        className={`lang-btn ${i18n.language === 'hi' ? 'active' : ''}`}
        onClick={() => changeLanguage('hi')}
        title="हिंदी में बदलें"
      >
        हिं
      </button>
    </div>
  );
};

export default LanguageSwitcher;