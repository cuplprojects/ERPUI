import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button, Card, Table, Modal, Input, Switch, message, Tabs, Form, Select, Space, Dropdown, Menu, Checkbox } from 'antd';
import { IdcardOutlined, EditOutlined, SearchOutlined, SettingOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import Permissions from './Permissions';
import { getRoles, createRole, updateRole } from './../../CustomHooks/ApiServices/rolesService';
import { hasPermission } from '../../CustomHooks/Services/permissionUtils';
import { useTranslation } from 'react-i18next';
import themeStore from './../../store/themeStore';
import { useStore } from 'zustand';
import { useMediaQuery } from 'react-responsive';
import { AiFillCloseSquare } from "react-icons/ai";
import { BsFunnelFill } from "react-icons/bs";
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const { TabPane } = Tabs;
const { Option } = Select;

const RolesAndDepartments = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ roleId: 0, roleName: '', priorityOrder: 0, status: true, permissions: [] });
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [visibleColumns, setVisibleColumns] = useState({
    status: true,
    actions: true,
  });
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const fetchRoles = useCallback(async () => {
    try {
      const data = await getRoles();
      setRoles(data);
      console.log(data);
    } catch (error) {
      console.error(t('failedToFetchRoles'));
    }
  }, [t]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const onCreateRole = useCallback(() => {
    setNewRole({ roleId: 0, roleName: '', priorityOrder: 0, status: true, permissions: [] });
    setIsRoleModalVisible(true);
  }, []);

  const handleRoleOk = useCallback(async () => {
    const trimmedRoleName = newRole.roleName.trim();
    if (!trimmedRoleName) {
      message.error(t('roleNameCannotBeEmpty'));
      return;
    }
    if (/[^a-zA-Z\s]/.test(trimmedRoleName)) {
      message.error(t('roleNameShouldContainOnlyAlphabeticCharacters'));
      return;
    }
  
    const isPriorityOrderExists = roles.some(role => role.priorityOrder === newRole.priorityOrder && role.roleId !== newRole.roleId);
    if (isPriorityOrderExists) {
      message.error(t('priorityOrderMustBeUnique'));
      return;
    }
  
    try {
      let response;
      if (newRole.roleId === 0) {
        response = await createRole({
          roleName: trimmedRoleName,
          priorityOrder: newRole.priorityOrder,
          status: newRole.status,
          permissionList: newRole.permissions.map(permission => permission.toString()),
        });
        setRoles([...roles, { ...response }]);
        message.success(t('roleAddedSuccessfully'));
      } else {
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
      fetchRoles();
    } catch (error) {
      message.error(t('failedToProcessTheRole'));
    }
  }, [newRole, roles, t, fetchRoles]);

  const handleRoleCancel = useCallback(() => {
    setIsRoleModalVisible(false);
  }, []);

  const handleEditRole = useCallback((role) => {
    const defaultCheckedPermissions = role.permissionList || [];
    setNewRole({ ...role, permissions: defaultCheckedPermissions });
    setIsRoleModalVisible(true);
  }, []);

  const handleRoleStatusChange = useCallback(async (checked, roleId) => {
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
  }, [roles, t]);

  const handlePermissionChange = useCallback((checkedKeys) => {
    setNewRole(prev => ({ ...prev, permissions: checkedKeys }));
  }, []);

  const handleChange = useCallback((pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  }, []);

  const toggleSort = useCallback((columnKey) => {
    setSortedInfo(prev => {
      const newSortedInfo = { ...prev };
      if (newSortedInfo.columnKey === columnKey) {
        newSortedInfo.order = newSortedInfo.order === 'ascend' ? 'descend' : 'ascend';
      } else {
        newSortedInfo.columnKey = columnKey;
        newSortedInfo.order = 'ascend';
      }
      return newSortedInfo;
    });
  }, []);

  const handleColumnVisibilityChange = useCallback((e, column) => {
    setVisibleColumns(prev => ({ ...prev, [column]: e.target.checked }));
  }, []);

  const roleColumns = useMemo(() => [
    {
      title: t('sn'),
      dataIndex: 'roleId',
      width: 75,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      align: 'center',
    },
    {
      title: t('roles'),
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
    visibleColumns.status && {
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
    visibleColumns.actions && {
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
  ].filter(Boolean), [t, currentPage, pageSize, sortedInfo, searchText, visibleColumns, handleRoleStatusChange, handleEditRole, toggleSort]);

  const paginationConfig = useMemo(() => ({
    current: currentPage,
    pageSize: pageSize,
    total: roles.length,
    showSizeChanger: true,
    pageSizeOptions: [5, 10, 20],
    onChange: (page, pageSize) => {
      setCurrentPage(page);
      setPageSize(pageSize);
    },
  }), [currentPage, pageSize, roles.length]);

  const columnSettingsMenu = (
    <Menu>
      {Object.entries(visibleColumns).map(([column, isVisible]) => (
        <Menu.Item key={column}>
          <Checkbox
            checked={isVisible}
            onChange={(e) => handleColumnVisibilityChange(e, column)}
          >
            {t(column)}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

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
            <Space>
              <Input
                placeholder={t('searchRoles')}
                suffix={<SearchOutlined />}
                style={{ width: 200}}
                onChange={(e) => setSearchText(e.target.value)}
              />
             
              <Dropdown overlay={columnSettingsMenu} trigger={['click']} visible={columnSettingsVisible} onVisibleChange={setColumnSettingsVisible}>
                <Button icon={<SettingOutlined />} className={`${customDark === "dark-dark" ? "text-dark" : customDarkText} border-0`} />
              </Dropdown> 
              {hasPermission('2.1.1.1') && (
                <Button type="primary" onClick={onCreateRole} className={`ms-2 ${customBtn}`}>
                  {t('newRole')}
                </Button>
              )}
            </Space>
          }
          style={{ width: '80%', margin: '0 auto', padding: '16px' }}
          bodyStyle={{ padding: '12px' }}
          className={`${customDark === "dark-dark" ? `${customDark} border text-white shadow-lg` : `${customDarkText}`}`}
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
            className={`thead-${customDark.split('-')[0]}`}
          />
          <Modal
            title={newRole.roleId === 0 ? t('addNewRole') : t('editRole')}
            open={isRoleModalVisible}
            onOk={handleRoleOk}
            onCancel={handleRoleCancel}
            okText={newRole.roleId === 0 ? t('addRole') : t('updateRole')}
            cancelText={t('cancel')}
            okButtonProps={{ type: 'primary', className: customBtn }}
          >
            <Form layout="vertical">
              <Form.Item label={t('roleName')}>
                <Input
                  value={newRole.roleName}
                  onChange={(e) => setNewRole(prev => ({ ...prev, roleName: e.target.value }))}
                  onPressEnter={handleRoleOk}
                  placeholder={t('enterRoleName')}
                />
              </Form.Item>
              <Form.Item label={t('priorityOrder')}>
                <Input
                  type="number"
                  value={newRole.priorityOrder}
                  onChange={(e) => setNewRole(prev => ({ ...prev, priorityOrder: Number(e.target.value) }))}
                  placeholder={t('enterPriorityOrder')}
                />
              </Form.Item>
              <Form.Item label={t('status')}>
                <Switch
                  checked={newRole.status}
                  onChange={(checked) => setNewRole(prev => ({ ...prev, status: checked }))}
                />
              </Form.Item>
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
