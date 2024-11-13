import React, { useEffect, useState } from 'react';
import { Button, Card, Table, Input, Switch, message, Tabs } from 'antd';
import { Modal } from 'react-bootstrap';
import { EditOutlined } from '@ant-design/icons';
import themeStore from '../../store/themeStore';
import { useStore } from 'zustand';
import Permissions from './Permissions';
import API from '../../CustomHooks/MasterApiHooks/api';
import { AiFillCloseSquare } from "react-icons/ai";
import { useTranslation } from 'react-i18next';

const { TabPane } = Tabs;

const RolesAndDepartments = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ roleId: 0, roleName: '', priorityOrder: 0, status: true, permissions: [] });
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchRoles = async () => {
    try {
      const response = await API.get('/Roles');
      console.log(response.data);
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles');
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle page change
  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const onCreateRole = () => {
    setNewRole({ roleId: 0, roleName: '', priorityOrder: 0, status: true, permissions: [] });
    setIsRoleModalVisible(true);
  };

  const handleRoleOk = async () => {
    const trimmedRoleName = newRole.roleName.trim();
    if (!trimmedRoleName) {
      message.error(t('Role name cannot be empty'));
      return;
    }
    if (/[^a-zA-Z\s]/.test(trimmedRoleName)) {
      message.error(t('Role name should contain only alphabetic characters'));
      return;
    }
  
    const isPriorityOrderExists = roles.some(role => role.priorityOrder === newRole.priorityOrder && role.roleId !== newRole.roleId);
    if (isPriorityOrderExists) {
      message.error(t('Priority order must be unique'));
      return;
    }
  
    try {
      let response;
      if (newRole.roleId === 0) {
        response = await API.post('/Roles', {
          roleName: trimmedRoleName,
          priorityOrder: newRole.priorityOrder,
          status: newRole.status,
          permissionList: newRole.permissions.map(permission => permission.toString()),
        });
        setRoles([...roles, { ...response.data }]);
        message.success(t('Role added successfully'));
      } else {
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
        message.success(t('Role updated successfully'));
      }
  
      handleRoleCancel();
      fetchRoles();
    } catch (error) {
      message.error(t('Failed to process the role'));
    }
  };

  const handleRoleCancel = () => {
    setIsRoleModalVisible(false);
    setNewRole({ roleId: 0, roleName: '', priorityOrder: 0, status: true, permissions: [] });
  };

  const handleEditRole = (role) => {
    const defaultCheckedPermissions = role.permissionList || [];
    setNewRole({ ...role, permissions: defaultCheckedPermissions });
    setIsRoleModalVisible(true);
  };

  const handleRoleStatusChange = async (checked, roleId) => {
    try {
      const roleResponse = await API.get(`/Roles/${roleId}`);
      const roleData = roleResponse.data;

      await API.put(`/Roles/${roleId}`, {
        roleId: roleId,
        roleName: roleData.roleName,
        priorityOrder: roleData.priorityOrder,
        status: checked,
        permission: '',
        permissionList: roleData.permissionList
      });

      const updatedRoles = roles.map(role =>
        role.roleId === roleId ? { ...role, status: checked } : role
      );
      setRoles(updatedRoles);
      message.success(t('Role status updated'));
    } catch (error) {
      message.error(t('Failed to update role status'));
    }
  };

  const handlePermissionChange = (checkedKeys) => {
    setNewRole({ ...newRole, permissions: checkedKeys });
  };

  // Pagination logic for roles (on the frontend)
  const paginatedRoles = roles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const roleColumns = [
    {
      align: 'center',
      title: t('SN.'),
      dataIndex: 'roleId',
      width: '15%',
    },
    {
      title: t('Role Name'),
      dataIndex: 'roleName',
      width: '30%',
    },
    {
      align: 'center',
      title: t('order'),
      dataIndex: 'priorityOrder',
      width: '20%',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      align: 'center',
      width: '15%',
      render: (status, record) => (
        <Switch
          checked={record.status}
          onChange={(checked) => handleRoleStatusChange(checked, record.roleId)}
          checkedChildren={t('active')}
          unCheckedChildren={t('inactive')}
        />
      ),
    },
    {
      title: t('actions'),
      dataIndex: 'actions',
      align: 'center',
      width: '20%',
      render: (_, record) => (
        <Button
          type="link"
          className={`${customBtn} d-flex align-items-center gap-1`}
          onClick={() => handleEditRole(record)}
        >
          <EditOutlined />
          <span className="ms-1">{t('edit')}</span>
        </Button>
      ),
    }
  ];

  const paginationConfig = {
    pageSize: 5,
    showSizeChanger: true,
    pageSizeOptions: [5, 10, 20],
  };

  return (
    <Card
      className={`w-100 mx-auto ${customMid} border-0`}
      style={{ maxWidth: '1200px' }}
      styles={{ body: { padding: '12px' } }}
    >
      <div className={`d-flex justify-content-between align-items-center mb-1`}>
        <h2 className={`${customDarkText} m-0`}>{t('Role List')}</h2>
        <Button onClick={onCreateRole} className={`${customBtn}`}>
          {t('New Role')}
        </Button>
      </div>
      <Table
        rowKey="roleId"
        size="small"
        pagination={{
          ...paginationConfig,
          current: currentPage,
          total: roles.length,
          onChange: handlePaginationChange,
          className: `${customDark === "dark-dark" || customDark === "blue-dark" ? "bg-white" : ""} p-3 rounded-bottom-3 `,
          responsive: true,
          showSizeChanger: true
        }}
        columns={roleColumns}
        dataSource={paginatedRoles}
        style={{  width: '100%' }}
        scroll={{ x: true }}
        className={`${customDark === "default-dark" ? "thead-default" : ""} 
                    ${customDark === "red-dark" ? "thead-red" : ""} 
                    ${customDark === "green-dark" ? "thead-green" : ""} 
                    ${customDark === "blue-dark" ? "thead-blue" : ""} 
                    ${customDark === "dark-dark" ? "thead-dark" : ""} 
                    ${customDark === "pink-dark" ? "thead-pink" : ""} 
                    ${customDark === "purple-dark" ? "thead-purple" : ""} 
                    ${customDark === "light-dark" ? "thead-light" : ""} 
                    ${customDark === "brown-dark" ? "thead-brown" : ""}`}
        bordered
        responsive
      />
      <Modal
        show={isRoleModalVisible}
        onHide={handleRoleCancel}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className={`${customLight} ${customDarkText} ${customDark === "dark-dark" ? ' border border-bottom-0' : `border-0`} d-flex justify-content-between align-items-center`}>
          <Modal.Title>{newRole.roleId === 0 ? t("Add New Role") : t("Edit Role")}</Modal.Title>
          <AiFillCloseSquare
            size={35}
            onClick={handleRoleCancel}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label="Close"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          />
        </Modal.Header>
        <Modal.Body className={`${customLight} ${customDarkText} ${customDark === "dark-dark" ? ' border' : `border-0`}`}>
          <Input
            placeholder={t("Role Name")}
            value={newRole.roleName}
            onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
            onPressEnter={handleRoleOk}
          />
          <div style={{ marginTop: 10 }}>
            <Input
              type="number"
              placeholder={t("Priority Order")}
              value={newRole.priorityOrder}
              onChange={(e) => setNewRole({ ...newRole, priorityOrder: Number(e.target.value) })}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <span>{t('status')}: </span>
            <Switch
              checked={newRole.status}
              onChange={(checked) => setNewRole({ ...newRole, status: checked })}
              checkedChildren={t('active')}
              unCheckedChildren={t('inactive')}
            />
          </div>
          <Permissions selectedPermissions={newRole.permissions} onChange={handlePermissionChange} />
        </Modal.Body>
        <Modal.Footer className={`${customLight} ${customDarkText} ${customDark === "dark-dark" ? 'border border-top-0' : ''}`}>
          <Button onClick={handleRoleCancel}>
            {t('close')}
          </Button>
          <Button type="primary" onClick={handleRoleOk}>
            {newRole.roleId === 0 ? t("Add Role") : t("Update Role")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default RolesAndDepartments;
