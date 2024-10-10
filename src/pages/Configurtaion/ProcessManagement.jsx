import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, Switch, Select, notification } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const ProcessManagement = ({ onUpdateProcesses, onAddProcess }) => {
    const [processModalVisible, setProcessModalVisible] = useState(false);
    const [processes, setProcesses] = useState([]);
    const [features, setFeatures] = useState([]); // State to store features
    const [isEditingProcess, setIsEditingProcess] = useState(false);
    const [editingProcessId, setEditingProcessId] = useState(null);
    const [processName, setProcessName] = useState('');
    const [processStatus, setProcessStatus] = useState(false);
    const [processWeightage, setProcessWeightage] = useState('');
    const [processInstalledFeatures, setProcessInstalledFeatures] = useState([]);

    // Fetch processes and features
    useEffect(() => {
        const fetchProcesses = async () => {
            const response = await fetch('https://localhost:7212/api/Processes');
            const data = await response.json();
            setProcesses(data.map(process => ({
                key: process.id.toString(),
                id: process.id,
                name: process.name,
                status: process.status,
                weightage: process.weightage,
                installedFeatures: Array.isArray(process.installedFeatures)
                    ? process.installedFeatures // Already an array
                    : process.installedFeatures.split(', ') // Split into array if it's a string
            })));
        };

        const fetchFeatures = async () => { // New function to fetch features
            const response = await fetch('https://localhost:7212/api/Features');
            const data = await response.json();
            setFeatures(data.map(feature => ({
                key: feature.featureId, // Assuming featureId is unique
                name: feature.features // Assuming features contains the feature name
            })));
        };

        fetchProcesses();
        fetchFeatures(); // Fetch features when component mounts
    }, []);

    // Open modal for adding/editing process
    const showAddProcessModal = (process = null) => {
        if (process) {
            setProcessName(process.name);
            setProcessStatus(process.status);
            setProcessWeightage(process.weightage.toString());
            setProcessInstalledFeatures(process.installedFeatures || []); // Ensure it's an array
            setIsEditingProcess(true);
            setEditingProcessId(process.id);
        } else {
            setProcessName('');
            setProcessStatus(false);
            setProcessWeightage('');
            setProcessInstalledFeatures([]); // Reset to empty array
            setIsEditingProcess(false);
            setEditingProcessId(null);
        }
        setProcessModalVisible(true);
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
            installedFeatures: processInstalledFeatures.join(', '), // Ensure it's a string
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
                    const processWithKey = { 
                        ...addedProcess, 
                        key: addedProcess.id.toString(), 
                        installedFeatures: processInstalledFeatures.join(', ') // Ensure installedFeatures is a string
                    };
                    setProcesses([...processes, processWithKey]);
                    notification.success({ message: 'Process added successfully!' });

                    // Notify parent component to update Feature Configuration
                    onAddProcess(processWithKey);
                } else {
                    notification.error({ message: 'Failed to add process!' });
                }
            } catch (error) {
                
            }
        }

        setProcessModalVisible(false);
        onUpdateProcesses(processes); // Call the parent update function
    };

    const processColumns = [
        { title: 'ID', dataIndex: 'key', key: 'key' },
        { title: 'Process Name', dataIndex: 'name', key: 'name' },
        { title: 'Weightage', dataIndex: 'weightage', key: 'weightage' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => <Switch checked={status} />,
        },
        {
            title: 'Installed Features',
            dataIndex: 'installedFeatures',
            key: 'installedFeatures',
            render: features => features, // Since it's already a string, just return it directly
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
        <div>
            <h3>Process Management</h3>


            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <Button type="primary" onClick={() => showAddProcessModal()}>Add New Process</Button>
      </div>
           
            <Table
                dataSource={processes}
                columns={processColumns}
                rowKey="key"
                pagination={false}
                bordered
                size="small"
            />

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
                <Input
                    placeholder="Weightage"
                    value={processWeightage}
                    onChange={e => setProcessWeightage(e.target.value)}
                    type="number"
                />
                <Switch
                    checked={processStatus}
                    onChange={checked => setProcessStatus(checked)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
                <Select
                    mode="multiple"
                    style={{ width: '100%', marginTop: 10 }}
                    placeholder="Select Features"
                    value={processInstalledFeatures}
                    onChange={setProcessInstalledFeatures}
                >
                    {features.map(feature => (
                        <Select.Option key={feature.key} value={feature.name}>
                            {feature.name}
                        </Select.Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
};

export default ProcessManagement;
