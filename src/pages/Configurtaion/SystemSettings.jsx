// SystemSettings.js
import React, { useState } from 'react';
import { Tabs } from 'antd';
import { AppstoreOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons'; // Import icons
import { useTranslation } from 'react-i18next';
import FeatureManagement from './Feature';
import ProcessManagement from './ProcessManagement';
import FeatureConfiguration from './FeatureConfiguration'; // Import the FeatureConfiguration component
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import { FaSearch } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { AiFillCloseSquare } from 'react-icons/ai';
const { TabPane } = Tabs;

const SystemSettings = () => {
  const [features, setFeatures] = useState([]);
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const updateFeatures = (updatedFeatures) => {
    setFeatures(updatedFeatures);
  };

  const updateProcesses = (updatedProcesses) => {
    // Handle process update logic here if needed
  };

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span>
              <AppstoreOutlined /> {/* Feature icon */}
              {t('features')}
            </span>
          }
          key="1"
        >
          <FeatureManagement onUpdateFeatures={updateFeatures} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <SettingOutlined /> {/* Process icon */}
              {t('processes')}
            </span>
          }
          key="2"
        >
          <ProcessManagement features={features} onUpdateProcesses={updateProcesses} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <ToolOutlined /> {/* Configuration icon */}
              {t('featureConfiguration')}
            </span>
          }
          key="3"
        >
          <FeatureConfiguration features={features} /> {/* Add the FeatureConfiguration component */}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
