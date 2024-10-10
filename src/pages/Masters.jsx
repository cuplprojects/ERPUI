import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import {
  FaUsers,
  FaProjectDiagram,
  FaGlobeAmericas,
  FaTools,
  FaBell,
  FaFileContract,
  FaUserPlus,
  FaUserCog,
  FaListUl,
  FaCamera,
  FaCog,
  FaPlusCircle,
  FaCaretDown,
  FaCaretLeft,
  FaFileAlt,
  FaCogs
} from 'react-icons/fa';

import GroupManager from './Group'
import ProjectManager from './Project';
import ZoneManager from './Zone';
import Type from './Type';
import AlarmMaster from './Alarm';
import Machine from './ProductionMachine';
import SecurityQ from './SecurityQuestions.jsx';
import './../styles/Sidebar.css'; // Import your custom CSS
import AddUsers from '../sub-Components/addUsers';
import AllUsers from '../sub-Components/allUsers';
import CameraList from './CameraList';
import RolesAndDepartments from './Roles/RolePage';
import Team from './team';
import SystemSettings from './SystemSettings';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';

import Report from './Report.jsx';
import {BsQuestionSquareFill} from 'react-icons/bs'


const Sidebar = () => {
  // Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5]
  const customLightBorder = cssClasses[6]
  const customDarkBorder = cssClasses[7]

  const [selectedMenu, setSelectedMenu] = useState('group'); // Default to 'group'
  const [expandedMenus, setExpandedMenus] = useState({}); // State to manage expanded menus
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    if (activeUser && activeUser.permissionList) {
      setUserPermissions(activeUser.permissionList);
    }
  }, []);
  
  const handleMenuClick = (key) => {
    setSelectedMenu(key);
  };

  const toggleDropdown = (key) => {
    setExpandedMenus((prevState) => ({
      ...prevState,
      [key]: !prevState[key], // Toggle the dropdown state
    }));
  };

  const menuItems = [
    {
      key: 'userManagement',
      icon: <FaUsers className={`${customDarkText} menu-icon`} />,
      label: 'User Management',
      permission: '2.1',
      children: [
        { key: 'RolePage', icon: <FaUserCog className={`${customDarkText} menu-icon`} />, label: 'Role', permission: '2.1' },
        { key: 'addUser', icon: <FaUserPlus className={`${customDarkText} menu-icon`} />, label: 'Add User', permission: '2.1' },
        { key: 'allUsers', icon: <FaListUl className={`${customDarkText} menu-icon`} />, label: 'All Users', permission: '2.1' },
        { key: 'securityQuestions', icon: <BsQuestionSquareFill className={`${customDarkText} menu-icon`} />, label: 'Add Questions', permission: '2.1' },
      ],
    },

    { key: 'group', icon: <FaUsers className={`${customDarkText} menu-icon`} />, label: 'Group', permission: '2.2' },
    { key: 'type', icon: <FaUsers className={`${customDarkText} menu-icon`} />, label: 'Type', permission: '2.3' },
    { key: 'project', icon: <FaProjectDiagram className={`${customDarkText} menu-icon`} />, label: 'Project', permission: '2.4' },
    { key: 'zone', icon: <FaGlobeAmericas className={`${customDarkText} menu-icon`} />, label: 'Zone', permission: '2.5' },
    { key: 'camera', icon: <FaCamera className={`${customDarkText} menu-icon`} />, label: 'Camera', permission: '2.6' },
    { key: 'machine', icon: <FaListUl className={`${customDarkText} menu-icon`} />, label: 'Machines', permission: '2.7' },
    { key: 'alarm', icon: <FaBell className={`${customDarkText} menu-icon`} />, label: 'Alarm', permission: '2.8' },
    { key: 'team', icon: <FaUsers className={`${customDarkText} menu-icon`} />, label: 'Team', permission: '2.9' },
    { key: 'systemSettings', icon: <FaCog className={`${customDarkText} menu-icon`} />, label: 'Process Settings', permission: '2.10' },

  ];

  // Filter the menu items based on user permissions
  const allowedMenuItems = menuItems.filter(menu => {
    if (menu.children) {
      menu.children = menu.children.filter(child => userPermissions.includes(child.permission));
      return menu.children.length > 0; // Keep menu if it has allowed children
    }
    return userPermissions.includes(menu.permission);
  });

  return (
    <Container fluid className='shadow-lg'>
      <Row className=''>
        <Col md={3} className={`sidebar rounded-start-4  `}>
          <Nav className="flex-column ">
            {allowedMenuItems.map((menu) => (
              <React.Fragment key={menu.key}>
                <Nav.Link
                  onClick={() => {
                    if (menu.children) {
                      toggleDropdown(menu.key); // Toggle dropdown if it has children
                    } else {
                      handleMenuClick(menu.key); // Just handle menu click if no children
                    }
                  }}
                  className={`d-flex align-items-center sidebar-item  ${selectedMenu === menu.key ? 'active rounded-start rounded-end-5' : 'rounded-start rounded-end-5'} ${selectedMenu === menu.key ? customLight : ''}`}
                >
                  {menu.icon} <span className={`${customDarkText} ml-3 d-none d-lg-block`}>{menu.label}</span>
                  {menu.children && (
                    <span className="ml-auto">
                      {expandedMenus[menu.key] ? <FaCaretDown className={customDarkText} size={25} /> : <FaCaretLeft className={customDarkText} size={25} />}
                    </span>
                  )}
                </Nav.Link>
                {menu.children && expandedMenus[menu.key] && menu.children.map((child) => (
                  <Nav.Link
                    key={child.key}
                    onClick={() => handleMenuClick(child.key)}
                    className={`ml-4 d-flex align-items-center sidebar-item ${selectedMenu === child.key ? 'active rounded-start rounded-end-5' : 'rounded-start rounded-end-5'} ${selectedMenu === child.key ? customLight : ''}`}
                  >
                    {child.icon} <span className={`${customDarkText} ml-3`}>{child.label}</span>
                  </Nav.Link>
                ))}
              </React.Fragment>
            ))}
          </Nav>
        </Col>
        <Col md={9}  className={`content-area rounded-end-4 ${customLight}`}>

          {userPermissions.includes('2.1') && selectedMenu === 'RolePage' && <RolesAndDepartments />}
          {userPermissions.includes('2.1') && selectedMenu === 'addUser' && <AddUsers />}
          {userPermissions.includes('2.1') && selectedMenu === 'allUsers' && <AllUsers />}
          {userPermissions.includes('2.2') && selectedMenu === 'group' && <GroupManager />}
          {userPermissions.includes('2.3') && selectedMenu === 'type' && <Type />}
          {userPermissions.includes('2.1') && selectedMenu === 'securityQuestions' && <SecurityQ />}
          {userPermissions.includes('2.4') && selectedMenu === 'project' && <ProjectManager />}
          {userPermissions.includes('2.5') && selectedMenu === 'zone' && <ZoneManager />}
          {userPermissions.includes('2.6') && selectedMenu === 'camera' && <CameraList />}
          {userPermissions.includes('2.9') && selectedMenu === 'team' && <Team />}
          {userPermissions.includes('2.10') && selectedMenu === 'systemSettings' && <SystemSettings />}
          {userPermissions.includes('2.7') && selectedMenu === 'machine' && <Machine />}
          {userPermissions.includes('2.8') && selectedMenu === 'alarm' && <AlarmMaster />}

        </Col>
      </Row>
    </Container>
  );
};

export default Sidebar;
