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
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
const permissions = {
  dashboard: true,
  master: false,
  message: true,
  reports: true,
};
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const userId = activeUser && activeUser.userId;

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
        {
          permissions.dashboard && (
              <Col xs={6} sm={4} md={3} className="text-center mb-4">
          <Link to="/dashboard" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
            <RiDashboard2Line style={{ width: "40%", height: "40%" }} />
            <div>Dashboard</div>
          </Link>
        </Col>
          )
        }
      
{
  permissions.master  && (
     <Col xs={6} sm={4} md={3} className="text-center mb-4">
          <Link to="/master" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
            <SiMastercard style={{ width: "40%", height: "40%" }} />
            <div className='text-center'>Master Management</div>
          </Link>
        </Col>)

}
       {
        permissions.message && (<Col xs={6} sm={4} md={3} className="text-center mb-4">
          <Link to="/features" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
            <MdFeaturedPlayList style={{ width: "40%", height: "40%" }} />
            <div>Message Management</div>
          </Link>
        </Col>)
       }
        {
          permissions.reports && (
            <Col xs={6} sm={4} md={3} className="text-center mb-4">
          <Link to="/ctp" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
            <CgTemplate style={{ width: "40%", height: "40%" }} />
            <div>Reports</div>
          </Link>
        </Col>
          )
        }
        
      </Row>
    </Container>
  );
};

export default NavigationBar;
