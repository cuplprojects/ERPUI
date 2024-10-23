import React, { useState, useEffect } from 'react';
import { Button, Select, Table, Input, Checkbox } from 'antd';
import { useStore } from 'zustand';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal as BootstrapModal } from 'react-bootstrap';
import themeStore from './../store/themeStore';
import API from '../CustomHooks/MasterApiHooks/api';
import { EditOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const ViewQuantitySheet = ({ selectedLotNo, showBtn, showTable }) => {
    const [modalMessage, setModalMessage] = useState('');
    const { projectId } = useParams();
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
        projectId: projectId,
        isOverridden: false,
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showNewRow, setShowNewRow] = useState(false);
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const [CTP_ID, setCTP_ID] = useState(null);
    const [OFFSET_PRINTING_ID, setOFFSET_PRINTING_ID] = useState(null);
    const [DIGITAL_PRINTING_ID, setDIGITAL_PRINTING_ID] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

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
            sorter: (a, b) => a.quantity - b.quantity,
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
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveButtonClick(record.key)}
                        style={{ marginRight: 8 }}
                        danger
                    />
                    <Button
                        icon={<StopOutlined />}
                        onClick={() => handleStopButtonClick(record.key)}
                        danger
                    />
                </>
            ),
        }
    ];

    const fetchQuantity = async (lotNo) => {
        try {
            const response = await API.get(`/QuantitySheet/Catch?ProjectId=${projectId}&lotNo=${lotNo}`);
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
            const ctpProcess = response.data.find(proc => proc.name === 'CTP');
            const offsetProcess = response.data.find(proc => proc.name === 'Offset Printing');
            const digitalProcess = response.data.find(proc => proc.name === 'Digital Printing');

            setCTP_ID(ctpProcess ? ctpProcess.id : null);
            setOFFSET_PRINTING_ID(offsetProcess ? offsetProcess.id : null);
            setDIGITAL_PRINTING_ID(digitalProcess ? digitalProcess.id : null);
        } catch (error) {
            console.error('Failed to fetch Processes', error);
        }
    };


    const handleSaveEdit = async () => {
        const updatedItem = dataSource.find(item => item.key === editingRow);
        if (!updatedItem) return;

        // Start with the existing process IDs
        let updatedProcessIds = [...updatedItem.processId];

        // Adjust process IDs based on the modal message
        if (modalMessage === 'Do you want to switch to Digital Printing?') {
            // Remove CTP and Offset Printing IDs
            updatedProcessIds = updatedProcessIds.filter(id => id !== CTP_ID && id !== OFFSET_PRINTING_ID);
            // Add Digital Printing ID
            updatedProcessIds.push(DIGITAL_PRINTING_ID);
        } else if (modalMessage === 'Do you want to switch to Offset Printing?') {
            // Remove Digital Printing ID
            updatedProcessIds = updatedProcessIds.filter(id => id !== DIGITAL_PRINTING_ID);
            // Add Offset Printing ID
            updatedProcessIds.push(CTP_ID);
            updatedProcessIds.push(OFFSET_PRINTING_ID);
        }

        // Prepare the payload
        const payload = {
            ...updatedItem,
            processId: updatedProcessIds,
        };

        try {
            await API.put(`/QuantitySheet/${editingRow}`, payload);
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
                await API.delete(`/QuantitySheet/${itemToDelete.quantitySheetId}`);
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
        setEditingRow(null);
        setSelectedProcessIds([]);
        setIsConfirmed(false);
    };

    const handleEditButtonClick = (key) => {
        setEditingRow(key);
        const record = dataSource.find(item => item.key === key);

        if (record) {
            // Update selected process IDs
            if (Array.isArray(record.processId)) {
                setSelectedProcessIds(record.processId.map(id => process.find(proc => proc.id === id)?.name).filter(Boolean));
            } else {
                setSelectedProcessIds([]);
            }

            // Check process IDs and set the modal message accordingly
            const hasCTP = record.processId.includes(CTP_ID);
            const hasOffsetPrinting = record.processId.includes(OFFSET_PRINTING_ID);
            const hasDigitalPrinting = record.processId.includes(DIGITAL_PRINTING_ID);

            if (hasCTP && hasOffsetPrinting) {
                setModalMessage('Do you want to switch to Digital Printing?');
            } else if (hasDigitalPrinting) {
                setModalMessage('Do you want to switch to Offset Printing?');
            } else {
                setModalMessage('Do you want to switch processes?'); // Default message if none match
            }
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
        if (!selectedLotNo) {
            console.error('selectedLotNo is undefined');
            return;
        }
        const payload = [
            {
                catchNo: newRowData.catchNo,
                paper: newRowData.paper,
                course: newRowData.course,
                subject: newRowData.subject,
                innerEnvelope: newRowData.innerEnvelope,
                outerEnvelope: newRowData.outerEnvelope,
                lotNo: selectedLotNo,
                quantity: parseInt(newRowData.quantity, 10),
                percentageCatch: 0,
                projectId: projectId,
                isOverridden: false,
                processId: [],
            }
        ];

        try {
            const response = await API.post(`/QuantitySheet`, payload);
            setDataSource(prevData => [
                ...prevData,
                { ...payload[0], quantitySheetId: response.data.quantitySheetId, key: response.data.quantitySheetId }
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
                projectId: projectId,
                isOverridden: false,
            });
            fetchQuantity(selectedLotNo);
        } catch (error) {
            console.error('Failed to add new row', error);
        }
    };

    const handleStopButtonClick = (key) => {
        // Implement the logic for the stop button here
        console.log('Stop button clicked for key:', key);
    };

    return (
        <div className='mt-'>
            {showBtn && (
                <>
                    <div className="d-flex justify-content-end mb-3">
                        <Button onClick={() => setShowNewRow(prev => !prev)} type="primary" className={`${customBtn} ${customDark === "dark-dark" ? `border` : `border-0`}`}>
                            {showNewRow ? 'Cancel' : 'Add New Catch'}
                        </Button>
                    </div>
                    {showNewRow && (
                        <table className='table table-bordered'>
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
                                        <Button onClick={handleAddRow} className={`${customDark === "dark-dark" ? `border` : ``}`}> Add</Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </>
            )}

            {showTable && (
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        total: dataSource.length,
                        showTotal: (total) => `Total ${total} items`,
                        className: `p-2 rounded rounded-top-0 ${customDark === "dark-dark" ? `bg-white` : ``}`
                    }}
                    scroll={{ x: true }}
                    className={`${
                        customDark === "default-dark" ? "thead-default" :
                        customDark === "red-dark" ? "thead-red" :
                        customDark === "green-dark" ? "thead-green" :
                        customDark === "blue-dark" ? "thead-blue" :
                        customDark === "dark-dark" ? "thead-dark" :
                        customDark === "pink-dark" ? "thead-pink" :
                        customDark === "purple-dark" ? "thead-purple" :
                        customDark === "light-dark" ? "thead-light" :
                        customDark === "brown-dark" ? "thead-brown" : ""
                    }`}
                    size="small"
                    tableLayout="auto"
                    responsive={['sm', 'md', 'lg', 'xl']}
                />
            )}

            {editingRow !== null && (
                <BootstrapModal show={true} onHide={handleModalClose}>
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Edit Process</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        {modalMessage}
                        <div className="mt-3">
                            <Checkbox checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)}>
                                {modalMessage === "Do you want to switch to Digital Printing?" ? "Switch from Offset to Digital" :
                                    modalMessage === "Do you want to switch to Offset Printing?" ? "Switch from Digital to Offset" :
                                        "I confirm this change"}
                            </Checkbox>
                        </div>
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>Close</Button>
                        <Button variant="primary" onClick={handleSaveEdit} disabled={!isConfirmed}>Save Changes</Button>
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
