import React from 'react';
import { Tree } from 'antd';
import themeStore from './../../store/themeStore';
import { useStore } from 'zustand';
const { TreeNode } = Tree;

const permissionOptions = [
  { title: 'Dashboard', key: '1' },
  {
    title: 'Master Management',
    key: '2',
    children: [
      {
        title: 'User Management',
        key: '2.1',
        children: [
          {
            title: 'RolePage',
            key: '2.1.1',
            children: [
              {
                title: 'CRUD',
                key: '2.1.1.0', // Unique key for CRUD
                children: [
                  { title: 'create', key: '2.1.1.1' },
                  { title: 'read', key: '2.1.1.2' },
                  { title: 'update', key: '2.1.1.3' },
                  { title: 'delete', key: '2.1.1.4' },
                  { title: 'download', key: '2.1.1.5' },
                  { title: 'report', key: '2.1.1.6' },
                ],
              },
            ],
          },
          {
            title: 'addUser',
            key: '2.1.2',
            children: [
              {
                title: 'CRUD',
                key: '2.1.2.0', // Unique key for CRUD
                children: [
                  { title: 'create', key: '2.1.2.1' },
                  { title: 'read', key: '2.1.2.2' },
                  { title: 'update', key: '2.1.2.3' },
                  { title: 'delete', key: '2.1.2.4' },
                  { title: 'download', key: '2.1.2.5' },
                  { title: 'report', key: '2.1.2.6' },
                ],
              },
            ],
          },
          {
            title: 'allUsers',
            key: '2.1.3',
            children: [
              {
                title: 'CRUD',
                key: '2.1.3.0', // Unique key for CRUD
                children: [
                  { title: 'create', key: '2.1.3.1' },
                  { title: 'read', key: '2.1.3.2' },
                  { title: 'update', key: '2.1.3.3' },
                  { title: 'delete', key: '2.1.3.4' },
                  { title: 'download', key: '2.1.3.5' },
                  { title: 'report', key: '2.1.3.6' },
                ],
              },
            ],
          },
          {
            title: 'securityQuestions',
            key: '2.1.4',
            children: [
              {
                title: 'CRUD',
                key: '2.1.4.0', // Unique key for CRUD
                children: [
                  { title: 'create', key: '2.1.4.1' },
                  { title: 'read', key: '2.1.4.2' },
                  { title: 'update', key: '2.1.4.3' },
                  { title: 'delete', key: '2.1.4.4' },
                  { title: 'download', key: '2.1.4.5' },
                  { title: 'report', key: '2.1.4.6' },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Group',
        key: '2.2',
        children: [
          {
            title: 'CRUD',
            key: '2.2.0', // Unique key for CRUD
            children: [
              { title: 'create', key: '2.2.1' },
              { title: 'read', key: '2.2.2' },
              { title: 'update', key: '2.2.3' },
              { title: 'delete', key: '2.2.4' },
              { title: 'download', key: '2.2.5' },
              { title: 'report', key: '2.2.6' },
            ],
          },
        ],
      },
      {
        title: 'Type',
        key: '2.3',
        children: [
          {
            title: 'CRUD',
            key: '2.3.0', // Unique key for CRUD
            children: [
              { title: 'create', key: '2.3.1' },
              { title: 'read', key: '2.3.2' },
              { title: 'update', key: '2.3.3' },
              { title: 'delete', key: '2.3.4' },
              { title: 'download', key: '2.3.5' },
              { title: 'report', key: '2.3.6' },
            ],
          },
        ],
      },
      {
        title: 'Project',
        key: '2.4',
        children: [
          {
            title: 'CRUD',
            key: '2.4.0', // Unique key for CRUD
            children: [
              { title: 'create', key: '2.4.1' },
              { title: 'read', key: '2.4.2' },
              { title: 'update', key: '2.4.3' },
              { title: 'delete', key: '2.4.4' },
              { title: 'download', key: '2.4.5' },
              { title: 'report', key: '2.4.6' },
            ],
          },
        ],
      },
      {
        title: 'Zone',
        key: '2.5',
        children: [
          {
            title: 'CRUD',
            key: '2.5.0', // Unique key for CRUD
            children: [
              { title: 'create', key: '2.5.1' },
              { title: 'read', key: '2.5.2' },
              { title: 'update', key: '2.5.3' },
              { title: 'delete', key: '2.5.4' },
              { title: 'download', key: '2.5.5' },
              { title: 'report', key: '2.5.6' },
            ],
          },
        ],
      },
      {
        title: 'Camera',
        key: '2.6',
        children: [
          {
            title: 'CRUD',
            key: '2.6.0', // Unique key for CRUD
            children: [
              { title: 'create', key: '2.6.1' },
              { title: 'read', key: '2.6.2' },
              { title: 'update', key: '2.6.3' },
              { title: 'delete', key: '2.6.4' },
              { title: 'download', key: '2.6.5' },
              { title: 'report', key: '2.6.6' },
            ],
          },
        ],
      },
      {
        title: 'Machines',
        key: '2.7',
        children: [
          {
            title: 'CRUD',
            key: '2.7.0', // Unique key for CRUD
            children: [
              { title: 'create', key: '2.7.1' },
              { title: 'read', key: '2.7.2' },
              { title: 'update', key: '2.7.3' },
              { title: 'delete', key: '2.7.4' },
              { title: 'download', key: '2.7.5' },
              { title: 'report', key: '2.7.6' },
            ],
          },
        ],
      },
      { title: 'Alarm', key: '2.8' },
      { title: 'Team', key: '2.9' },
      { title: 'Process Settings', key: '2.10' },
    ],
  },
  { title: 'Message Management', key: '3' },
  { title: 'Reports', key: '4' },
];

const Permissions = ({ selectedPermissions = [], onChange }) => {
  const onCheck = (checkedKeys) => {
    onChange(checkedKeys);
  };

  const renderTreeNodes = (data) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.title} key={item.key} />;
    });
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  return (
    <div className={`${customLight} ${customDarkText}`} style={{ width: '100%', overflowX: 'auto' }}>
      <Tree
        checkable
        checkedKeys={selectedPermissions}
        onCheck={onCheck}
        selectable={false}
        defaultExpandAll={false} // Set to false to keep all nodes collapsed
        treeData={permissionOptions}
        className={`${customLight} ${customDarkText}`}
        style={{
          backgroundColor: customLight,
          color: customDarkText,
          borderColor: customLightBorder,
          minWidth: '300px', // Ensures minimum width on small screens
          fontSize: '14px' // Adjust font size for better readability on small screens
        }}
      />
    </div>
  );
};

export default Permissions;
