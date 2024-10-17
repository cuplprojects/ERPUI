import React, { useEffect, useState } from 'react';
import { Button, Card, Table, Modal, Input, Switch, message, Tabs, Form } from 'antd';
import { IdcardOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import Permissions from './Permissions';
import { getRoles, createRole, updateRole } from './../../CustomHooks/ApiServices/rolesservice';
import { hasPermission } from '../../CustomHooks/Services/permissionUtils';
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;

const RolesAndDepartments = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ roleId: 0, roleName: '', priorityOrder: 0, status: true, permissions: [] });
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch roles from the API on component mount
  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
      console.log(data);
    } catch (error) {
      console.error(t('failedToFetchRoles'));
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
      message.error(t('roleNameCannotBeEmpty'));
      return;
    }
    if (/[^a-zA-Z\s]/.test(trimmedRoleName)) {
      message.error(t('roleNameShouldContainOnlyAlphabeticCharacters'));
      return;
    }
  
    // Skipping duplicate role name validation for update
    const isPriorityOrderExists = roles.some(role => role.priorityOrder === newRole.priorityOrder && role.roleId !== newRole.roleId);
    if (isPriorityOrderExists) {
      message.error(t('priorityOrderMustBeUnique'));
      return;
    }
  
    try {
      let response;
      if (newRole.roleId === 0) {
        // Sending the payload for creating a new role
        response = await createRole({
          roleName: trimmedRoleName,
          priorityOrder: newRole.priorityOrder,
          status: newRole.status,
          permissionList: newRole.permissions.map(permission => permission.toString()),
        });
        setRoles([...roles, { ...response }]);
        message.success(t('roleAddedSuccessfully'));
      } else {
        // Sending the payload for updating an existing role
        response = await updateRole(newRole.roleId, {
          roleId: newRole.roleId,
          roleName: trimmedRoleName,
          priorityOrder: newRole.priorityOrder,
          status: newRole.status,
          permission:'',
          permissionList: newRole.permissions.map(permission => permission.toString()),
        });
        const updatedRoles = roles.map(role => (role.roleId === newRole.roleId ? response : role));
        setRoles(updatedRoles);
        message.success(t('roleUpdatedSuccessfully'));
      }
  
      setIsRoleModalVisible(false);
      fetchRoles(); // Fetch roles after successful operation to update the state with the latest data
    } catch (error) {
      message.error(t('failedToProcessTheRole'));
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
      const roleToUpdate = roles.find(role => role.roleId === roleId);
      if (roleToUpdate) {
        await updateRole(roleId, { ...roleToUpdate, status: checked });
        const updatedRoles = roles.map(role =>
          role.roleId === roleId ? { ...role, status: checked } : role
        );
        setRoles(updatedRoles);
        message.success(t('roleStatusUpdated'));
      }
    } catch (error) {
      message.error(t('failedToUpdateRoleStatus'));
    }
  };

  const handlePermissionChange = (checkedKeys) => {
    setNewRole({ ...newRole, permissions: checkedKeys });
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const toggleSort = (columnKey) => {
    const newSortedInfo = { ...sortedInfo };
    if (newSortedInfo.columnKey === columnKey) {
      newSortedInfo.order = newSortedInfo.order === 'ascend' ? 'descend' : 'ascend';
    } else {
      newSortedInfo.columnKey = columnKey;
      newSortedInfo.order = 'ascend';
    }
    setSortedInfo(newSortedInfo);
  };

  const roleColumns = [
    {
      title: t('sn'),
      dataIndex: 'roleId',
      width: 75,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      align: 'center',
    },
    {
      title: t('name'),
      dataIndex: 'roleName',
      width: 150,
      sorter: (a, b) => a.roleName.localeCompare(b.roleName),
      sortOrder: sortedInfo.columnKey === 'roleName' && sortedInfo.order,
      filteredValue: [searchText],
      onFilter: (value, record) =>
        record.roleName?.toLowerCase().includes(value.toLowerCase()),
      onHeaderCell: () => ({
        onClick: () => toggleSort('roleName'),
      }),
      align: 'center',
    },
    {
      title: t('order'),
      dataIndex: 'priorityOrder',
      width: 75,
      sorter: (a, b) => a.priorityOrder - b.priorityOrder,
      sortOrder: sortedInfo.columnKey === 'priorityOrder' && sortedInfo.order,
      onHeaderCell: () => ({
        onClick: () => toggleSort('priorityOrder'),
      }),
      align: 'center',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (status, record) => (
        <Switch
          checked={record.status}
          onChange={(checked) => handleRoleStatusChange(checked, record.roleId)}
          disabled={!hasPermission('2.1.1.3')}
        />
      ),
    },
    {
      title: t('actions'),
      dataIndex: 'actions',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditRole(record)}
          disabled={!hasPermission('2.1.1.3')}
        />
      ),
    }
  ];

  // Pagination configuration
  const paginationConfig = {
    current: currentPage,
    pageSize: pageSize,
    total: roles.length,
    showSizeChanger: true,
    pageSizeOptions: [5, 10, 20],
    onChange: (page, pageSize) => {
      setCurrentPage(page);
      setPageSize(pageSize);
    },
  };

  return (
    <Tabs defaultActiveKey="1">
      <TabPane
        tab={
          <span>
            <IdcardOutlined style={{ fontSize: '30px', marginRight: '8px' }} /> {t('roles')}
          </span>
        }
        key="1"
      >
        <Card
          title={t('roleList')}
          extra={
            <>
              <Input
                placeholder={t('searchRoles')}
                suffix={<SearchOutlined />}
                style={{ width: 200}}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {!hasPermission('2.1.1.1') && (
                <Button type="primary" onClick={onCreateRole} className='ms-2'>
                  {t('newRole')}
                </Button>
              )}
            </>
          }
          style={{ width: '80%', margin: '0 auto', padding: '16px' }}
          bodyStyle={{ padding: '12px' }}
        >
          <Table
            rowKey="roleId"
            size="small"
            pagination={paginationConfig}
            columns={roleColumns}
            dataSource={roles}
            style={{ fontSize: '12px' }}
            onChange={handleChange}
            bordered
          />
          {/* Modal for Adding or Editing Role */}
          <Modal
            title={newRole.roleId === 0 ? t('addNewRole') : t('editRole')}
            open={isRoleModalVisible}
            onOk={handleRoleOk}
            onCancel={handleRoleCancel}
            okText={newRole.roleId === 0 ? t('addRole') : t('updateRole')}
            okButtonProps={{ type: 'primary' }}
          >
            <Form layout="vertical">
              <Form.Item label={t('roleName')}>
                <Input
                  value={newRole.roleName}
                  onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
                  onPressEnter={handleRoleOk}
                  placeholder={t('enterRoleName')}
                />
              </Form.Item>
              <Form.Item label={t('priorityOrder')}>
                <Input
                  type="number"
                  value={newRole.priorityOrder}
                  onChange={(e) => setNewRole({ ...newRole, priorityOrder: Number(e.target.value) })}
                  placeholder={t('enterPriorityOrder')}
                />
              </Form.Item>
              <Form.Item label={t('status')}>
                <Switch
                  checked={newRole.status}
                  onChange={(checked) => setNewRole({ ...newRole, status: checked })}
                />
              </Form.Item>
              {/* Include Permissions Component */}
              <Form.Item label={t('permissions')}>
                <Permissions selectedPermissions={newRole.permissions} onChange={handlePermissionChange} />
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </TabPane>
    </Tabs>
  );
};

export default RolesAndDepartments;
