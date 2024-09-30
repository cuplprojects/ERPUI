import React, { useState } from 'react';
import { Button, Card, Table, Modal, Input, Switch, message, Tabs } from 'antd';
import { IdcardOutlined, ApartmentOutlined } from '@ant-design/icons'; // Use TeamOutlined for Departments

const { TabPane } = Tabs;

const DEFAULT_ROLE_VALUE = {
  roleId: 0,
  roleName: '',
  isActive: true,
};

const DEFAULT_DEPARTMENT_VALUE = {
  departmentId: 0,
  departmentName: '',
  isActive: true,
};

const RolesAndDepartments = () => {
  const [roles, setRoles] = useState([
    { roleId: 1, roleName: 'Admin', isActive: true },
    { roleId: 2, roleName: 'Editor', isActive: true },
    { roleId: 3, roleName: 'Viewer', isActive: false },
  ]);

  const [departments, setDepartments] = useState([
    { departmentId: 1, departmentName: 'HR', isActive: true },
    { departmentId: 2, departmentName: 'Finance', isActive: true },
    { departmentId: 3, departmentName: 'IT', isActive: false },
  ]);

  const [newRole, setNewRole] = useState(DEFAULT_ROLE_VALUE);
  const [newDepartment, setNewDepartment] = useState(DEFAULT_DEPARTMENT_VALUE);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isDepartmentModalVisible, setIsDepartmentModalVisible] = useState(false);

  // Role Modal Handlers
  const onCreateRole = () => {
    setNewRole(DEFAULT_ROLE_VALUE);
    setIsRoleModalVisible(true);
  };

  const handleRoleOk = () => {
    const trimmedRoleName = newRole.roleName.trim();

    // Validation: role name cannot be empty
    if (!trimmedRoleName) {
      message.error('Role name cannot be empty');
      return;
    }

    // Validation: role name should not contain numeric or alphanumeric characters
    if (/[^a-zA-Z\s]/.test(trimmedRoleName)) {
      message.error('Role name should contain only alphabetic characters');
      return;
    }

    // Check if role name already exists
    const isRoleExists = roles.some(
      role => role.roleName.toLowerCase() === trimmedRoleName.toLowerCase()
    );
    if (isRoleExists) {
      message.error('Role name already exists');
      return;
    }

    const newRoleId = roles.length ? roles[roles.length - 1].roleId + 1 : 1;
    setRoles([...roles, { ...newRole, roleId: newRoleId, roleName: trimmedRoleName }]);
    setIsRoleModalVisible(false);
    message.success('Role added successfully');
  };

  const handleRoleCancel = () => {
    setIsRoleModalVisible(false);
  };

  // Department Modal Handlers
  const onCreateDepartment = () => {
    setNewDepartment(DEFAULT_DEPARTMENT_VALUE);
    setIsDepartmentModalVisible(true);
  };

  const handleDepartmentOk = () => {
    const trimmedDepartmentName = newDepartment.departmentName.trim();

    // Validation: department name cannot be empty
    if (!trimmedDepartmentName) {
      message.error('Department name cannot be empty');
      return;
    }

    // Validation: department name should not contain numeric or alphanumeric characters
    if (/[^a-zA-Z\s]/.test(trimmedDepartmentName)) {
      message.error('Department name should contain only alphabetic characters');
      return;
    }

    // Check if department name already exists
    const isDepartmentExists = departments.some(
      department => department.departmentName.toLowerCase() === trimmedDepartmentName.toLowerCase()
    );
    if (isDepartmentExists) {
      message.error('Department name already exists');
      return;
    }

    const newDepartmentId = departments.length
      ? departments[departments.length - 1].departmentId + 1
      : 1;
    setDepartments([...departments, { ...newDepartment, departmentId: newDepartmentId, departmentName: trimmedDepartmentName }]);
    setIsDepartmentModalVisible(false);
    message.success('Department added successfully');
  };

  const handleDepartmentCancel = () => {
    setIsDepartmentModalVisible(false);
  };

  // Handle Role Status Change
  const handleRoleStatusChange = (checked, roleId) => {
    const updatedRoles = roles.map((role) =>
      role.roleId === roleId ? { ...role, isActive: checked } : role
    );
    setRoles(updatedRoles);
    message.success('Role status updated');
  };

  // Handle Department Status Change
  const handleDepartmentStatusChange = (checked, departmentId) => {
    const updatedDepartments = departments.map((department) =>
      department.departmentId === departmentId ? { ...department, isActive: checked } : department
    );
    setDepartments(updatedDepartments);
    message.success('Department status updated');
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
      title: 'Status',
      dataIndex: 'isActive',
      align: 'center',
      width: 75,
      render: (status, record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleRoleStatusChange(checked, record.roleId)}
        />
      ),
    },
  ];

  const departmentColumns = [
    {
      title: 'SN.',
      dataIndex: 'departmentId',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'departmentName',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      align: 'center',
      width: 75,
      render: (status, record) => (
        <Switch
          checked={record.isActive}
          onChange={(checked) => handleDepartmentStatusChange(checked, record.departmentId)}
        />
      ),
    },
  ];

  // Pagination configuration
  const paginationConfig = {
    pageSize: 5, // Number of items per page
    showSizeChanger: true, // Allow changing page size
    pageSizeOptions: [5, 10, 20], // Options for page sizes
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
            visible={isRoleModalVisible}
            onOk={handleRoleOk}
            onCancel={handleRoleCancel}
            okText="Add Role"
            okButtonProps={{ type: 'primary' }}
          >
            <Input
              placeholder="Role Name"
              value={newRole.roleName}
              onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
              onPressEnter={handleRoleOk} // Trigger handleRoleOk when Enter is pressed
            />
            <div style={{ marginTop: 10 }}>
              <span>Status: </span>
              <Switch
                checked={newRole.isActive}
                onChange={(checked) => setNewRole({ ...newRole, isActive: checked })}
              />
            </div>
          </Modal>
        </Card>
      </TabPane>

      <TabPane
        tab={
          <span>
            <ApartmentOutlined  style={{ fontSize: '25px', marginRight: '8px' }}/> Departments
          </span>
        }
        key="2"
      >
        <Card
          title="Department List"
          extra={
            <Button type="primary" onClick={onCreateDepartment}>
              New Department
            </Button>
          }
          style={{ width: '60%', margin: '0 auto', padding: '16px' }}
          bodyStyle={{ padding: '12px' }}
        >
          <Table
            rowKey="departmentId"
            size="small"
            pagination={paginationConfig}
            columns={departmentColumns}
            dataSource={departments}
            style={{ fontSize: '12px' }}
            
          />

          {/* Modal for Adding New Department */}
          <Modal
            title="Add New Department"
            visible={isDepartmentModalVisible}
            onOk={handleDepartmentOk}
            onCancel={handleDepartmentCancel}
            okText="Add Department"
            okButtonProps={{ type: 'primary' }}
          >
            <Input
              placeholder="Department Name"
              value={newDepartment.departmentName}
              onChange={(e) => setNewDepartment({ ...newDepartment, departmentName: e.target.value })}
              onPressEnter={handleDepartmentOk} // Trigger handleDepartmentOk when Enter is pressed
            />
            <div style={{ marginTop: 10 }}>
              <span>Status: </span>
              <Switch
                checked={newDepartment.isActive}
                onChange={(checked) => setNewDepartment({ ...newDepartment, isActive: checked })}
              />
            </div>
          </Modal>
        </Card>
      </TabPane>
    </Tabs>
  );
};

export default RolesAndDepartments;
