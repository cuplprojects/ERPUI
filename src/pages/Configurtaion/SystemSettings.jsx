// SystemSettings.js
import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { AppstoreOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import FeatureManagement from './Feature';
import ProcessManagement from './ProcessManagement';
import FeatureConfiguration from './FeatureConfiguration';
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import { FaSearch } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { AiFillCloseSquare } from 'react-icons/ai';
import API from '../../CustomHooks/MasterApiHooks/api';

const { TabPane } = Tabs;

const SystemSettings = () => {
  const [features, setFeatures] = useState([]);
  const [userRoleId, setUserRoleId] = useState(null);
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          const userId = JSON.parse(atob(authToken.split('.')[1])).userId;
          const response = await API.get(`/User/${userId}`);
          setUserRoleId(response.data.roleId);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchUserRole();
  }, []);

  const updateFeatures = (updatedFeatures) => {
    setFeatures(updatedFeatures);
  };

  const updateProcesses = (updatedProcesses) => {
    // Handle process update logic here if needed
  };

  return (
    <div>
      <Tabs 
        defaultActiveKey="1"
        className={`custom-tabs`}
        tabBarStyle={{
          borderBottom: `2px solid ${customDark}`
        }}
      >
        {userRoleId !== 1 && (
          <TabPane
            tab={
              <span className={`${customDarkText} ${customDark === 'blue-dark' ? customLightText : customDarkText}`}>
                <AppstoreOutlined />
                {t('features')}
              </span>
            }
            key="1"
          >
            <FeatureManagement onUpdateFeatures={updateFeatures} />
          </TabPane>
        )}
        <TabPane
          tab={
            <span className={`${customDarkText} ${customDark === 'blue-dark' ? customLightText : customDarkText}`}>
              <SettingOutlined />
              {t('processes')}
            </span>
          }
          key="2"
        >
          <ProcessManagement features={features} onUpdateProcesses={updateProcesses} />
        </TabPane>
        <TabPane
          tab={
            <span className={`${customDarkText} ${customDark === 'blue-dark' ? customLightText : customDarkText}`}>
              <ToolOutlined />
              {t('featureConfiguration')}
            </span>
          }
          key="3"
        >
          <FeatureConfiguration features={features} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
