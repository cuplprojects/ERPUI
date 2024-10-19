// SystemSettings.js
import React, { useState } from 'react';
import { Tabs } from 'antd';
import { AppstoreOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons'; // Import icons
import FeatureManagement from './Feature';
import ProcessManagement from './ProcessManagement';
import FeatureConfiguration from './FeatureConfiguration'; // Import the FeatureConfiguration component

const { TabPane } = Tabs;

const SystemSettings = () => {
  const [features, setFeatures] = useState([]);

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
              Features
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
              Processes
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
              Feature Configuration
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
