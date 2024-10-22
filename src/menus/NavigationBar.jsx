/**
 * NavigationBar Component
 * 
 * This component renders a navigation bar with links to different sections of the application.
 * It uses React Bootstrap for layout and styling, and React Router for navigation.
 * The component is responsive and adapts to different screen sizes.
 * 
 * @component
 * @param {Object} props - The component props
 * @param {Function} props.onLinkClick - Callback function to be called when a navigation link is clicked
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';
import { BiSolidDashboard } from "react-icons/bi";
import { hasPermission } from '../CustomHooks/Services/permissionUtils';
import { useUserData } from '../store/userDataStore';
import { TbReportSearch } from "react-icons/tb";
import { TbMessage2Cog } from "react-icons/tb";
import { IoIosSwitch } from "react-icons/io";

const NavigationBar = ({ onLinkClick }) => {
  // Get the CSS classes for theming
  const { getCssClasses } = useStore(themeStore);
  const [customDark] = getCssClasses();
  
  // Check if the application is running in development mode
  const isDevelopmentMode = import.meta.env.VITE_APP_MODE === 'development';
  
  // Retrieve the user data from a custom hook
  const userData = useUserData();

  /**
   * Navigation items configuration
   * Each item represents a link in the navigation bar
   */
  const navItems = useMemo(() => [
    { id: "1", to: "/cudashboard", icon: BiSolidDashboard, text: "Cumulative dashboard", permission: "1" },
    { id: "2", to: "/master", icon: IoIosSwitch, text: "Master Management", permission: "2" },
    { id: "3", to: "/labels", icon: TbMessage2Cog , text: "Message Management", permission: "3" },
    { id: "4", to: "/reports", icon: TbReportSearch, text: "View Reports", permission: "4" },
  ], []);

  return (
    <Container fluid className={`${customDark} py-4`}>
      <Row className="justify-content-evenly g-4">
        {navItems.map(item => (
          // Render the navigation item only if the user has the required permission
          hasPermission(item.permission) && (
            <Col xs={6} sm={4} lg={2} key={item.id} className="text-center">
              <Link 
                to={item.to} 
                className="text-white text-decoration-none d-flex flex-column align-items-center custom-zoom-btn" 
                onClick={onLinkClick}
              >
                <item.icon style={{ width: "40px", height: "40px" }} />
                <div className="mt-2">{item.text}</div>
              </Link>
            </Col>
          )
        ))}
      </Row>
    </Container>
  );
};

export default React.memo(NavigationBar);
