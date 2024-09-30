import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  TeamOutlined,
  ProjectOutlined,
  GlobalOutlined,
  ToolOutlined,
  BellOutlined,
  FileProtectOutlined,
  PlusOutlined,
  UserOutlined,
  SettingOutlined,
  UserAddOutlined,
  UnorderedListOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css'; // Ant Design styles
import GroupManager from './Group';
import ProjectManager from './Project';
import ZoneManager from './Zone';
import Machine from './ProductionMachine';
import AddMachine from './AddMachine'; // Component for adding a machine
import AlarmMaster from './Alarm';
import EnvelopeConfiguration from './EnvelopeConfiguration';
import './../styles/Sidebar.css'; // Import your custom CSS for hover effect
import AddUsers from '../sub-Components/addUsers';
import AllUsers from '../sub-Components/allUsers';
import CameraList from './CameraList';
import RolesAndDepartments from './RolePage';
import Team from './team';
import SystemSettings from './SystemSettings'; // Assuming you have a component for System Settings

const { Sider, Content } = Layout;

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState('group');

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };

  const menuItems = [


    {
      key: 'userManagement',
      icon: <UserOutlined style={{ fontSize: '30px', color: '#ff85c0' }} />,
      label: 'User Management',
      children: [
        {
          key: 'RolePage',
          icon: <SettingOutlined style={{ color: '#722ed1' }} />,
          label: 'Role',
        },
        {
          key: 'addUser',
          icon: <UserAddOutlined style={{ color: '#1890ff' }} />,
          label: 'Add User',
        },
        {
          key: 'allUsers',
          icon: <UnorderedListOutlined style={{ color: '#52c41a' }} />,
          label: 'All Users',
        },
      ],
    },
    {
      key: 'group',
      icon: <TeamOutlined style={{ fontSize: '30px', color: '#1890ff' }} />,
      label: 'Group',
    },
    {
      key: 'project',
      icon: <ProjectOutlined style={{ fontSize: '30px', color: '#faad14' }} />,
      label: 'Project',
    },
    {
      key: 'zone',
      icon: <GlobalOutlined style={{ fontSize: '30px', color: '#52c41a' }} />,
      label: 'Zone',
    },
    {
      key: 'camera',
      icon: <CameraOutlined style={{ fontSize: '30px', color: '#fa541c' }} />,
      label: 'Camera',
    },
    {
      key: 'machine',
      icon: <ToolOutlined style={{ fontSize: '30px', color: '#722ed1' }} />,
      label: 'Machine',
      children: [
        {
          key: 'MachineType',
          icon: <PlusOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />,
          label: 'Add Machine',
        },
        {
          key: 'AllMachines',
          icon: <UnorderedListOutlined style={{ fontSize: '20px', color: '#52c41a' }} />,
          label: 'All Machines',
        },
      ],
    },
    {
      key: 'alarm',
      icon: <BellOutlined style={{ fontSize: '30px', color: '#eb2f96' }} />,
      label: 'Alarm',
    },
    {
      key: 'envelope',
      icon: <FileProtectOutlined style={{ fontSize: '30px', color: '#13c2c2' }} />,
      label: 'Envelope Configuration',
    },
    
    {
      key: 'team', // New Team menu item
      icon: <TeamOutlined style={{ fontSize: '30px', color: '#722ed1' }} />,
      label: 'Team',
    },
    {
      key: 'systemSettings', // New System Settings menu item
      icon: <SettingOutlined style={{ fontSize: '30px', color: '#faad14' }} />, // System Settings icon
      label: 'Process Settings',
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        theme="light"
        width={250}
        style={{
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
          minHeight: '100vh',
        }}
      >
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['group']}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ fontSize: '16px' }}
        />
      </Sider>

      <Layout>
        <Content
          style={{
            padding: '40px',
            background: '#f0f2f5',
            minHeight: '100vh',
          }}
        >
          {selectedMenu === 'RolePage' && <RolesAndDepartments />}
          {selectedMenu === 'addUser' && <AddUsers />}
          {selectedMenu === 'allUsers' && <AllUsers />}
          {selectedMenu === 'group' && <GroupManager />}
          {selectedMenu === 'project' && <ProjectManager />}
          {selectedMenu === 'zone' && <ZoneManager />}
          {selectedMenu === 'camera' && <CameraList />}
          {selectedMenu === 'team' && <Team />} {/* Render Team component */}
          {selectedMenu === 'systemSettings' && <SystemSettings />} {/* Render System Settings component */}
          {selectedMenu === 'MachineType' && <AddMachine />}
          {selectedMenu === 'AllMachines' && <Machine />}
          {selectedMenu === 'alarm' && <AlarmMaster />}
          {selectedMenu === 'envelope' && <EnvelopeConfiguration />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
