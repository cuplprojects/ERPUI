import React, { useState, useEffect } from 'react';
import { Button, Select, Table, Input } from 'antd';
import axios from 'axios';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal as BootstrapModal } from 'react-bootstrap';

import API from '../CustomHooks/MasterApiHooks/api';

import { EditOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';

const ViewQuantitySheet = ({ selectedLotNo }) => {
    const [process, setProcess] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [selectedProcessIds, setSelectedProcessIds] = useState([]);
    const [newRowData, setNewRowData] = useState({
        catchNo: '',
        paper: '',
        course: '',
        subject: '',
        innerEnvelope: '',
        outerEnvelope: '',
        quantity: 0,
        percentageCatch: 0,
        projectId: 1,
        isOverridden: false,
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();

    const columns = [
        {
            title: 'Catch No',
            dataIndex: 'catchNo',
            key: 'catchNo',
            width: 100,
        },
        {
            title: 'Paper',
            dataIndex: 'paper',
            key: 'paper',
            width: 100,
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            width: 100,
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            width: 100,
        },
        {
            title: 'Inner Envelope',
            dataIndex: 'innerEnvelope',
            key: 'innerEnvelope',
            width: 100,
        },
        {
            title: 'Outer Envelope',
            dataIndex: 'outerEnvelope',
            key: 'outerEnvelope',
            width: 100,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            sorter: true,
        },
        {
            title: 'Process',
            dataIndex: 'processId',
            key: 'processId',
            width: 100,
            render: (text) => (
                Array.isArray(text)
                ? text.map(id => process.find(proc => proc.id === id)?.name).join(', ') || 'N/A'
                : 'N/A'
            ),
        },
        {
            title: 'Action',
            key: 'operation',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <>
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditButtonClick(record.key)} 
                        style={{ marginRight: 8 }}
                    >
                    </Button>
                    <Button 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleRemoveButtonClick(record.key)} 
                        style={{ marginRight: 8 }} 
                        danger
                    >
                    </Button>
                    <Button 
                        icon={<StopOutlined />} 
                        onClick={() => handleStopButtonClick(record.key)} 
                        danger
                    >
                    </Button>
                </>
            ),
        }
    ];

    const fetchQuantity = async (lotNo) => {
        try {

            const response = await API.get(`/QuantitySheet?ProjectId=1&lotNo=${lotNo}`);

            const dataWithKeys = response.data.map(item => ({
                ...item, key: item.quantitySheetId
            }));
            setDataSource(dataWithKeys);
        } catch (error) {
            console.error('Failed to fetch Quantity', error);
        }
    };

    useEffect(() => {
        fetchProcess();
    }, []);

    useEffect(() => {
        if (selectedLotNo) {
            fetchQuantity(selectedLotNo);
        }
    }, [selectedLotNo]);

    const fetchProcess = async () => {
        try {

            const response = await API.get('/Processes');

            setProcess(response.data);
        } catch (error) {
            console.error('Failed to fetch Processes', error);
        }
    };

    const handleProcessChange = (value) => {
        setSelectedProcessIds(value);
    };

    const handleSaveEdit = async () => {
        const updatedItem = dataSource.find(item => item.key === editingRow);
        if (!updatedItem) return;

        const payload = {
            ...updatedItem,
            processId: selectedProcessIds.map(procName => process.find(proc => proc.name === procName)?.id).filter(Boolean),
        };

        try {

            await API.put(`/QuantitySheet/${editingRow}`, payload);

            setEditingRow(null); // Exit edit mode
            fetchQuantity(); // Refresh data
            await axios.put(`https://localhost:7212/api/QuantitySheet/${editingRow}`, payload);
            setEditingRow(null);
            fetchQuantity(selectedLotNo);
        } catch (error) {
            console.error('Failed to save changes', error);
        }
    };

    const handleRemoveButtonClick = (key) => {
        const record = dataSource.find(item => item.key === key);
        if (record) {
            setItemToDelete(record);
            setShowDeleteModal(true);
        }
    };

    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            try {
                await axios.delete(`https://localhost:7212/api/QuantitySheet/${itemToDelete.quantitySheetId}`);
                setDataSource(prevData => prevData.filter(item => item.key !== itemToDelete.key));
                setShowDeleteModal(false);
                setItemToDelete(null);
            } catch (error) {
                console.error('Failed to delete item', error);
            }
        }
    };

    const handleModalClose = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    const handleEditButtonClick = (key) => {
        setEditingRow(key);
        const record = dataSource.find(item => item.key === key);
        if (record && Array.isArray(record.processId)) {
            setSelectedProcessIds(record.processId.map(id => process.find(proc => proc.id === id)?.name) || []);
        } else {
            setSelectedProcessIds([]);
        }
    };

    const handleNewRowChange = (e) => {
        const { name, value } = e.target;
        setNewRowData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddRow = async () => {
        const payload = [
            {
                catchNo: newRowData.catchNo,
                paper: newRowData.paper,
                course: newRowData.course,
                subject: newRowData.subject,
                innerEnvelope: newRowData.innerEnvelope,
                outerEnvelope: newRowData.outerEnvelope,
                lotNo: selectedLotNo,
                quantity: newRowData.quantity,
                percentageCatch: 0,
                projectId: 1,
                isOverridden: false,
                processId: selectedProcessIds.map(procName =>
                    process.find(proc => proc.name === procName)?.id
                ).filter(Boolean),
            }
        ];

        try {
            const response = await axios.post(`https://localhost:7212/api/QuantitySheet`, payload);
            setDataSource(prevData => [
                ...prevData,
                { ...payload, quantitySheetId: response.data.quantitySheetId, key: response.data.quantitySheetId }
            ]);
            setNewRowData({
                catchNo: '',
                paper: '',
                course: '',
                subject: '',
                innerEnvelope: '',
                outerEnvelope: '',
                quantity: 0,
                percentageCatch: 0,
                projectId: 1,
                isOverridden: false,
            });
            setSelectedProcessIds([]);
            fetchQuantity();
        } catch (error) {
            console.error('Failed to add new row', error);
        }
    };

    return (
        <div className='mt-3'>
            <Table
                className={cssClasses.customTable}
                columns={columns}
                dataSource={dataSource}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    total: dataSource.length,
                    showTotal: (total) => `Total ${total} items`,
                }}
                scroll={{ x: 'max-content' }}
            />

            <table>
                <tbody>
                    <tr>
                        <td>
                            <Input placeholder="Catch No" name="catchNo" value={newRowData.catchNo} onChange={handleNewRowChange} />
                        </td>
                        <td>
                            <Input placeholder="Paper" name="paper" value={newRowData.paper} onChange={handleNewRowChange} />
                        </td>
                        <td>
                            <Input placeholder="Course" name="course" value={newRowData.course} onChange={handleNewRowChange} />
                        </td>
                        <td>
                            <Input placeholder="Subject" name="subject" value={newRowData.subject} onChange={handleNewRowChange} />
                        </td>
                        <td>
                            <Input placeholder="Inner Envelope" name="innerEnvelope" value={newRowData.innerEnvelope} onChange={handleNewRowChange} />
                        </td>
                        <td>
                            <Input placeholder="Outer Envelope" name="outerEnvelope" value={newRowData.outerEnvelope} onChange={handleNewRowChange} />
                        </td>
                        <td>
                            <Input placeholder="Quantity" type="number" name="quantity" value={newRowData.quantity} onChange={handleNewRowChange} />
                        </td>
                        <td>
                            <Select
                                mode="multiple"
                                value={selectedProcessIds}
                                onChange={handleProcessChange}
                                style={{ width: '100%' }}
                            >
                                {process.map(proc => (
                                    <Select.Option key={proc.id} value={proc.name}>
                                        {proc.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </td>
                        <td>
                            <Button type="primary" onClick={handleAddRow}>Add Row</Button>
                        </td>
                    </tr>
                </tbody>
            </table>

            {editingRow !== null && (
                <BootstrapModal show={true} onHide={handleModalClose}>
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Edit Process</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <Select
                            mode="multiple"
                            value={selectedProcessIds}
                            onChange={handleProcessChange}
                            style={{ width: '100%' }}
                        >
                            {process.map(proc => (
                                <Select.Option key={proc.id} value={proc.name}>
                                    {proc.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>Close</Button>
                        <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
                    </BootstrapModal.Footer>
                </BootstrapModal>
            )}

            {showDeleteModal && (
                <BootstrapModal show={true} onHide={handleModalClose}>
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Confirm Deletion</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        Are you sure you want to delete the catch no: <strong>{itemToDelete?.catchNo}</strong>?
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                        <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
                    </BootstrapModal.Footer>
                </BootstrapModal>
            )}
        </div>
    );
};


export default ViewQuantitySheet;