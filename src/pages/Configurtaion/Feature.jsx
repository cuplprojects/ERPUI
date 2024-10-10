import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, notification } from 'antd';
import { AppstoreAddOutlined, EditOutlined } from '@ant-design/icons';

const FeatureManagement = ({ onUpdateFeatures, onAddFeature }) => {
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [features, setFeatures] = useState([]);
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [featureName, setFeatureName] = useState('');

  // Fetch features
  useEffect(() => {
    const fetchFeatures = async () => {
      const response = await fetch('https://localhost:7212/api/Features');
      const data = await response.json();
      setFeatures(data.map(feature => ({ key: feature.featureId, name: feature.features })));
    };

    fetchFeatures();
  }, []);

  // Validation checks
  const validateFeature = (name) => {
    // Check for duplicate feature names
    if (features.some(feature => feature.name.toLowerCase() === name.toLowerCase())) {
      notification.error({ message: 'Feature name already exists!' });
      return false;
    }

    // Check if name is alphanumeric (must not be a combination of letters and numbers)
    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(name);
    const isOnlyLetters = /^[a-zA-Z]+$/.test(name);
    const isOnlyNumbers = /^[0-9]+$/.test(name);

    if (isAlphanumeric && !(isOnlyLetters || isOnlyNumbers)) {
      notification.error({ message: 'Feature name cannot contain both letters and numbers!' });
      return false;
    }

    return true;
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

  // Handle adding/updating feature
  const handleAddFeature = async () => {
    if (!featureName) {
      notification.error({ message: 'Feature name cannot be empty!' });
      return;
    }

    if (!validateFeature(featureName)) {
      return;
    }

    const featurePayload = {
      featureId: editingFeatureId || 0,
      features: featureName,
    };

    if (isEditingFeature) {
      // Update existing feature
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
      // Add new feature
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
          const newFeature = { key: addedFeature.featureId, name: addedFeature.features };
          setFeatures([...features, newFeature]);
          notification.success({ message: 'Feature added successfully!' });
          
          // Notify parent component to update Feature Configuration
          onAddFeature(newFeature);
        } else {
          notification.error({ message: 'Failed to add feature!' });
        }
      } catch (error) {
        notification.error({ message: 'An error occurred while adding the feature.' });
      }
    }

    setFeatureModalVisible(false);
    onUpdateFeatures(features); // Call the parent update function
  };

  // Handle 'Enter' key press in the Input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddFeature();
    }
  };

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

  // Function to get row style for striping
  const getRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff', // Light for even, white for odd
  });

  return (
    <div>
      <h3>Feature List</h3>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button type="primary" onClick={() => showAddFeatureModal()}>
          Add New Feature
        </Button>
      </div>
      <Table
        dataSource={features}
        columns={featureColumns}
        rowKey="key"
        pagination={false} // Disable pagination if you want to show all items
        bordered // Optional: Adds borders to the table
        size="small" // Make the table small
        rowClassName={(record, index) => getRowStyle(index)} // Apply inline styles for striped effect
      />

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
          onKeyPress={handleKeyPress} // Listen for 'Enter' key press
        />
      </Modal>
    </div>
  );
};

export default FeatureManagement;
