import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Input, Switch, Select, notification } from 'antd';
import { 
  AppstoreAddOutlined, 
  BuildOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './../styles/SystemSettings.css';

const { TabPane } = Tabs;

const SystemSettings = () => {
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [features, setFeatures] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [featureConfigData, setFeatureConfigData] = useState([]);

  const [featureName, setFeatureName] = useState('');
  const [processId, setProcessId] = useState('');
  const [processName, setProcessName] = useState('');
  const [processStatus, setProcessStatus] = useState(false);
  const [processWeightage, setProcessWeightage] = useState('');
  const [processInstalledFeatures, setProcessInstalledFeatures] = useState([]);

  // Validation states
  const [processNameError, setProcessNameError] = useState('');
  const [processWeightageError, setProcessWeightageError] = useState('');

  useEffect(() => {
    // Example: Fetch data for features and processes from the server
    const fetchFeatures = async () => {
      // Fetch the features from your backend
      // Example: const data = await fetch('/api/features');
      const data = []; // Replace with actual API response
      setFeatures(data);
    };

    const fetchProcesses = async () => {
      // Fetch the processes from your backend
      // Example: const data = await fetch('/api/processes');
      const data = []; // Replace with actual API response
      setProcesses(data);
    };

    fetchFeatures();
    fetchProcesses();
  }, []);

  const showAddFeatureModal = () => {
    setFeatureModalVisible(true);
  };

  const handleAddFeature = () => {
    const isValidName = /^[A-Za-z\s]+$/.test(featureName);

    if (!featureName) {
      notification.error({ message: 'Feature name cannot be empty!' });
      return;
    }

    if (!isValidName) {
      notification.error({ message: 'Feature name must contain only letters and spaces!' });
      return;
    }

    const isDuplicate = features.some(
      feature => feature.name.toLowerCase() === featureName.toLowerCase()
    );

    if (isDuplicate) {
      notification.error({ message: 'Feature name already exists' });
      return;
    }

    const newFeature = {
      key: (features.length + 1).toString(),
      name: featureName,
    };

    // Add the new feature to the features list
    const updatedFeatures = [...features, newFeature];
    setFeatures(updatedFeatures);

    // Add new feature to featureConfigData
    const newConfigEntry = {
      key: newFeature.key, // Use the same key as the feature
      Module_ID: newFeature.key,
      Configurations: {},
    };

    // Initialize configurations for all existing processes
    processes.forEach(process => {
      newConfigEntry.Configurations[process.id] = false; // Default value
    });

    setFeatureConfigData([...featureConfigData, newConfigEntry]);

    // Reset the modal and show a success message
    setFeatureName('');
    setFeatureModalVisible(false);
    notification.success({ message: 'Feature added successfully!' });
  };

  const showAddProcessModal = () => {
    setProcessId('');
    setProcessName('');
    setProcessStatus(false);
    setProcessWeightage('');
    setProcessInstalledFeatures([]);
    setProcessNameError('');
    setProcessWeightageError('');
    setProcessModalVisible(true);
  };

  const handleAddProcess = () => {
    let valid = true;
    setProcessNameError('');
    setProcessWeightageError('');

    if (!/^[A-Za-z\s]+$/.test(processName)) {
      setProcessNameError('Process name must contain only letters.');
      valid = false;
    }

    if (processes.some(process => process.name.toLowerCase() === processName.toLowerCase())) {
      setProcessNameError('Process name must be unique.');
      valid = false;
    }

    if (!/^\d*\.?\d+$/.test(processWeightage)) {
      setProcessWeightageError('Weightage must be a numeric value.');
      valid = false;
    }

    if (valid) {
      const newProcess = {
        key: (processes.length + 1).toString(),
        id: `${processes.length + 1}`,
        name: processName,
        status: processStatus,
        weightage: processWeightage,
        installedFeatures: processInstalledFeatures.join(', '),
      };
      setProcesses([...processes, newProcess]);
      setProcessModalVisible(false);
      notification.success({ message: 'Process added successfully!' });
    } else {
      notification.error({ message: 'Please fix the validation errors.' });
    }
  };

  const handleToggleConfigurable = (moduleKey, processId) => {
    const updatedData = featureConfigData.map((item) => {
      if (item.key === moduleKey) {
        return {
          ...item,
          Configurations: {
            ...item.Configurations,
            [processId]: !item.Configurations[processId],
          },
        };
      }
      return item;
    });
    setFeatureConfigData(updatedData);
  };

  const handleToggleStatus = (processId) => {
    const updatedProcesses = processes.map((process) => {
      if (process.id === processId) {
        return { ...process, status: !process.status };
      }
      return process;
    });
    setProcesses(updatedProcesses);
    notification.success({ message: 'Process status updated successfully!' });
  };

  const featureConfigColumns = [
    {
      title: 'Feature Name',
      dataIndex: 'Module_ID',
      key: 'Module_ID',
      render: (moduleId) => {
        const module = features.find((f) => f.key === moduleId);
        return module ? module.name : 'Unknown';
      },
    },
    ...processes.map((process) => ({
      title: process.name,
      dataIndex: 'Configurations',
      key: process.id,
      render: (configurations, record) => (
        <Switch
          checked={configurations[process.id]}
          onChange={() => handleToggleConfigurable(record.key, process.id)}
        />
      ),
    })),
  ];

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination || source.index === destination.index) {
      return;
    }

    const updatedFeatures = Array.from(features);
    const [movedFeature] = updatedFeatures.splice(source.index, 1);
    updatedFeatures.splice(destination.index, 0, movedFeature);

    setFeatures(updatedFeatures);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Tabs defaultActiveKey="1">
        <TabPane 
          tab={
            <span>
              <AppstoreAddOutlined style={{ fontSize: '25px', marginRight: '8px' }} /> 
              Feature
            </span>
          } 
          key="1"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Feature List</h3>
            <Button type="primary" onClick={showAddFeatureModal}>
              Add New Feature
            </Button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <Table
                    dataSource={features}
                    columns={[
                      {
                        title: 'ID',
                        dataIndex: 'key',
                        key: 'key',
                      },
                      {
                        title: 'Feature Name',
                        dataIndex: 'name',
                        key: 'name',
                        render: (text, record, index) => (
                          <Draggable key={record.key} draggableId={record.key} index={index}>
                            {(provided) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                {...provided.dragHandleProps}
                              >
                                {text}
                              </div>
                            )}
                          </Draggable>
                        ),
                      },
                    ]}
                    pagination={false}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Modal
            title="Add New Feature"
            visible={featureModalVisible}
            onOk={handleAddFeature}
            onCancel={() => setFeatureModalVisible(false)}
          >
            <Input
              placeholder="Enter feature name"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
            />
          </Modal>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BuildOutlined style={{ fontSize: '25px', marginRight: '8px' }} /> 
              Process
            </span>
          } 
          key="2"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Process List</h3>
            <Button type="primary" onClick={showAddProcessModal}>
              Add New Process
            </Button>
          </div>
          <Table
            dataSource={processes}
            columns={[
              {
                title: 'ID',
                dataIndex: 'key',
                key: 'key',
              },
              {
                title: 'Process Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status, record) => (
                  <Switch
                    checked={status}
                    onChange={() => handleToggleStatus(record.id)}
                  />
                ),
              },
              {
                title: 'Weightage',
                dataIndex: 'weightage',
                key: 'weightage',
              },
              {
                title: 'Installed Features',
                dataIndex: 'installedFeatures',
                key: 'installedFeatures',
              },
            ]}
            pagination={false}
          />
          <Modal
            title="Add New Process"
            visible={processModalVisible}
            onOk={handleAddProcess}
            onCancel={() => setProcessModalVisible(false)}
          >
            <Input
              placeholder="Enter process name"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
            />
            {processNameError && <div style={{ color: 'red' }}>{processNameError}</div>}
            <Input
              placeholder="Enter weightage"
              value={processWeightage}
              onChange={(e) => setProcessWeightage(e.target.value)}
              style={{ width: '100%', marginTop: '10px' }}
            />
            {processWeightageError && <div style={{ color: 'red' }}>{processWeightageError}</div>}
            <Select
              mode="multiple"
              placeholder="Select installed features"
              value={processInstalledFeatures}
              onChange={setProcessInstalledFeatures}
              style={{ width: '100%', marginTop: '10px' }}
            >
              {features.map(feature => (
                <Select.Option key={feature.key} value={feature.name}>
                  {feature.name}
                </Select.Option>
              ))}
            </Select>
          </Modal>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SettingOutlined style={{ fontSize: '25px', marginRight: '8px' }} /> 
              Feature Configurations
            </span>
          } 
          key="3"
        >
          <Table
            dataSource={featureConfigData}
            columns={featureConfigColumns}
            pagination={false}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
