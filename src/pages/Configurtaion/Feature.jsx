import React, { useState, useEffect } from 'react';
import { Table, Button, Input, notification } from 'antd';
import { AppstoreAddOutlined, EditOutlined } from '@ant-design/icons';
import API from '../../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import { FaSearch } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import { AiFillCloseSquare } from 'react-icons/ai';

const FeatureManagement = ({ onUpdateFeatures, onAddFeature }) => {
    const { t } = useTranslation();
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const [featureModalVisible, setFeatureModalVisible] = useState(false);
    const [features, setFeatures] = useState([]);
    const [isEditingFeature, setIsEditingFeature] = useState(false);
    const [editingFeatureId, setEditingFeatureId] = useState(null);
    const [featureName, setFeatureName] = useState('');
    const [pageSize, setPageSize] = useState(5); // Default page size set to 5
    const [searchText, setSearchText] = useState('');

    // Fetch features
    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await API.get('/Features');
                setFeatures(response.data.map(feature => ({ key: feature.featureId, name: feature.features })));
            } catch (error) {
                console.error('Error fetching features:', error);
                notification.error({ message: t('failedToFetchFeaturesPleaseTryAgain') });
            }
        };

        fetchFeatures();
    }, []);

    // Validation checks
    const validateFeature = (name) => {
        // Check for duplicate feature names
        if (features.some(feature => feature.name.toLowerCase() === name.toLowerCase())) {
            notification.error({ message: t('featureNameAlreadyExists') });
            return false;
        }

        // Check if name is alphanumeric (must not be a combination of letters and numbers)
        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(name);
        const isOnlyLetters = /^[a-zA-Z]+$/.test(name);
        const isOnlyNumbers = /^[0-9]+$/.test(name);

        if (isAlphanumeric && !(isOnlyLetters || isOnlyNumbers)) {
            notification.error({ message: t('featureNameCannotContainBothLettersAndNumbers') });
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
            notification.error({ message: t('featureNameCannotBeEmpty') });
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
                const response = await API.put(`/Features/${editingFeatureId}`, featurePayload);
                setFeatures(prevFeatures =>
                    prevFeatures.map(feature =>
                        feature.key === editingFeatureId ? { ...feature, name: featureName } : feature
                    )
                );
                notification.success({ message: t('featureUpdatedSuccessfully') });
            } catch (error) {
                console.error('Error updating feature:', error);
                notification.error({ message: t('failedToUpdateFeature') });
            }
        } else {
            // Add new feature
            try {
                const response = await API.post('/Features', featurePayload);
                const addedFeature = response.data;
                const newFeature = { key: addedFeature.featureId, name: addedFeature.features };
                setFeatures([...features, newFeature]);
                notification.success({ message: t('featureAddedSuccessfully') });
                
                // Notify parent component to update Feature Configuration
                onAddFeature(newFeature);
            } catch (error) {
                console.error('Error adding feature:', error);
                notification.error({ message: t('failedToAddFeature') });
            }
        }

        setFeatureModalVisible(false);
        onUpdateFeatures(features); // Call the parent update function
    };

    // Handle key down event in the Input
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddFeature();
        }
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchText(value);
    };

    // Filter features based on search text
    const filteredFeatures = features.filter(feature =>
        feature.name.toLowerCase().includes(searchText.toLowerCase()) ||
        feature.key.toString().includes(searchText)
    );

    // Columns for Feature table
    const featureColumns = [
        { 
            title: t('sn'), 
            dataIndex: 'key', 
            key: 'key',
            width: '8%',
            align: 'center',
            sorter: (a, b) => a.key - b.key
        },
        { 
            title: t('featureName'), 
            dataIndex: 'name', 
            key: 'name',
            width: '65%',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: t('actions'),

            key: 'actions',
            width: '10%',
            align: 'center',
            render: (text, record) => (
                <Button 
                    icon={<EditOutlined />} 
                    onClick={() => showAddFeatureModal(record)}
                    type="primary"
                    size="large"
                    className={`${customBtn} d-flex align-items-center gap-1`}
                >
                    {t('edit')}
                </Button>

            ),
        },
    ];

    return (
        <div className="feature-management-container">
           
            <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: '20px' }}>
                <Button 
                    type="primary" 
                    className={`${customBtn}`}
                    onClick={() => showAddFeatureModal()}
                >
                    {t('addNewFeature')}
                </Button>
                <div className="d-flex align-items-center" style={{ width: '300px' }}>
                    <Input
                        placeholder={t('searchFeatures')}
                        value={searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        allowClear
                        className={`rounded-2 ${customDark === "dark-dark" ? `${customLightBorder} text-dark` : customDarkText} ${customDarkBorder} rounded-end-0`}
                    />
                    <Button
                        className={`rounded-2 ${customBtn} ${customDark === "dark-dark" ? 'border-white' : 'border-0'} rounded-start-0`}
                        style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaSearch size={20}/>
                    </Button>
                </div>
            </div>
            <Table
                dataSource={filteredFeatures}
                columns={featureColumns}
                rowKey="key"
                pagination={{ 
                    pageSize: pageSize,
                    current: 1,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '15'],
                    onShowSizeChange: (current, size) => {
                        setPageSize(size);
                    },
                    className: `bg-white p-3 rounded rounded-top-0`
                }}
                bordered
                size="small"
                scroll={{ x: 'max-content' }}
                className={`${customDark === "default-dark" ? "thead-default" : ""}
                ${customDark === "red-dark" ? "thead-red" : ""}
                ${customDark === "green-dark" ? "thead-green" : ""}
                ${customDark === "blue-dark" ? "thead-blue" : ""}
                ${customDark === "dark-dark" ? "thead-dark" : ""}
                ${customDark === "pink-dark" ? "thead-pink" : ""}
                ${customDark === "purple-dark" ? "thead-purple" : ""}
                ${customDark === "light-dark" ? "thead-light" : ""}
                ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination`}
            />

            {/* Feature Modal */}
            <Modal
                show={featureModalVisible}
                onHide={() => setFeatureModalVisible(false)}
                centered
                size="lg"
                className={`rounded-2 ${customDark === "" ? `${customDark}` : ''}`}
            >
                <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between`}>
                    <Modal.Title>{isEditingFeature ? t('editFeature') : t('addFeature')}</Modal.Title>
                    <AiFillCloseSquare
                        size={35}
                        onClick={() => setFeatureModalVisible(false)}
                        className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
                        aria-label="Close"
                    />
                </Modal.Header>
                <Modal.Body className={`${customDarkText} ${customLight}`}>
                    <Input
                        placeholder={t('enterFeatureName')}
                        value={featureName}
                        onChange={e => setFeatureName(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </Modal.Body>
                <Modal.Footer className={`rounded-bottom-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border`}>
                    <Button className={`${customBtn}`} onClick={handleAddFeature}>
                        {isEditingFeature ? t('update') : t('add')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FeatureManagement;
