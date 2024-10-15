import React from 'react';
import { RiDashboard2Line } from "react-icons/ri";
import { SiMastercard } from "react-icons/si";
import { MdFeaturedPlayList } from "react-icons/md";
import { Link } from 'react-router-dom';
import { CgTemplate } from "react-icons/cg";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { Container, Row, Col } from 'react-bootstrap';
const NavigationBar = ({ onLinkClick }) => {
  // Theme Change Section

    //const { permissions } = JSON.parse(localStorage.getItem('activeUser')) ||  { permissions: {} };

  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customLight = cssClasses[2];
  
  const isDevelopmentMode= import.meta.env.VITE_APP_MODE === 'development'

   const activeUser = JSON.parse(localStorage.getItem('activeUser'));
   const permissions = Array.isArray(activeUser?.permissionList) ? activeUser.permissionList : [];
   // Assuming permissions are stored in activeUser
console.log(permissions)
  return (
    
    <Container
      className={` ${customDark}`}
      style={{
        height: 'auto',
        minHeight: '130%',
        padding: '1rem',
      }}
    >
      <Row className="justify-content-center">
        {permissions.includes("1") || isDevelopmentMode && (
          <Col xs={6} sm={4} md={3} className="text-center mb-4">
            <Link to="/dashboard" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
              <RiDashboard2Line style={{ width: "40%", height: "40%" }} />
              <div>Dashboard</div>
            </Link>
          </Col>
        )}
        {permissions.includes("2") || isDevelopmentMode && (
          <Col xs={6} sm={4} md={3} className="text-center mb-4">
            <Link to="/master" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
              <SiMastercard style={{ width: "40%", height: "40%" }} />
              <div className='text-center'>Master Management</div>
            </Link>
          </Col>
        )}
        {permissions.includes("3") || isDevelopmentMode && (
          <Col xs={6} sm={4} md={3} className="text-center mb-4">
            <Link to="/labels" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
              <MdFeaturedPlayList style={{ width: "40%", height: "40%" }} />
              <div>Message Management</div>
            </Link>
          </Col>
        )}
        {permissions.includes("4") || isDevelopmentMode && (
          <Col xs={6} sm={4} md={3} className="text-center mb-4">
            <Link to="/ctp" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
              <CgTemplate style={{ width: "40%", height: "40%" }} />
              <div>Reports</div>
            </Link>
          </Col>
        )}
      </Row>
      
    </Container>
  );
};

export default NavigationBar;
