import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, notification } from 'antd';
import { AppstoreAddOutlined, EditOutlined } from '@ant-design/icons';
import API from '../../CustomHooks/MasterApiHooks/api';

const FeatureManagement = ({ onUpdateFeatures, onAddFeature }) => {
    const [featureModalVisible, setFeatureModalVisible] = useState(false);
    const [features, setFeatures] = useState([]);
    const [isEditingFeature, setIsEditingFeature] = useState(false);
    const [editingFeatureId, setEditingFeatureId] = useState(null);
    const [featureName, setFeatureName] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
    });

    // Fetch features
    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await API.get('/Features');
                setFeatures(response.data.map(feature => ({ key: feature.featureId, name: feature.features })));
            } catch (error) {
                console.error('Error fetching features:', error);
                notification.error({ message: 'Failed to fetch features. Please try again.' });
            }
        };

        fetchFeatures();
    }, []);

    // Validation checks
    const validateFeature = (name) => {
        if (features.some(feature => feature.name.toLowerCase() === name.toLowerCase())) {
            notification.error({ message: 'Feature name already exists!' });
            return false;
        }

        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(name);
        const isOnlyLetters = /^[a-zA-Z]+$/.test(name);
        const isOnlyNumbers = /^[0-9]+$/.test(name);

        if (isAlphanumeric && !(isOnlyLetters || isOnlyNumbers)) {
            notification.error({ message: 'Feature name cannot contain both letters and numbers!' });
            return false;
        }

        return true;
    };

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
            try {
                const response = await API.put(`/Features/${editingFeatureId}`, featurePayload);
                setFeatures(prevFeatures =>
                    prevFeatures.map(feature =>
                        feature.key === editingFeatureId ? { ...feature, name: featureName } : feature
                    )
                );
                notification.success({ message: 'Feature updated successfully!' });
            } catch (error) {
                console.error('Error updating feature:', error);
                notification.error({ message: 'Failed to update feature!' });
            }
        } else {
            try {
                const response = await API.post('/Features', featurePayload);
                const addedFeature = response.data;
                const newFeature = { key: addedFeature.featureId, name: addedFeature.features };
                setFeatures([...features, newFeature]);
                notification.success({ message: 'Feature added successfully!' });
                onAddFeature(newFeature);
            } catch (error) {
                console.error('Error adding feature:', error);
            }
        }

        setFeatureModalVisible(false);
        onUpdateFeatures(features);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddFeature();
        }
    };

    const featureColumns = [
        {
            title: 'SN',
            dataIndex: 'key',
            key: 'key',
            width: '15%',
            align: 'center'
        },
        {
            title: 'Feature Name',
            dataIndex: 'name',
            key: 'name',
            width: '65%'
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '20%',
            align: 'center',
            render: (text, record) => (
                <Button
                    icon={<EditOutlined />}
                    onClick={() => showAddFeatureModal(record)}
                    type="primary"
                    size="large"
                >
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <div className="feature-management-container">
            <div className="button-container" style={{ marginBottom: '20px' }}>
                <Button
                    type="primary"
                    onClick={() => showAddFeatureModal()}
                >
                    Add New Feature
                </Button>
            </div>
            <Table
                dataSource={features}
                columns={featureColumns}
                rowKey="key"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: features.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    onChange: (page, pageSize) => {
                        setPagination({
                            current: page,
                            pageSize: pageSize,
                        });
                    },
                }}
                bordered
                size="small"
                scroll={{ x: 'max-content' }}
                style={{
                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
            />

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
                    onKeyDown={handleKeyDown}
                />
            </Modal>
        </div>
    );
};

export default FeatureManagement;
