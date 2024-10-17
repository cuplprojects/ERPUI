import { message, Table, Input, Button, Switch, Form, Select, Spin, Modal } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'antd/es/form/Form';
import API from '../CustomHooks/MasterApiHooks/api';

const { Option } = Select;

const Type = () => {
    const [types, setTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [processMap, setProcessMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingType, setEditingType] = useState('');
    const [editingProcessIds, setEditingProcessIds] = useState([]);
    const [editingStatus, setEditingStatus] = useState(true);
    const [originalData, setOriginalData] = useState({});
    const [form] = useForm();

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const response = await API.get('/PaperTypes');
            setTypes(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProcesses = async () => {
        setLoading(true);
        try {
            const response = await API.get('/Processes');
            setProcesses(response.data);
            const map = response.data.reduce((acc, proc) => {
                acc[proc.id] = proc.name;
                return acc;
            }, {});
            setProcessMap(map);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
        fetchProcesses();
    }, []);

    const handleAddType = async (values) => {
        try {
            const response = await API.post('/PaperTypes', values);
            setTypes(prev => [...prev, response.data]);
            message.success("Type created successfully");
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error('Failed to add Type')
        }
    };

    const handleEditSave = async (index) => {
        const updatedType = {
            ...types[index],
            types: editingType,
            associatedProcessId: editingProcessIds,
            status: editingStatus,
        };

        try {
            await API.put(`/PaperTypes/${updatedType.typeId}`, updatedType);
            const updatedTypes = [...types];
            updatedTypes[index] = updatedType;
            setTypes(updatedTypes);
            message.success('Type updated successfully!');
            setEditingIndex(null);
        } catch (error) {
            console.error(error);
            message.error('Failed to update Type');
        }
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditingType(originalData.types);
        setEditingProcessIds(originalData.associatedProcessId);
        setEditingStatus(originalData.status);
    };

    const columns = [
        {
            title: 'SN.',
            dataIndex: 'serial',
            key: 'serial',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Type',
            dataIndex: 'types',
            key: 'types',
            render: (text, record, index) => (
                editingIndex === index ? (
                    <Input
                        value={editingType}
                        onChange={(e) => setEditingType(e.target.value)}
                        onPressEnter={() => handleEditSave(index)}
                        onBlur={() => handleEditSave(index)}
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
        },
        {
            title: 'Associated Process',
            dataIndex: 'associatedProcessId',
            key: 'associatedProcessId',
            render: (ids, record, index) => (
                editingIndex === index ? (
                    <Select
                        mode="multiple"
                        value={editingProcessIds}
                        onChange={setEditingProcessIds}
                        style={{ width: '100%' }}
                        onBlur={() => handleEditSave(index)}
                    >
                        {processes.map(proc => (
                            <Option key={proc.id} value={proc.id}>
                                {proc.name}
                            </Option>
                        ))}
                    </Select>
                ) : (
                    ids.map(id => processMap[id]).join(', ')
                )
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record, index) => (
                editingIndex === index ? (
                    <Switch
                        checked={editingStatus}
                        onChange={setEditingStatus}
                        onBlur={() => handleEditSave(index)}
                    />
                ) : (
                    <Switch checked={status} disabled />
                )
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record, index) => (
                editingIndex === index ? (
                    <>
                        <Button type="link" onClick={() => handleEditSave(index)}>Save</Button>
                        <Button type="link" onClick={handleCancelEdit}>Cancel</Button>
                    </>
                ) : (
                    <Button type="link" onClick={() => {
                        setEditingIndex(index);
                        setEditingType(record.types);
                        setEditingProcessIds(record.associatedProcessId);
                        setEditingStatus(record.status);
                        setOriginalData(record); // Store the original data
                    }}>Edit</Button>
                )
            ),
        },
    ];

    return (
        <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                    Add Type
                </Button>
            </div>

            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    dataSource={types.map((item, index) => ({ ...item, serial: index + 1 }))}
                    columns={columns}
                    rowKey="typeId"
                    pagination={false}
                    bordered
                />
            )}

            <Modal
                title="Add Type"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleAddType}
                    layout="vertical"
                >
                    <Form.Item
                        name="types"
                        label="Type"
                        rules={[
                            { required: true, message: 'Please input type!' },
                            {
                                validator: (_, value) => {
                                    const isNumeric = /^\d+$/;
                                    if (value && isNumeric.test(value)) {
                                        return Promise.reject(new Error('Type cannot contain only numbers!'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input placeholder="Type" />
                    </Form.Item>
                    <Form.Item
                        name="associatedProcessId"
                        label="Associated Process"
                        rules={[{ required: true, message: 'Please select a process!' }]}
                    >
                        <Select mode="multiple" placeholder="Select Process">
                            {processes.map(proc => (
                                <Option key={proc.id} value={proc.id}>
                                    {proc.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="status" label="Status" valuePropName="checked" initialValue={true}>
                        <Switch />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Type;
