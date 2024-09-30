import React, { useState } from 'react';
import { Tabs, Table, Button, Modal, Input, Switch, notification } from 'antd';
import { 
  AppstoreAddOutlined, 
  BuildOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './../styles/SystemSettings.css'; // Importing external CSS file for styles

const { TabPane } = Tabs;

// Data for Modules
const initialFeatureList = [
  { key: '1', name: 'Dashboard' },
  { key: '2', name: 'Zone' },
  { key: '3', name: 'Remarks' },
  { key: '4', name: 'Alarm/Voice Notes' },
  { key: '5', name: 'Interim Quantity' },
  { key: '6', name: 'Update Pages' },
  { key: '7', name: 'Select Team' },
];

// Data for Processes
const processData = [
  { key: '1', id: '1', name: 'MSS' },
  { key: '2', id: '2', name: 'DTP' },
  { key: '3', id: '3', name: 'ProofReading' },
  { key: '4', id: '4', name: 'Factory' },
  { key: '5', id: '5', name: 'FinalQC' },
  { key: '6', id: '6', name: 'CTP' },
];

// Data for Features Configuration table
const featureConfigDataSource = [
  { key: '1', Module_ID: '1', Configurations: { P1: true, P2: false, P3: true, P4: false, P5: true, P6: false } },
  { key: '2', Module_ID: '2', Configurations: { P1: true, P2: true, P3: false, P4: true, P5: false, P6: true } },
  { key: '3', Module_ID: '3', Configurations: { P1: false, P2: true, P3: true, P4: false, P5: true, P6: true } },
];

const SystemSettings = () => {
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [features, setFeatures] = useState(initialFeatureList);
  const [processes, setProcesses] = useState(processData);
  const [featureConfigData, setFeatureConfigData] = useState(featureConfigDataSource);

  const [featureName, setFeatureName] = useState('');
  const [processName, setProcessName] = useState('');

  const showAddFeatureModal = () => {
    setFeatureModalVisible(true);
  };

  const handleAddFeature = () => {
    if (featureName) {
      const newFeature = {
        key: (features.length + 1).toString(),
        name: featureName,
      };
      setFeatures([...features, newFeature]);
      setFeatureName('');
      setFeatureModalVisible(false);
      notification.success({ message: 'Module added successfully!' });
    }
  };

  const showAddProcessModal = () => {
    setProcessModalVisible(true);
  };

  const handleAddProcess = () => {
    if (processName) {
      const newProcess = {
        key: (processes.length + 1).toString(),
        id: `P${processes.length + 1}`,
        name: processName,
      };
      setProcesses([...processes, newProcess]);
      setProcessName('');
      setProcessModalVisible(false);

      // Add the new process to each module's configurations
      const updatedFeatureConfigData = featureConfigData.map((config) => ({
        ...config,
        Configurations: { ...config.Configurations, [newProcess.id]: false },
      }));
      setFeatureConfigData(updatedFeatureConfigData);
      notification.success({ message: 'Process added successfully!' });
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

  // Columns for Feature Configuration Table
  const featureConfigColumns = [
    {
      title: 'Module Name',
      dataIndex: 'Module_ID',
      key: 'Module_ID',
      render: (moduleId) => {
        const module = features.find((f) => f.key === moduleId);
        return module ? module.name : 'Unknown';
      },
    },
    // Dynamic columns for each process
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

  // Drag-and-Drop Handlers
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Check if the destination is valid
    if (!destination || source.index === destination.index) {
      return;
    }

    // Create a new features array
    const updatedFeatures = Array.from(features);
    const [movedFeature] = updatedFeatures.splice(source.index, 1);
    updatedFeatures.splice(destination.index, 0, movedFeature);

    // Update state with the new order
    setFeatures(updatedFeatures);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Tabs defaultActiveKey="1">
        {/* Features Tab */}
        <TabPane 
          tab={
            <span>
              <AppstoreAddOutlined style={{ fontSize: '25px', marginRight: '8px' }} /> 
              Module
            </span>
          } 
          key="1"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Module List</h3>
            <Button type="primary" onClick={showAddFeatureModal}>
              Add New Module
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
                        title: 'Module Name',
                        dataIndex: 'name',
                        key: 'name',
                        render: (text, record, index) => (
                          <Draggable key={record.key} draggableId={record.key} index={index}>
                            {(provided) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                {...provided.dragHandleProps}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  padding: '8px', 
                                  border: '1px solid #ddd', 
                                  marginBottom: '4px', 
                                  borderRadius: '4px', 
                                  backgroundColor: 'white', 
                                  ...provided.draggableProps.style 
                                }}
                              >
                                {text}
                              </div>
                            )}
                          </Draggable>
                        ),
                      },
                    ]} 
                    rowKey="key"
                    pagination={false}
                    style={{ marginTop: '16px' }} 
                    className="features-table"
                  />
                  {provided.placeholder} {/* This is necessary for the droppable to work */}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Modal
            title="Add Module"
            visible={featureModalVisible}
            onOk={handleAddFeature}
            onCancel={() => setFeatureModalVisible(false)}
          >
            <Input 
              placeholder="Module Name" 
              value={featureName} 
              onChange={(e) => setFeatureName(e.target.value)} 
            />
          </Modal>
        </TabPane>

        {/* Processes Tab */}
        <TabPane 
          tab={
            <span>
              <BuildOutlined style={{ fontSize: '25px', marginRight: '8px' }} /> 
              Processes
            </span>
          } 
          key="2"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Processes List</h3>
            <Button type="primary" onClick={showAddProcessModal}>
              Add New Process
            </Button>
          </div>
          <Table 
            dataSource={processes} 
            columns={[
              { title: 'Process ID', dataIndex: 'id', key: 'id' },
              { title: 'Process Name', dataIndex: 'name', key: 'name' }
            ]} 
            rowKey="id"
            pagination={false}
            style={{ marginTop: '16px' }} 
            className="processes-table"
          />

          <Modal
            title="Add Process"
            visible={processModalVisible}
            onOk={handleAddProcess}
            onCancel={() => setProcessModalVisible(false)}
          >
            <Input 
              placeholder="Process Name" 
              value={processName} 
              onChange={(e) => setProcessName(e.target.value)} 
            />
          </Modal>
        </TabPane>

        {/* Feature Configuration Tab */}
        <TabPane 
          tab={
            <span>
              <SettingOutlined style={{ fontSize: '25px', marginRight: '8px' }} /> 
              Feature Configuration
            </span>
          } 
          key="3"
        >
          <Table 
            dataSource={featureConfigData} 
            columns={featureConfigColumns} 
            rowKey="key"
            pagination={false}
            style={{ marginTop: '16px', borderCollapse: 'collapse' }} 
            className="feature-config-table"
            bordered
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
