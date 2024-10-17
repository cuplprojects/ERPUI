import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Offcanvas } from 'react-bootstrap';
import {
  FaUsers,
  FaProjectDiagram,
  FaGlobeAmericas,
  FaBell,
  FaListUl,
  FaCamera,
  FaCog,
  FaCaretDown,
  FaCaretLeft,
} from 'react-icons/fa';
import { RiUserSettingsFill, RiMenuFold4Fill } from "react-icons/ri";
import { AiFillCloseSquare } from "react-icons/ai";
import { FaBookOpenReader } from "react-icons/fa6";

import GroupManager from './Group'
import ProjectManager from './Project';
import ZoneManager from './Zone';
import Type from './Type';
import AlarmMaster from './Alarm';
import Machine from './ProductionMachine';
import './../styles/Sidebar.css';
import AddUsers from '../sub-Components/addUsers';
import AllUsers from '../sub-Components/allUsers';
import CameraList from './CameraList';
import RolesAndDepartments from './Roles/RolePage';
import Team from './team';
import SystemSettings from './SystemSettings';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

const Sidebar = () => {
  const { getCssClasses } = useStore(themeStore);
  const [customDark, customMid, customLight, , customDarkText, customLightText, customLightBorder] = getCssClasses();
  const isDevelopmentMode = import.meta.env.VITE_APP_MODE === 'development'

  const [selectedMenu, setSelectedMenu] = useState('group');
  const [expandedMenus, setExpandedMenus] = useState({});
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setShow(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = (key) => {
    setSelectedMenu(key);
    if (!expandedMenus[key]) {
      setTimeout(handleClose, 300);
    }
  };

  const toggleDropdown = (key) => {
    setExpandedMenus(prevState => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const menuItems = [
    {
      key: 'userManagement',
      icon: <RiUserSettingsFill className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />,
      label: 'User Management',
      permission: '2.1',
      children: [
        { key: 'RolePage', icon: <FaUsers className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Role', permission: '2.1.1' },
        { key: 'addUser', icon: <FaUsers className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Add User', permission: '2.1.2' },
        { key: 'allUsers', icon: <FaListUl className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'All Users', permission: '2.1.3' },
      ],
    },
    { key: 'group', icon: <FaUsers className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Group', permission: '2.2' },
    { key: 'type', icon: <FaBookOpenReader className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Project Type', permission: '2.3' },
    { key: 'project', icon: <FaProjectDiagram className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Project', permission: '2.4' },
    { key: 'zone', icon: <FaGlobeAmericas className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Zone', permission: '2.5' },
    { key: 'camera', icon: <FaCamera className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Camera', permission: '2.6' },
    { key: 'machine', icon: <FaListUl className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Production Machines', permission: '2.7' },
    { key: 'alarm', icon: <FaBell className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Alarm', permission: '2.8' },
    { key: 'team', icon: <FaUsers className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Team', permission: '2.9' },
    { key: 'systemSettings', icon: <FaCog className={`${customDark === "dark-dark" ? `text-white` : customDarkText} menu-icon`} />, label: 'Process Settings', permission: '2.10' },
  ];

  const allowedMenuItems = isDevelopmentMode ? menuItems : menuItems.filter(menu => {
    if (menu.children) {
      menu.children = menu.children.filter(child => hasPermission(child.permission));
      return menu.children.length > 0;
    }
    return hasPermission(menu.permission);
  });

  const renderNavItems = (items, isOffcanvas = false) => {
    return items.map((menu) => (
      <React.Fragment key={menu.key}>
        <Nav.Link
          onClick={() => {
            if (menu.children) {
              toggleDropdown(menu.key);
            } else {
              handleMenuClick(menu.key);
            }
          }}
          className={`d-flex align-items-center ${customDark === "dark-dark" ? `sidebar-item-dark` : `sidebar-item`} ${selectedMenu === menu.key ? `active rounded-start rounded-end-5 ${customMid}` : `rounded-start rounded-end-5 text-dark`} hover:bg-my-hover-bg hover:text-my-hover-text`}
        >
          {menu.icon} <span className={`${customDark === "dark-dark" ? `text-white` : customDarkText} ml-3 ${isOffcanvas ? '' : 'd-none d-md-block d-lg-block'}`}>{menu.label}</span>
          {menu.children && (
            <span className="ml-auto">
              {expandedMenus[menu.key] ? <FaCaretDown className={`${customDark === `dark-dark` ? `text-white` : customDarkText}`} size={25} /> : <FaCaretLeft className={customDarkText} size={25} />}
            </span>
          )}
        </Nav.Link>
        {menu.children && expandedMenus[menu.key] && menu.children.map((child) => (
          <Nav.Link
            key={child.key}
            onClick={() => handleMenuClick(child.key)}
            className={`ml-4 d-flex align-items-center ${customDark === "dark-dark" ? `sidebar-item-dark` : `sidebar-item`} ${selectedMenu === child.key ? `active rounded-start rounded-end-5 ${customMid}` : 'rounded-start rounded-end-5'} hover:bg-my-hover-bg hover:text-my-hover-text`}
          >
            {child.icon} <span className={`${customDark === "dark-dark" ? `text-white` : customDarkText} ml-3`}>{child.label}</span>
          </Nav.Link>
        ))}
      </React.Fragment>
    ));
  };

  return (
    <Container fluid className={`rounded-4 ${customDark === "dark-dark" ? `border` : `shadow-lg`}`}>
      <Row>
        <Col lg={3} className={`sidebar rounded-start-4 d-none d-lg-block ${customDark === "dark-dark" ? customDark : ``}`}>
          <Nav className="flex-column">
            {renderNavItems(allowedMenuItems)}
          </Nav>
        </Col>
        <div className={`small-sidebar d-lg-none`}>
          <button className={`mt-2 ${customDark === "dark-dark" ? `${customDark} ${customLightText} ${customLightBorder}` : `${customDark} ${customLightText} border-0`} p-1 rounded`} onClick={handleShow}>
            <RiMenuFold4Fill size={25} />
          </button>
          <Offcanvas show={show} onHide={handleClose} placement="start" className={customDark === "dark-dark" ? customDark : customLight} style={{ width: '80%', zIndex: "9999" }}>
            <Offcanvas.Header closeButton={false} className={`${customDark} ${customLightText} d-flex justify-content-between`}>
              <Offcanvas.Title className={customDark === 'dark-dark' ? `text-white` : ``}>Menu</Offcanvas.Title>
              <AiFillCloseSquare 
                size={35}
                onClick={handleClose} 
                className={`${customDark === "dark-dark" ? "text-dark bg-white" : `${customDark} custom-zoom-btn text-white ${customLightBorder}`} rounded-2`}
                aria-label="Close"
                style={{ cursor: 'pointer', fontSize: '1.5rem' }}
              />
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                {renderNavItems(allowedMenuItems, true)}
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>
        </div>
        <Col lg={9} md={12} sm={12} xm={12} className={`content-area rounded-end-4 ${customMid} shadow-`}>
          {(hasPermission('2.1.1') || isDevelopmentMode) && selectedMenu === 'RolePage' && <RolesAndDepartments />}
          {(hasPermission('2.1.2') || isDevelopmentMode) && selectedMenu === 'addUser' && <AddUsers />}
          {(hasPermission('2.1.3') || isDevelopmentMode) && selectedMenu === 'allUsers' && <AllUsers />}
          {(hasPermission('2.2') || isDevelopmentMode) && selectedMenu === 'group' && <GroupManager />}
          {(hasPermission('2.3') || isDevelopmentMode) && selectedMenu === 'type' && <Type />}
          {(hasPermission('2.4') || isDevelopmentMode) && selectedMenu === 'project' && <ProjectManager />}
          {(hasPermission('2.5') || isDevelopmentMode) && selectedMenu === 'zone' && <ZoneManager />}
          {(hasPermission('2.6') || isDevelopmentMode) && selectedMenu === 'camera' && <CameraList />}
          {(hasPermission('2.9') || isDevelopmentMode) && selectedMenu === 'team' && <Team />}
          {(hasPermission('2.10') || isDevelopmentMode) && selectedMenu === 'systemSettings' && <SystemSettings />}
          {(hasPermission('2.7') || isDevelopmentMode) && selectedMenu === 'machine' && <Machine />}
          {(hasPermission('2.8') || isDevelopmentMode) && selectedMenu === 'alarm' && <AlarmMaster />}
        </Col>
      </Row>
    </Container>
  );
};

export default Sidebar;
