import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Switch, Select, notification } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import API from '../../CustomHooks/MasterApiHooks/api';

const ProcessManagement = ({ onUpdateProcesses, onAddProcess = () => {} }) => {
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [processes, setProcesses] = useState([]);
    const [features, setFeatures] = useState([]);
    const [isEditingProcess, setIsEditingProcess] = useState(false);
    const [editingProcessId, setEditingProcessId] = useState(null);
    const [processName, setProcessName] = useState('');
    const [processStatus, setProcessStatus] = useState(false);
    const [processWeightage, setProcessWeightage] = useState(0);
    const [processInstalledFeatures, setProcessInstalledFeatures] = useState([]);
    const [processIdInput, setProcessIdInput] = useState(0);
    const [processType, setProcessType] = useState('');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');

    useEffect(() => {
        const fetchProcesses = async () => {
            try {
                const response = await API.get('/Processes');
                setProcesses(response.data.map(process => ({
                    key: process.id.toString(),
                    ...process,
                })));
            } catch (error) {
                console.error('Error fetching processes:', error);
                notification.error({ message: 'Failed to fetch processes' });
            }
        };

        const fetchFeatures = async () => {
            try {
                const response = await API.get('/Features');
                setFeatures(response.data.map(feature => ({
                    key: feature.featureId,
                    id: feature.featureId,
                    name: feature.features,
                })));
            } catch (error) {
                console.error('Error fetching features:', error);
                notification.error({ message: 'Failed to fetch features' });
            }
        };

        fetchProcesses();
        fetchFeatures();
    }, []);

    const showAddProcessModal = (process = null) => {
        if (process) {
            setProcessName(process.name);
            setProcessStatus(process.status);
            setProcessWeightage(process.weightage);
            setProcessInstalledFeatures(process.installedFeatures || []);
            setProcessIdInput(process.processIdInput);
            setProcessType(process.processType);
            setIsEditingProcess(true);
            setEditingProcessId(process.id);
            setRangeStart(process.processType === 'Dependent' ? '' : (process.rangeStart || ''));
            setRangeEnd(process.rangeEnd || '');
        } else {
            setProcessName('');
            setProcessStatus(false);
            setProcessWeightage(0);
            setProcessInstalledFeatures([]);
            setProcessIdInput(0);
            setProcessType('');
            setIsEditingProcess(false);
            setEditingProcessId(null);
            setRangeStart('');
            setRangeEnd('');
        }
        setProcessModalVisible(true);
    };

    const handleAddProcess = async () => {
        if (!processName) {
            notification.error({ message: 'Process name cannot be empty!' });
            return;
        }

        // Check for duplicate process names
        const isDuplicate = processes.some(process => process.name === processName && process.id !== editingProcessId);
        if (isDuplicate) {
            notification.error({ message: 'Process with this name already exists!' });
            return;
        }

        const newProcess = {
            id: editingProcessId || 0,
            name: processName,
            weightage: processWeightage,
            status: processStatus,
            installedFeatures: processInstalledFeatures.map(Number),
            processIdInput,
            processType,
            rangeStart: processType === 'Dependent' ? '' : (rangeStart || 0),
            rangeEnd: rangeEnd || 0,
        };

        try {
            let response;
            if (isEditingProcess) {
                response = await API.put(`/Processes/${editingProcessId}`, newProcess);
            } else {
                response = await API.post('/Processes', newProcess);
            }

            let processWithKey = response.data;
            processWithKey.key = processWithKey.id.toString();

            if (isEditingProcess) {
                setProcesses(prevProcesses =>
                    prevProcesses.map(process =>
                        process.id === editingProcessId ? processWithKey : process
                    )
                );
                notification.success({ message: 'Process updated successfully!' });
            } else {
                setProcesses(prevProcesses => [...prevProcesses, processWithKey]);
                notification.success({ message: 'Process added successfully!' });
                onAddProcess(processWithKey);  // Call the optional prop if provided
            }

            setProcessModalVisible(false);
            onUpdateProcesses([...processes, processWithKey]);
        } catch (error) {
            console.error('Error saving process:', error);
            notification.error({ message: error.response?.data || 'Failed to save process' });
        }
    };

    const processColumns = [
        { title: 'ID', dataIndex: 'key', key: 'key' },
        { title: 'Process Name', dataIndex: 'name', key: 'name' },
        { title: 'Weightage', dataIndex: 'weightage', key: 'weightage' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => <Switch checked={status} disabled />
        },
        {
            title: 'Installed Features',
            dataIndex: 'featureNames',
            key: 'featureNames',
            render: features => features?.join(', ') || 'None',
        },
        { title: 'Process Order', dataIndex: 'processIdInput', key: 'processIdInput' },
        { title: 'Process Type', dataIndex: 'processType', key: 'processType' },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <Button
                    icon={<EditOutlined />}
                    onClick={() => showAddProcessModal(record)}
                />
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <Button type="primary" onClick={() => showAddProcessModal()}>
                    Add New Process
                </Button>
            </div>

            <Table columns={processColumns} dataSource={processes} pagination={false} />

            <Modal
                title={isEditingProcess ? 'Edit Process' : 'Add Process'}
                visible={processModalVisible}
                onCancel={() => setProcessModalVisible(false)}
                onOk={handleAddProcess}
            >
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="processName">Process Name:</label>
                    <Input
                        id="processName"
                        placeholder="Process Name"
                        value={processName}
                        onChange={e => setProcessName(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="processWeightage">Weightage:</label>
                    <Input
                        id="processWeightage"
                        placeholder="Weightage"
                        type="number"
                        value={processWeightage || ''}
                        onChange={e => setProcessWeightage(e.target.value ? parseFloat(e.target.value) : '')}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="processInstalledFeatures">Installed Features:</label>
                    <Select
                        id="processInstalledFeatures"
                        mode="multiple"
                        placeholder="Installed Features"
                        value={processInstalledFeatures}
                        onChange={setProcessInstalledFeatures}
                        style={{ width: '100%' }}
                    >
                        {features.map(feature => (
                            <Select.Option key={feature.key} value={feature.id}>
                                {feature.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="processOrder">Process Order:</label>
                    <Input
                        id="processOrder"
                        placeholder="Process Order"
                        type="number"
                        value={processIdInput || ''}
                        onChange={e => setProcessIdInput(e.target.value ? parseInt(e.target.value) : 0)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="processType">Process Type:</label>
                    <Select
                        id="processType"
                        placeholder="Process Type"
                        value={processType}
                        onChange={(value) => {
                            setProcessType(value);
                            if (value === 'Dependent') {
                                setRangeStart('');
                            } else {
                                setRangeStart('');
                                setRangeEnd('');
                            }
                        }}
                        style={{ width: '100%' }}
                    >
                        <Select.Option value="Independent">Independent</Select.Option>
                        <Select.Option value="Dependent">Dependent</Select.Option>
                    </Select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="processStatus">Status:</label>
                    <Switch
                        id="processStatus"
                        checked={processStatus}
                        onChange={setProcessStatus}
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        style={{ width: '22%' }}
                    />
                </div>
                {processType === 'Independent' && (
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="rangeStart">Range Start:</label>
                            <Input
                                id="rangeStart"
                                placeholder="Range Start"
                                value={rangeStart}
                                onChange={e => setRangeStart(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="rangeEnd">Range End:</label>
                            <Input
                                id="rangeEnd"
                                placeholder="Range End"
                                value={rangeEnd}
                                onChange={e => setRangeEnd(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                )}
                {processType === 'Dependent' && (
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="rangeEnd">Range End:</label>
                        <Input
                            id="rangeEnd"
                            placeholder="Range End"
                            value={rangeEnd}
                            onChange={e => setRangeEnd(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProcessManagement;
