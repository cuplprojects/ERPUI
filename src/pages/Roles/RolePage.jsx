import React, { useEffect, useState } from 'react';
import { Button, Card, Table, Modal, Input, Switch, message, Tabs } from 'antd';
import { IdcardOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios'; // Import axios for API calls
import Permissions from './Permissions';
import API from '../../CustomHooks/MasterApiHooks/api';

const { TabPane } = Tabs;

const RolesAndDepartments = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ roleId: 0, roleName: '', priorityOrder: 0, status: true, permissions: [] });
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  // Fetch roles from the API on component mount
  const fetchRoles = async () => {
    try {
      const response = await API.get('/Roles'); // Update with your API endpoint
      setRoles(response.data);
      console.log(response.data); 
    } catch (error) {
      console.error('Failed to fetch roles');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const onCreateRole = () => {
    setNewRole({ roleId: 0, roleName: '', priorityOrder: 0, status: true, permissions: [] });
    setIsRoleModalVisible(true);
  };

  const handleRoleOk = async () => {
    const trimmedRoleName = newRole.roleName.trim();
    if (!trimmedRoleName) {
      message.error('Role name cannot be empty');
      return;
    }
    if (/[^a-zA-Z\s]/.test(trimmedRoleName)) {
      message.error('Role name should contain only alphabetic characters');
      return;
    }
  
    // Skipping duplicate role name validation for update
    const isPriorityOrderExists = roles.some(role => role.priorityOrder === newRole.priorityOrder && role.roleId !== newRole.roleId);
    if (isPriorityOrderExists) {
      message.error('Priority order must be unique');
      return;
    }
  
    try {
      let response;
      if (newRole.roleId === 0) {
        // Sending the payload for creating a new role
        response = await API.post('/Roles', {
          roleName: trimmedRoleName,
          priorityOrder: newRole.priorityOrder,
          status: newRole.status,
          permissionList: newRole.permissions.map(permission => permission.toString()),
        });
        setRoles([...roles, { ...response.data }]);
        message.success('Role added successfully');
      } else {
        // Sending the payload for updating an existing role
        response = await API.put(`/Roles/${newRole.roleId}`, {
          roleId: newRole.roleId,
          roleName: trimmedRoleName,
          priorityOrder: newRole.priorityOrder,
          status: newRole.status,
          permission:'',
          permissionList: newRole.permissions.map(permission => permission.toString()),
        });
        const updatedRoles = roles.map(role => (role.roleId === newRole.roleId ? response.data : role));
        setRoles(updatedRoles);
        message.success('Role updated successfully');
      }
  
      setIsRoleModalVisible(false);
      fetchRoles(); // Fetch roles after successful operation to update the state with the latest data
    } catch (error) {
      message.error('Failed to process the role');
    }
  };

  const handleRoleCancel = () => {
    setIsRoleModalVisible(false);
  };

  const handleEditRole = (role) => {
    // Set the selected role data to newRole and ensure permissions are default checked in the modal
    const defaultCheckedPermissions = role.permissionList || []; // Use permissionList directly
    setNewRole({ ...role, permissions: defaultCheckedPermissions });
    setIsRoleModalVisible(true);
  };

  const handleRoleStatusChange = async (checked, roleId) => {
    try {
      await API.patch(`/Roles/${roleId}`, { status: checked }); // Update role status in the API
      const updatedRoles = roles.map(role =>
        role.roleId === roleId ? { ...role, status: checked } : role
      );
      setRoles(updatedRoles);
      message.success('Role status updated');
    } catch (error) {
      message.error('Failed to update role status');
    }
  };

  const handlePermissionChange = (checkedKeys) => {
    setNewRole({ ...newRole, permissions: checkedKeys });
  };

  const roleColumns = [
    {
      title: 'SN.',
      dataIndex: 'roleId',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'roleName',
      width: 200,
    },
    {
      title: 'Order',
      dataIndex: 'priorityOrder',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      width: 75,
      render: (status, record) => (
        <Switch
          checked={record.status}
          onChange={(checked) => handleRoleStatusChange(checked, record.roleId)}
        />
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      align: 'center',
      width: 75,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditRole(record)} // Handle edit role
        />
      ),
    }
  ];

  // Pagination configuration
  const paginationConfig = {
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: [5, 10, 20],
  };

  return (
    <Tabs defaultActiveKey="1">
      <TabPane
        tab={
          <span>
            <IdcardOutlined style={{ fontSize: '30px', marginRight: '8px' }} /> Roles
          </span>
        }
        key="1"
      >
        <Card
          title="Role List"
          extra={
            <Button type="primary" onClick={onCreateRole}>
              New Role
            </Button>
          }
          style={{ width: '60%', margin: '0 auto', padding: '16px' }}
          bodyStyle={{ padding: '12px' }}
        >
          <Table
            rowKey="roleId"
            size="small"
            pagination={paginationConfig}
            columns={roleColumns}
            dataSource={roles}
            style={{ fontSize: '12px' }}
          />
          {/* Modal for Adding or Editing Role */}
          <Modal
            title={newRole.roleId === 0 ? "Add New Role" : "Edit Role"}
            open={isRoleModalVisible}
            onOk={handleRoleOk}
            onCancel={handleRoleCancel}
            okText={newRole.roleId === 0 ? "Add Role" : "Update Role"}
            okButtonProps={{ type: 'primary' }}
          >
            <Input
              placeholder="Role Name"
              value={newRole.roleName}
              onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
              onPressEnter={handleRoleOk}
            />
            <div style={{ marginTop: 10 }}>
              <Input
                type="number"
                placeholder="Priority Order"
                value={newRole.priorityOrder}
                onChange={(e) => setNewRole({ ...newRole, priorityOrder: Number(e.target.value) })}
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <span>Status: </span>
              <Switch
                checked={newRole.status}
                onChange={(checked) => setNewRole({ ...newRole, status: checked })}
              />
            </div>
            {/* Include Permissions Component */}
            <Permissions selectedPermissions={newRole.permissions} onChange={handlePermissionChange} />
          </Modal>
        </Card>
      </TabPane>
    </Tabs>
  );
};

export default RolesAndDepartments;
