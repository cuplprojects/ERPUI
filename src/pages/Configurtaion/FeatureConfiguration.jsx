import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, Select, Switch, message } from 'antd';
import './FeatureConfiguration.css';
import API from '../../CustomHooks/MasterApiHooks/api';

const FeatureConfiguration = () => {
    const [features, setFeatures] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [checkedFeatures, setCheckedFeatures] = useState({});

    const fetchProcesses = async () => {
        try {
            const response = await API.get('/Processes');
            setProcesses(response.data);
            console.log('Fetched processes:', response.data);
        } catch (error) {
            console.error("Failed to fetch processes", error);
        }
    };

    const fetchFeatures = async () => {
        try {
            const response = await API.get('/Features');
            setFeatures(response.data);
            console.log('Fetched features:', response.data);
        } catch (error) {
            console.error("Failed to fetch features", error);
        }
    };

    useEffect(() => {
        fetchProcesses();
        fetchFeatures();
    }, []);

    const handleSwitchChange = async (processId, featureId, checked) => {
        try {
            const process = processes.find(p => p.id === processId);
            let updatedInstalledFeatures = [...(process.installedFeatures || [])];
            
            if (checked) {
                updatedInstalledFeatures.push(featureId);
            } else {
                updatedInstalledFeatures = updatedInstalledFeatures.filter(id => id !== featureId);
            }

            await API.put(`/Processes/${processId}`, {
                ...process,
                installedFeatures: updatedInstalledFeatures
            });

            setProcesses(prevProcesses => prevProcesses.map(p => 
                p.id === processId ? {...p, installedFeatures: updatedInstalledFeatures} : p
            ));

            setCheckedFeatures(prev => ({
                ...prev,
                [processId]: {
                    ...prev[processId],
                    [featureId]: checked
                }
            }));

            message.success(`Feature ${checked ? 'enabled' : 'disabled'} successfully`);
        } catch (error) {
            console.error("Failed to update process", error);
            message.error("Failed to update feature. Please try again.");
        }
    };

    const columns = [
        {
            title: 'Process Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text || 'Unnamed Process'}</span>,
        },
        ...features.map(feature => ({
            title: feature.features,
            dataIndex: feature.featureId,
            key: feature.featureId,
            render: (_, process) => {
                const isChecked = checkedFeatures[process.id]?.[feature.featureId] ||
                    (process.installedFeatures && process.installedFeatures.includes(feature.featureId));
                return (
                    <Switch
                        checked={isChecked}
                        onChange={(checked) => handleSwitchChange(process.id, feature.featureId, checked)}
                        size="small"
                    />
                );
            },
            align: 'center',
        })),
    ];

    return (
        <div className="feature-configuration-container">
           
            <Table
                rowKey="id"
                dataSource={processes}
                columns={columns}
                pagination={false}
                bordered
                style={{ 
                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    
                }}
            />
        </div>
    );
};

export default FeatureConfiguration;
