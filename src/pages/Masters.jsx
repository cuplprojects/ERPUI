import React, { useState } from 'react';
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
} from 'react-icons/fa';
import GroupManager from './Group';
import ProjectManager from './Project';
import ZoneManager from './Zone';
import Machine from './ProductionMachine';
import AddMachine from './AddMachine';
import AlarmMaster from './Alarm';
import EnvelopeConfiguration from './EnvelopeConfiguration';
import './../styles/Sidebar.css'; // Import your custom CSS
import AddUsers from '../sub-Components/addUsers';
import AllUsers from '../sub-Components/allUsers';
import CameraList from './CameraList';
import RolesAndDepartments from './RolePage';
import Team from './team';
import SystemSettings from './SystemSettings';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';

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
      children: [
        { key: 'RolePage', icon: <FaUserCog className={`${customDarkText} menu-icon`} />, label: 'Role' },
        { key: 'addUser', icon: <FaUserPlus className={`${customDarkText} menu-icon`} />, label: 'Add User' },
        { key: 'allUsers', icon: <FaListUl className={`${customDarkText} menu-icon`} />, label: 'All Users' },
      ],
    },
    // { key: 'group', icon: <FaUsers className={`${customDarkText} menu-icon`} />, label: 'Group' },
    { key: 'project', icon: <FaProjectDiagram className={`${customDarkText} menu-icon`} />, label: 'Project' },
    { key: 'zone', icon: <FaGlobeAmericas className={`${customDarkText} menu-icon`} />, label: 'Zone' },
    { key: 'camera', icon: <FaCamera className={`${customDarkText} menu-icon`} />, label: 'Camera' },
    {
      key: 'machine',
      icon: <FaTools className={`${customDarkText} menu-icon`} />,
      label: 'Machine',
      children: [
        { key: 'MachineType', icon: <FaPlusCircle className={`${customDarkText} menu-icon`} />, label: 'Add Machine' },
        { key: 'AllMachines', icon: <FaListUl className={`${customDarkText} menu-icon`} />, label: 'All Machines' },
      ],
    },
    { key: 'alarm', icon: <FaBell className={`${customDarkText} menu-icon`} />, label: 'Alarm' },
    { key: 'envelope', icon: <FaFileContract className={`${customDarkText} menu-icon`} />, label: 'Envelope Configuration' },
    { key: 'team', icon: <FaUsers className={`${customDarkText} menu-icon`} />, label: 'Team' },
    { key: 'systemSettings', icon: <FaCog className={`${customDarkText} menu-icon`} />, label: 'Process Settings' },
  ];

  return (
    <Container fluid className='shadow-lg'>
      <Row className=''>
        <Col md={3} className={`sidebar rounded-start-4  `}>
          <Nav className="flex-column ">
            {menuItems.map((menu) => (
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
          {selectedMenu === 'RolePage' && <RolesAndDepartments />}
          {selectedMenu === 'addUser' && <AddUsers />}
          {selectedMenu === 'allUsers' && <AllUsers />}
          {/* {selectedMenu === 'group' && <GroupManager />} */}
          {selectedMenu === 'project' && <ProjectManager />}
          {selectedMenu === 'zone' && <ZoneManager />}
          {selectedMenu === 'camera' && <CameraList />}
          {selectedMenu === 'team' && <Team />}
          {selectedMenu === 'systemSettings' && <SystemSettings />}
          {selectedMenu === 'MachineType' && <AddMachine />}
          {selectedMenu === 'AllMachines' && <Machine />}
          {selectedMenu === 'alarm' && <AlarmMaster />}
          {selectedMenu === 'envelope' && <EnvelopeConfiguration />}
        </Col>
      </Row>
    </Container>
  );
};

export default Sidebar;
