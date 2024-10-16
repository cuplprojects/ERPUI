import React, { useMemo } from 'react';
import { RiDashboard2Line } from "react-icons/ri";
import { SiMastercard } from "react-icons/si";
import { MdFeaturedPlayList } from "react-icons/md";
import { CgTemplate } from "react-icons/cg";
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';
import { BiSolidDashboard } from "react-icons/bi";

const NavigationBar = ({ onLinkClick }) => {
  const { getCssClasses } = useStore(themeStore);
  const [customDark] = getCssClasses();
  
  const isDevelopmentMode = import.meta.env.VITE_APP_MODE === 'development';
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const permissions = Array.isArray(activeUser?.permissionList) ? activeUser.permissionList : [];

  const navItems = useMemo(() => [
    { id: "1", to: "/dashboard", icon: RiDashboard2Line, text: "Dashboard" },
    { id: "2", to: "/master", icon: SiMastercard, text: "Master Management" },
    { id: "3", to: "/labels", icon: MdFeaturedPlayList, text: "Message Management" },
    { id: "4", to: "/ctp", icon: CgTemplate, text: "Reports" },
    { id: "5", to: "/cudashboard", icon: BiSolidDashboard , text: "Cumulative dashboard" }
  ], []);

  return (
    <Container fluid className={`${customDark} py-4`}>
      <Row className="justify-content-evenly g-4">
        {navItems.map(item => (
          (permissions.includes(item.id) || isDevelopmentMode) && (
            <Col xs={6} sm={4} md={3} key={item.id} className="text-center">
              <Link to={item.to} className="text-white text-decoration-none d-flex flex-column align-items-center custom-zoom-btn" onClick={onLinkClick}>
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
