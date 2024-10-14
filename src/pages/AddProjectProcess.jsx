import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Select, Button, message, Table, Popconfirm } from 'antd';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import API from '../CustomHooks/MasterApiHooks/api';

const { Option } = Select;

// Draggable Table Row
const DraggableRow = ({ process, index, moveProcess, features, checkedFeatures, setCheckedFeatures, handleRemoveProcess }) => {
    const [, ref] = useDrag({
        type: 'PROCESS',
        item: { index },
    });

    const [, drop] = useDrop({
        accept: 'PROCESS',
        hover(item) {
            if (item.index !== index) {
                moveProcess(item.index, index);
                item.index = index; // Update the index of the dragged item
            }
        },
    });

    const handleCheckboxChange = (featureId) => {
        const updatedCheckedFeatures = checkedFeatures[process.id] || [];
        if (updatedCheckedFeatures.includes(featureId)) {
            updatedCheckedFeatures.splice(updatedCheckedFeatures.indexOf(featureId), 1);
        } else {
            updatedCheckedFeatures.push(featureId);
        }
        setCheckedFeatures(prev => ({ ...prev, [process.id]: updatedCheckedFeatures }));
    };

    return (
        <tr ref={node => ref(drop(node))}>
            <td>{process.name || 'Unnamed Process'}</td>
            {features.map(feature => {
                const isChecked = (checkedFeatures[process.id] || []).includes(feature.featureId) || 
                                  (process.installedFeatures && process.installedFeatures.includes(feature.featureId));
                return (
                    <td key={feature.featureId}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(feature.featureId)} 
                        />
                    </td>
                );
            })}
            <td>
                <Popconfirm
                    title="Are you sure to delete this process?"
                    onConfirm={() => handleRemoveProcess(process.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="danger">Remove</Button>
                </Popconfirm>
            </td>
        </tr>
    );
};

const AddProjectProcess = () => {
    const { projectId } = useParams();
    const [processes, setProcesses] = useState([]);
    const [selectedProcesses, setSelectedProcesses] = useState([]);
    const [features, setFeatures] = useState([]);
    const [isSequencing, setIsSequencing] = useState(false);
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
    
    const handleSelectProcess = (value) => {
        const selectedProcess = processes.filter(proc => value.includes(proc.id));
        setSelectedProcesses(selectedProcess);
        const initialCheckedFeatures = {};
        selectedProcess.forEach(proc => {
            initialCheckedFeatures[proc.id] = proc.installedFeatures || [];
        });
        setCheckedFeatures(initialCheckedFeatures);
    };

    const handleAddProcesses = () => {
        setIsSequencing(true);
    };

    const handleRemoveProcess = (processId) => {
        const updatedSelectedProcesses = selectedProcesses.filter(proc => proc.id !== processId);
        setSelectedProcesses(updatedSelectedProcesses);
        const updatedCheckedFeatures = { ...checkedFeatures };
        delete updatedCheckedFeatures[processId];
        setCheckedFeatures(updatedCheckedFeatures);
    };

    const moveProcess = (fromIndex, toIndex) => {
        const updatedProcesses = [...selectedProcesses];
        const [movedProcess] = updatedProcesses.splice(fromIndex, 1);
        updatedProcesses.splice(toIndex, 0, movedProcess);
        const updatedProcessesWithSequence = updatedProcesses.map((proc, index) => ({
            ...proc,
            sequence: index + 1,
        }));
        setSelectedProcesses(updatedProcessesWithSequence);
    };

    const handleSubmit = async () => {
        const projectProcesses = selectedProcesses.map((proc, index) => {
            const featuresList = checkedFeatures[proc.id] || [];
            return {
                projectId: parseInt(projectId),
                processId: proc.id,
                weightage: 0,
                sequence: index + 1,
                featuresList: featuresList,
            };
        });

        try {
            await API.post('/Project/AddProcessesToProject', { projectProcesses }, {
                headers: { 'Content-Type': 'application/json' },
            });
            message.success('Processes added successfully!');
            setSelectedProcesses([]);
            setCheckedFeatures({});
            setIsSequencing(false);
        } catch (error) {
            message.error('Error adding processes');
        }
    };

    const columns = [
        {
            title: 'Process Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => text || 'Unnamed Process',
        },
        ...features.map(feature => ({
            title: feature.features,
            dataIndex: feature.featureId,
            key: feature.featureId,
            render: (_, process) => null,
        })),
        {
            title: 'Action',
            key: 'action',
            render: (_, process) => (
                <Button type="danger" onClick={() => handleRemoveProcess(process.id)}>
                    Remove
                </Button>
            ),
        },
    ];

    return (
        <DndProvider backend={HTML5Backend}>
            <div>
                <div className="d-flex justify-content-around">
                    <h2>Add Project Process</h2>
                    <h2>Project {projectId}</h2>
                </div>
                <Select
                    mode="multiple"
                    placeholder="Select Processes"
                    onChange={handleSelectProcess}
                    style={{ width: '100%', marginBottom: '16px' }}
                >
                    {processes.map(proc => (
                        <Option key={proc.id} value={proc.id}>{proc.name}</Option>
                    ))}
                </Select>
                <Button type="primary" onClick={handleAddProcesses} disabled={selectedProcesses.length === 0} style={{ marginBottom: '16px' }}>
                    Confirm Selection
                </Button>
                {isSequencing && (
                    <div>
                        <Table
                            components={{
                                body: {
                                    row: (props) => <DraggableRow {...props} features={features} checkedFeatures={checkedFeatures} setCheckedFeatures={setCheckedFeatures} handleRemoveProcess={handleRemoveProcess} />, 
                                },
                            }}
                            rowKey="id"
                            dataSource={selectedProcesses}
                            columns={columns}
                            pagination={false}
                            onRow={(record, index) => ({
                                index,
                                moveProcess,
                                process: record,
                            })}
                        />
                        <Button type="primary" onClick={handleSubmit} disabled={selectedProcesses.length === 0} style={{ marginTop: '16px' }}>
                            Submit Processes
                        </Button>
                    </div>
                )}
            </div>
        </DndProvider>
    );
};

export default AddProjectProcess;
