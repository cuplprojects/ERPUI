import { message, Table, Input, Button, Switch, Form, Select, Spin, Pagination } from 'antd';
import { Modal } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useForm } from 'antd/es/form/Form';
import API from '../CustomHooks/MasterApiHooks/api';
import { useMediaQuery } from 'react-responsive';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { AiFillCloseSquare } from "react-icons/ai";
import { SortAscendingOutlined, SortDescendingOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
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
    const [associatedProcessIds, setAssociatedProcessIds] = useState([]);
    const [requiredProcessIds, setRequiredProcessIds] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingType, setEditingType] = useState('');
    const [editingProcessIds, setEditingProcessIds] = useState([]);
    const [requirededitingProcessIds, setRequiredEditingProcessIds] = useState([]);
    const [editingStatus, setEditingStatus] = useState(true);
    const [originalData, setOriginalData] = useState({});
    const [form] = useForm();
    const [searchText, setSearchText] = useState('');
    const [sortOrder, setSortOrder] = useState('ascend');
    const [sortField, setSortField] = useState('types');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

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

    useEffect(() => {
        const filtered = types.filter(type =>
            type.types.toLowerCase().includes(searchText.toLowerCase()) ||
            type.associatedProcessId.some(id => processMap[id]?.toLowerCase().includes(searchText.toLowerCase()))
        );
        setFilteredTypes(filtered);
        setCurrentPage(1);
    }, [searchText, types, processMap]);

    const handleAddType = async (values) => {
        const { associatedProcessId,requiredProcessId } = values;

        try {
            // Check if the type already exists
            const typeExists = types.some(type => type.types.toLowerCase() === values.types.toLowerCase());
            if (typeExists) {
                message.error("This type already exists!");
                return;
            }
            const postData = {
                ...values,
                associatedProcessId: associatedProcessIds, // Keep all selected for submission
                requiredProcessId: requiredProcessIds // Only send the currently displayed required processes
            };
            const response = await API.post('/PaperTypes', postData);
            setTypes(prev => [...prev, response.data]);
            setFilteredTypes(prev => [...prev, response.data]);
            message.success("Type created successfully");
            setIsModalVisible(false);
            form.resetFields();
            setRequiredProcessIds([])
        } catch (error) {
            console.error(error);
            message.error("Failed to create type");
        }
    };

    const handleEditSave = async (index) => {
        const updatedType = {
            ...types[index],
            types: editingType,
            associatedProcessId: editingProcessIds,
            requiredProcessId:requirededitingProcessIds,
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
        setRequiredEditingProcessIds(originalData.requiredProcessId)
        setEditingStatus(originalData.status);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleSort = (field) => {
        const newSortOrder = field === sortField && sortOrder === 'ascend' ? 'descend' : 'ascend';
        setSortOrder(newSortOrder);
        setSortField(field);

        const sortedTypes = [...filteredTypes].sort((a, b) => {
            if (field === 'types') {
                return newSortOrder === 'ascend'
                    ? a.types.localeCompare(b.types)
                    : b.types.localeCompare(a.types);
            } else if (field === 'status') {
                return newSortOrder === 'ascend'
                    ? (a.status === b.status ? 0 : a.status ? -1 : 1)
                    : (a.status === b.status ? 0 : a.status ? 1 : -1);
            }
        });

        setFilteredTypes(sortedTypes);
    };

    const columns = [
        {
            align: 'center',
            title: 'SN.',
            dataIndex: 'serial',
            key: 'serial',
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
            width: '10%',
        },
        {
            title: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Type
                    <Button
                        type="text"
                        onClick={() => handleSort('types')}
                        icon={sortField === 'types' && sortOrder === 'ascend' ? <SortAscendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' /> : <SortDescendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' />}
                    />
                </div>
            ),
            dataIndex: 'types',
            key: 'types',
            render: (text, record, index) => (
                editingIndex === index ? (
                    <Input
                        value={editingType}
                        onChange={(e) => setEditingType(e.target.value)}
                        onPressEnter={() => handleEditSave(index)}
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
                    >
                        {processes.map(proc => (
                            <Option key={proc.id} value={proc.id}>
                                {proc.name}
                            </Option>
                        ))}
                    </Select>
                ) : (
                    ids?.map(id => processMap[id]).join(', ') || ''
                )
            ),
        },
        {
            title: 'Required Process',
            dataIndex: 'requiredProcessId',
            key: 'requiredProcessId',
            render: (ids, record, index) => (
                editingIndex === index ? (
                    <Select
                        mode="multiple"
                        value={requirededitingProcessIds}
                        onChange={setRequiredEditingProcessIds}
                        style={{ width: '100%' }}
                    >
                        {processes.map(proc => (
                            <Option key={proc.id} value={proc.id}>
                                {proc.name}
                            </Option>
                        ))}
                    </Select>
                ) : (
                    ids?.map(id => processMap[id]).join(', ') || ''
                )
            ),
        },
        {
            align: 'center',
            title: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Status
                    <Button
                        type="text"
                        onClick={() => handleSort('status')}
                        icon={sortField === 'status' && sortOrder === 'ascend' ? <SortAscendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' /> : <SortDescendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' />}
                    />
                </div>
            ),
            dataIndex: 'status',
            key: 'status',
            render: (status, record, index) => (
                editingIndex === index ? (
                    <Switch
                        checked={editingStatus}
                        onChange={setEditingStatus}
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
                    <div style={{ display: 'flex', justifyContent: '' }}>
                        <Button type="link" onClick={() => handleEditSave(index)} className={`${customDark === "dark-dark" ? `${customMid} border` : `${customLight} ${customDarkBorder}`} text-white `}>
                            <SaveOutlined className={`${customDark === "dark-dark" ? `` : `${customDarkText}`} `} />
                            <span className={`${customDark === "dark-dark" ? `` : `${customDarkText}`} `}>Save</span>
                        </Button>
                        <Button type="link" onClick={handleCancelEdit} className={`${customDark === "dark-dark" ? `${customMid} border` : `${customLight} ${customDarkBorder}`} text-white ms-3`}>
                            <CloseOutlined className={`${customDark === "dark-dark" ? `` : `${customDarkText}`} `} />
                            <span className={`${customDark === "dark-dark" ? `` : `${customDarkText}`} `}>Cancel</span>
                        </Button>
                    </div>
                ) : (
                    <Button type="link" icon={<EditOutlined />} onClick={() => {
                        setEditingIndex(index);
                        setEditingType(record.types);
                        setEditingProcessIds(record.associatedProcessId);
                        setRequiredEditingProcessIds(record.requiredProcessId)
                        setEditingStatus(record.status);
                        setOriginalData(record);
                    }} className={`${customBtn} text-white me-1`}>Edit</Button>
                )
            ),
        },
    ];

    const responsiveColumns = isMobile ? columns.filter(col => col.key !== 'status') : columns;

    const handleClose = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const paginatedTypes = filteredTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                    onChange={(e) => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
                <Button className={`${customBtn} border-0 custom-zoom-btn`} onClick={() => setIsModalVisible(true)}>
                    Add Type
                </Button>
            </div>

            {loading ? (
                <Spin size="large" />
            ) : (
                <>
                    <Table
                        dataSource={paginatedTypes}
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
                        ${customDark === "brown-dark" ? "thead-brown" : ""} rounded-2`}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', background: 'white', padding: '10px' }} className='rounded-2 rounded-top-0'>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredTypes.length}
                            onChange={(page, pageSize) => {
                                setCurrentPage(page);
                                setPageSize(pageSize);
                            }}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                        />
                    </div>
                </>
            )}

            <Modal
                show={isModalVisible}
                onHide={handleClose}
                centered
                size={isMobile ? 'sm' : 'lg'}
            >
                <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} w border d-flex justify-content-between `}>
                    <Modal.Title>Add Type</Modal.Title>
                    <AiFillCloseSquare
                        size={35}
                        onClick={handleClose}
                        className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
                        aria-label="Close"
                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                    />
                </Modal.Header>
                <Modal.Body className={`rounded-bottom-2 ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`} `}>
                    <Form
                        form={form}
                        onFinish={handleAddType}
                        layout="vertical"
                    // className='w-50'
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
                                        if (types.some(type => type.types.toLowerCase() === value.toLowerCase())) {
                                            return Promise.reject(new Error('This type already exists!'));
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
                            <Select
                                mode="multiple"
                                placeholder="Select Process"
                                onChange={(selected) => {
                                    setAssociatedProcessIds(selected); 
                                    setRequiredProcessIds(selected); 
                                }}
                                style={{ width: '100%' }}
                            >
                                {processes.map(proc => (
                                    <Option key={proc.id} value={proc.id}>
                                        {proc.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{"Required Process"}</span>}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {requiredProcessIds.map(id => (
                                    <span key={id} style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                                        {processMap[id]}
                                        <AiFillCloseSquare
                                            style={{ marginLeft: '8px', cursor: 'pointer' }}
                                            onClick={() => setRequiredProcessIds(requiredProcessIds.filter(processId => processId !== id))}
                                        />
                                    </span>
                                ))}
                            </div>
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
