import { message, Table, Input, Button, Switch, Form, Select, Spin } from 'antd';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'antd/es/form/Form';
import API from '../CustomHooks/MasterApiHooks/api';
import { useMediaQuery } from 'react-responsive';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { AiFillCloseSquare } from "react-icons/ai";
const { Option } = Select;
const { Search } = Input;

const Type = () => {
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const [types, setTypes] = useState([]);
    const [filteredTypes, setFilteredTypes] = useState([]);
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

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const response = await API.get('/PaperTypes');
            setTypes(response.data);
            setFilteredTypes(response.data);
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
            setFilteredTypes(prev => [...prev, response.data]);
            message.success("Type created successfully");
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error(error);
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
            setFilteredTypes(updatedTypes);
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

    const handleSearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = types.filter(item => 
            item.types.toLowerCase().includes(lowercasedValue) ||
            item.associatedProcessId.some(id => processMap[id].toLowerCase().includes(lowercasedValue))
        );
        setFilteredTypes(filtered);
    };

    const columns = [
        {
            align:'center',
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
            align:'center',
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record, index) => (
                editingIndex === index ? (
                    <Switch
                        checked={editingStatus}
                        onChange={setEditingStatus}
                        onBlur={() => handleEditSave(index)}
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                    />
                ) : (
                    <Switch 
                        checked={status} 
                        disabled 
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                    />
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
                        setOriginalData(record);
                    }}>Edit</Button>
                )
            ),
        },
    ];

    const responsiveColumns = isMobile ? columns.filter(col => col.key !== 'status') : columns;

    const handleClose = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <div style={{
            padding: isMobile ? '10px' : '20px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            overflow: 'auto'
        }}
        className={`${customDark === "dark-dark" ? customDark : ``}`}>
            <h2 className={`${customDarkText}`}>Project Type</h2>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isMobile ? '10px' : '20px'
            }}>
                <Search
                    placeholder="Search types or processes"
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Button className={`${customBtn}`} onClick={() => setIsModalVisible(true)}>
                    Add Type
                </Button>
            </div>

            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    dataSource={filteredTypes.map((item, index) => ({ ...item, serial: index + 1 }))}
                    columns={responsiveColumns}
                    rowKey="typeId"
                    pagination={false}
                    bordered
                    scroll={{ x: 'max-content' }}
                    className={`${customDark === "default-dark" ? "thead-default" : ""}
                    ${customDark === "red-dark" ? "thead-red" : ""}
                    ${customDark === "green-dark" ? "thead-green" : ""}
                    ${customDark === "blue-dark" ? "thead-blue" : ""}
                    ${customDark === "dark-dark" ? "thead-dark" : ""}
                    ${customDark === "pink-dark" ? "thead-pink" : ""}
                    ${customDark === "purple-dark" ? "thead-purple" : ""}
                    ${customDark === "light-dark" ? "thead-light" : ""}
                    ${customDark === "brown-dark" ? "thead-brown" : ""} `}
                />
            )}

            <Modal
                show={isModalVisible}
                onHide={handleClose}
                centered
                size={isMobile ? 'sm' : 'lg'}
            >
                <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
                    <Modal.Title>Add Type</Modal.Title>
                    <AiFillCloseSquare
                        size={35}
                        onClick={handleClose}
                        className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
                        aria-label="Close"
                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                    />
                </Modal.Header>
                <Modal.Body className={`rounded-bottom-2 ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
                    <Form
                        form={form}
                        onFinish={handleAddType}
                        layout="vertical"
                    >
                        <Form.Item
                            name="types"
                            label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{"Type"}</span>}
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
                            label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{"Associated Process"}</span>}
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

                        <Form.Item name="status" label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{"Status"}</span>} valuePropName="checked" initialValue={true}>
                            <Switch
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                                defaultChecked
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="" htmlType="submit" className={`rounded-2 ${customBtn} ${customDark === "dark-dark" ? `` : `border-0`} custom-zoom-btn`}>
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Type;
