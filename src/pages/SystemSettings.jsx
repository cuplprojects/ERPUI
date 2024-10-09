import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Input, Switch, Select, notification } from 'antd';
import { AppstoreAddOutlined, BuildOutlined, EditOutlined } from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { TabPane } = Tabs;

const ItemType = 'FEATURE';

const DraggableRow = ({ index, moveRow, className, style, ...restProps }) => {
  const ref = React.useRef();
  const [, drop] = useDrop({
    accept: ItemType,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      style={{ ...style, opacity: isDragging ? 0.5 : 1 }}
      {...restProps}
    />
  );
};

const SystemSettings = () => {
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [features, setFeatures] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [isEditingProcess, setIsEditingProcess] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [editingProcessId, setEditingProcessId] = useState(null);
  const [featureName, setFeatureName] = useState('');
  const [processName, setProcessName] = useState('');
  const [processStatus, setProcessStatus] = useState(false);
  const [processWeightage, setProcessWeightage] = useState('');
  const [processInstalledFeatures, setProcessInstalledFeatures] = useState([]);

  // Fetch features and processes
  useEffect(() => {
    const fetchFeatures = async () => {
      const response = await fetch('https://localhost:7212/api/Features');
      const data = await response.json();
      setFeatures(data.map(feature => ({ key: feature.featureId, name: feature.features })));
    };

    const fetchProcesses = async () => {
      const response = await fetch('https://localhost:7212/api/Processes');
      const data = await response.json();
      setProcesses(data.map(process => ({
        key: process.id.toString(),
        id: process.id,
        name: process.name,
        status: process.status,
        weightage: process.weightage,
        installedFeatures: process.installedFeatures,
      })));
    };

    fetchFeatures();
    fetchProcesses();
  }, []);

  // Move rows in the Feature Table and update Feature Configuration Table
  const moveFeatureRow = (dragIndex, hoverIndex) => {
    const updatedFeatures = [...features];
    const draggedRow = updatedFeatures.splice(dragIndex, 1)[0];
    updatedFeatures.splice(hoverIndex, 0, draggedRow);
    setFeatures(updatedFeatures);
  };

  const components = {
    body: {
      row: DraggableRow,
    },
  };

  // Open modal for adding/editing feature
  const showAddFeatureModal = (feature = null) => {
    if (feature) {
      setFeatureName(feature.name);
      setIsEditingFeature(true);
      setEditingFeatureId(feature.key);
    } else {
      setFeatureName('');
      setIsEditingFeature(false);
      setEditingFeatureId(null);
    }
    setFeatureModalVisible(true);
  };

  // Open modal for adding/editing process
  const showAddProcessModal = (process = null) => {
    if (process) {
      setProcessName(process.name);
      setProcessStatus(process.status);
      setProcessWeightage(process.weightage.toString());
      setProcessInstalledFeatures(process.installedFeatures.split(', '));
      setIsEditingProcess(true);
      setEditingProcessId(process.id);
    } else {
      setProcessName('');
      setProcessStatus(false);
      setProcessWeightage('');
      setProcessInstalledFeatures([]);
      setIsEditingProcess(false);
      setEditingProcessId(null);
    }
    setProcessModalVisible(true);
  };

  // Handle adding/updating feature
  const handleAddFeature = async () => {
    if (!featureName) {
      notification.error({ message: 'Feature name cannot be empty!' });
      return;
    }

    const featurePayload = {
      featureId: editingFeatureId || 0, 
      features: featureName,
    };

    if (isEditingFeature) {
      try {
        const response = await fetch(`https://localhost:7212/api/Features/${editingFeatureId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
          },
          body: JSON.stringify(featurePayload),
        });

        if (response.ok) {
          setFeatures(prevFeatures =>
            prevFeatures.map(feature =>
              feature.key === editingFeatureId ? { ...feature, name: featureName } : feature
            )
          );
          notification.success({ message: 'Feature updated successfully!' });
        } else {
          notification.error({ message: 'Failed to update feature!' });
        }
      } catch (error) {
        notification.error({ message: 'An error occurred while updating the feature.' });
      }
    } else {
      try {
        const response = await fetch('https://localhost:7212/api/Features', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
          },
          body: JSON.stringify(featurePayload),
        });

        if (response.ok) {
          const addedFeature = await response.json();
          setFeatures([...features, { key: addedFeature.featureId, name: addedFeature.features }]);
          notification.success({ message: 'Feature added successfully!' });
        } else {
          notification.error({ message: 'Failed to add feature!' });
        }
      } catch (error) {
        notification.error({ message: 'An error occurred while adding the feature.' });
      }
    }

    setFeatureModalVisible(false);
  };

  // Handle adding/updating process
  const handleAddProcess = async () => {
    if (!processName) {
      notification.error({ message: 'Process name cannot be empty!' });
      return;
    }

    const newProcess = {
      id: editingProcessId || 0,
      name: processName,
      weightage: parseFloat(processWeightage),
      status: processStatus,
      installedFeatures: processInstalledFeatures.join(', '),
    };

    if (isEditingProcess) {
      try {
        const response = await fetch(`https://localhost:7212/api/Processes/${editingProcessId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
          },
          body: JSON.stringify(newProcess),
        });

        if (response.ok) {
          setProcesses(prevProcesses =>
            prevProcesses.map(process =>
              process.id === editingProcessId ? { ...process, ...newProcess } : process
            )
          );
          notification.success({ message: 'Process updated successfully!' });
        } else {
          notification.error({ message: 'Failed to update process!' });
        }
      } catch (error) {
        notification.error({ message: 'An error occurred while updating the process.' });
      }
    } else {
      try {
        const response = await fetch('https://localhost:7212/api/Processes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
          },
          body: JSON.stringify(newProcess),
        });

        if (response.ok) {
          const addedProcess = await response.json();
          setProcesses([...processes, { key: addedProcess.id.toString(), ...newProcess }]);
          notification.success({ message: 'Process added successfully!' });
        } else {
          notification.error({ message: 'Failed to add process!' });
        }
      } catch (error) {
        notification.error({ message: 'An error occurred while adding the process.' });
      }
    }

    setProcessModalVisible(false);
  };

  // Columns for Feature Configuration table
  const featureConfigurationColumns = [
    { title: 'Feature Name', dataIndex: 'name', key: 'name' },
    ...processes.map((process) => ({
      title: process.name,
      dataIndex: process.name,
      key: process.name,
      render: (text, record) => (
        <Switch
          checked={featureConfigurationColumns.process}
          
        />
      ),
    })),
  ];

  // Columns for Feature table
  const featureColumns = [
    { title: 'ID', dataIndex: 'key', key: 'key' },
    { title: 'Feature Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button icon={<EditOutlined />} onClick={() => showAddFeatureModal(record)}>
          Edit
        </Button>
      ),
    },
  ];

  // Columns for Process table with Installed Features included
  const processColumns = [
    { title: 'ID', dataIndex: 'key', key: 'key' },
    { title: 'Process Name', dataIndex: 'name', key: 'name' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: status => (status ? 'Active' : 'Inactive') },
    { title: 'Weightage', dataIndex: 'weightage', key: 'weightage' },
    {
      title: 'Installed Features',
      dataIndex: 'installedFeatures',
      key: 'installedFeatures',
      render: (installedFeatures) => installedFeatures ? installedFeatures.split(', ').join(', ') : 'None',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button icon={<EditOutlined />} onClick={() => showAddProcessModal(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <DndProvider backend={HTML5Backend}>
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <AppstoreAddOutlined style={{ fontSize: '25px', marginRight: '8px' }} /> Feature
              </span>
            }
            key="1"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Feature List</h3>
              <Button type="primary" onClick={() => showAddFeatureModal()}>Add New Feature</Button>
            </div>
            <Table
              dataSource={features}
              columns={featureColumns}
              components={components}
              onRow={(record, index) => ({
                index,
                moveRow: moveFeatureRow,
              })}
              rowKey="key"
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <BuildOutlined style={{ fontSize: '25px', marginRight: '8px' }} /> Processes
              </span>
            }
            key="2"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Process List</h3>
              <Button type="primary" onClick={() => showAddProcessModal()}>Add New Process</Button>
            </div>
            <Table dataSource={processes} columns={processColumns} />
          </TabPane>

          <TabPane
            tab={<span>Feature Configuration</span>}
            key="3"
          >
            <h3>Feature Configuration</h3>
            <Table
              dataSource={features.map(feature => ({
                key: feature.key,
                name: feature.name,
                installedFeatures: feature.installedFeatures || [],
              }))}
              columns={featureConfigurationColumns}
            />
          </TabPane>
        </Tabs>

        {/* Feature Modal */}
        <Modal
          title={isEditingFeature ? 'Edit Feature' : 'Add Feature'}
          visible={featureModalVisible}
          onOk={handleAddFeature}
          onCancel={() => setFeatureModalVisible(false)}
        >
          <Input
            placeholder="Enter feature name"
            value={featureName}
            onChange={e => setFeatureName(e.target.value)}
          />
        </Modal>

        {/* Process Modal */}
        <Modal
          title={isEditingProcess ? 'Edit Process' : 'Add Process'}
          visible={processModalVisible}
          onOk={handleAddProcess}
          onCancel={() => setProcessModalVisible(false)}
        >
          <Input
            placeholder="Enter process name"
            value={processName}
            onChange={e => setProcessName(e.target.value)}
          />
          <Switch
            checked={processStatus}
            onChange={checked => setProcessStatus(checked)}
            style={{ marginTop: '10px' }}
          />
          <Input
            placeholder="Enter process weightage"
            value={processWeightage}
            onChange={e => setProcessWeightage(e.target.value)}
            style={{ marginTop: '10px' }}
          />
          <Select
            mode="multiple"
            placeholder="Select installed features"
            value={processInstalledFeatures}
            onChange={setProcessInstalledFeatures}
            style={{ marginTop: '10px', width: '100%' }}
          >
            {features.map(feature => (
              <Select.Option key={feature.key} value={feature.name}>
                {feature.name}
              </Select.Option>
            ))}
          </Select>
        </Modal>
      </DndProvider>
    </div>
  );
};

export default SystemSettings;