import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import './../styles/ThemeSelector.css'; // Custom styles for theme buttons

const themes = [
  { name: 'Dark', color: '#021526' },
  { name: 'Light', color: '#71C9CE' },
  { name: 'Red', color: '#D12E5A' },
  { name: 'Blue', color: '#0F2469' },
  { name: 'Green', color: '#348D58' },
  { name: 'Purple', color: '#AD49E1' },
  { name: 'Brown', color: '#3C3D37' },
  { name: 'Pink', color: '#ED3EF7' },
  { name: 'Default', color: '#37474F' }
];

const ThemeSelector = () => {
  const setTheme = useStore(themeStore, (state) => state.setTheme); // Access setTheme from the store
  const currentTheme = useStore(themeStore, (state) => state.theme); // Get current theme from the store

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme); // Use the setTheme function from Zustand
  };

  return (
    <Row className="g-3">
      <Form.Label>Select Theme</Form.Label>
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
            {theme.name}
          </Button>
        </Col>
      ))}
    </Row>
  );
};

export default ThemeSelector;
