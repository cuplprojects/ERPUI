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
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
    });

    // Fetch features
    const fetchFeatures = async () => {
        try {
            const response = await API.get('/Features');
            setFeatures(response.data.map(feature => ({ key: feature.featureId, name: feature.features })));
        } catch (error) {
            console.error('Error fetching features:', error);
            notification.error({ message: t('failedToFetchFeaturesPleaseTryAgain') });
        }
    };

    useEffect(() => {
        fetchFeatures();
    }, []);

    // Validation checks
    const validateFeature = (name) => {
        if (features.some(feature => feature.name.toLowerCase() === name.toLowerCase())) {
            notification.error({ message: t('featureNameAlreadyExists') });
            return false;
        }

        const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(name);
        const isOnlyLetters = /^[a-zA-Z]+$/.test(name);
        const isOnlyNumbers = /^[0-9]+$/.test(name);

        if (isAlphanumeric && !(isOnlyLetters || isOnlyNumbers)) {
            notification.error({ message: t('featureNameCannotContainBothLettersAndNumbers') });
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
            width: '8%',
            align: 'center',
            sorter: (a, b) => a.key - b.key
        },
        {
            title: 'Feature Name',
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
            <div className="button-container" style={{ marginBottom: '20px' }}>
                <Button
                    type="primary"
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