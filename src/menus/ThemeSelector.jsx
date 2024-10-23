import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import './../styles/ThemeSelector.css'; // Custom styles for theme buttons
import { useTranslation } from 'react-i18next';

const themes = [
  { name: 'dark', color: '#021526' },
  { name: 'light', color: '#71C9CE' },
  { name: 'red', color: '#D12E5A' },
  { name: 'blue', color: '#0F2469' },
  { name: 'green', color: '#348D58' },
  { name: 'purple', color: '#AD49E1' },
  { name: 'brown', color: '#3C3D37' },
  { name: 'pink', color: '#ED3EF7' },
  { name: 'default', color: '#37474F' }
];

const ThemeSelector = () => {
  const { t } = useTranslation();
  const setTheme = useStore(themeStore, (state) => state.setTheme); // Access setTheme from the store
  const currentTheme = useStore(themeStore, (state) => state.theme); // Get current theme from the store

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme); // Use the setTheme function from Zustand
  };

  return (
    <Row className="g-3">
      <Form.Label>{t('selectTheme')}</Form.Label>
      {themes.map((theme) => (
        <Col key={theme.name} xs={4} md={4}>
          <Button
            style={{
              backgroundColor: theme.color,
              borderColor: theme.color
            }}
            className={`w-100 text-white theme-btn ${currentTheme === theme.name ? 'active' : ''}`}
            onClick={() => handleThemeChange(theme.name)}
          >
            {t(theme.name)}
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default ThemeSelector;
