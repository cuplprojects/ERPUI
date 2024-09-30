import React, { useState } from 'react';
import Hindi from "./../assets/Icons/Hindi.png";
import English from "./../assets/Icons/English.png";
import { Form } from 'react-bootstrap';
import './../styles/LanguageSwitcher.css'; // Custom styles

const LanguageSwitcher = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('en'); // 'en' is the default language

    const changeLanguage = (lang) => {
        setSelectedLanguage(lang);
    };

    return (
        <div className="language-switcher-container">
            <Form.Label className="language-label">Change Language</Form.Label>
            <div className="language-switcher">
                {/* Hindi Button */}
                <button
                    className={`language-btn rounded-4 ${selectedLanguage === 'hi' ? 'active' : ''}`}
                    onClick={() => changeLanguage('hi')}
                >
                    <img src={Hindi} alt="Hindi" className="language-icon" />
                    <span>हिन्दी</span>
                </button>

                {/* English Button */}
                <button
                    className={`language-btn rounded-4 ${selectedLanguage === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}
                >
                    <img src={English} alt="English" className="language-icon" />
                    <span>English</span>
                </button>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
