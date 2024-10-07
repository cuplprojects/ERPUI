import React, { useEffect, useState } from 'react';
import { Button, Card, Table, Modal, Input, Switch, message, Tabs } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import axios from 'axios'; // Import axios for API calls

const { TabPane } = Tabs;

const RolesAndDepartments = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ roleId: 0, roleName: '', priorityOrder: 0, status: true });
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);

  // Fetch roles from the API on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('https://localhost:7223/api/Roles'); // Update with your API endpoint
        setRoles(response.data);
      } catch (error) {
        message.error('Failed to fetch roles');
      }
    };

    fetchRoles();
  }, []);

  const onCreateRole = () => {
    setNewRole({roleName: '', priorityOrder: 0, status: true });
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
    const isRoleExists = roles.some(role => role.roleName.toLowerCase() === trimmedRoleName.toLowerCase());
    if (isRoleExists) {
      message.error('Role name already exists');
      return;
    }
    const isPriorityOrderExists = roles.some(role => role.priorityOrder === newRole.priorityOrder);
    if (isPriorityOrderExists) {
      message.error('Priority order must be unique');
      return;
    }


    try {
      // Sending the payload with the new structure
      const response = await axios.post('https://localhost:7223/api/Roles', {
        roleName: trimmedRoleName,
        priorityOrder: newRole.priorityOrder,
        status: newRole.status,
      });
      
      // Assuming your API returns the created role
      setRoles([...roles, { ...response.data }]);
      setIsRoleModalVisible(false);
      message.success('Role added successfully');
    } catch (error) {
      message.error('Failed to add role');
    }
  };

  const handleRoleCancel = () => {
    setIsRoleModalVisible(false);
  };

  const handleRoleStatusChange = async (checked, roleId) => {
    try {
      await axios.patch(`https://localhost:7223/api/Roles/${roleId}`, { status: checked }); // Update role status in the API
      const updatedRoles = roles.map(role =>
        role.roleId === roleId ? { ...role, status: checked } : role
      );
      setRoles(updatedRoles);
      message.success('Role status updated');
    } catch (error) {
      message.error('Failed to update role status');
    }
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
          {/* Modal for Adding New Role */}
          <Modal
            title="Add New Role"
            open={isRoleModalVisible}
            onOk={handleRoleOk}
            onCancel={handleRoleCancel}
            okText="Add Role"
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
            {/* Optional: Add an input for priorityOrder */}
            
          </Modal>
        </Card>
      </TabPane>
    </Tabs>
  );
};

export default RolesAndDepartments;
