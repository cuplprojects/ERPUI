import React, { useState, useEffect } from 'react';
import { Button, Select, Table, Input, Checkbox } from 'antd';
import { useStore } from 'zustand';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal as BootstrapModal } from 'react-bootstrap';
import themeStore from './../store/themeStore';
import API from '../CustomHooks/MasterApiHooks/api';
import { EditOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { decrypt } from '../Security/Security';

const ViewQuantitySheet = ({ selectedLotNo, showBtn, showTable }) => {
    const { t } = useTranslation();
    const [modalMessage, setModalMessage] = useState('');
    const { encryptedProjectId } = useParams();
    const projectId = decrypt(encryptedProjectId);
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
    const [CTP_ID, setCTP_ID] = useState(null);
    const [OFFSET_PRINTING_ID, setOFFSET_PRINTING_ID] = useState(null);
    const [DIGITAL_PRINTING_ID, setDIGITAL_PRINTING_ID] = useState(null);
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pageSize, setPageSize] = useState(5);

    const columns = [
        {
            title: t('catchNo'),
            dataIndex: 'catchNo',
            key: 'catchNo',
            width: 100,
            filteredValue: [searchText],
            onFilter: (value, record) => 
                record.catchNo.toString().toLowerCase().includes(value.toLowerCase()),
        },
        {
            title: t('paper'),
            dataIndex: 'paper',
            key: 'paper',
            width: 100,
        },
        {
            title: t('course'),
            dataIndex: 'course',
            key: 'course',
            width: 100,
        },
        {
            title: t('subject'),
            dataIndex: 'subject',
            key: 'subject',
            width: 100,
        },
        {
            title: t('innerEnvelope'),
            dataIndex: 'innerEnvelope',
            key: 'innerEnvelope',
            width: 100,
        },
        {
            title: t('outerEnvelope'),
            dataIndex: 'outerEnvelope',
            key: 'outerEnvelope',
            width: 100,
        },
        {
            title: t('quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            sorter: (a, b) => a.quantity - b.quantity,
        },
        {
            title: t('process'),
            dataIndex: 'processId',
            key: 'processId',
            width: 100,
            render: (text) => (
                Array.isArray(text)
                    ? text.map(id => process.find(proc => proc.id === id)?.name).join(', ') || t('notApplicable')
                    : t('notApplicable')
            ),
        },
        {
            title: t('action'),
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
            console.error(t('failedToFetchQuantity'), error);
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
            console.error(t('failedToFetchProcesses'), error);
        }
    };


    const handleSaveEdit = async () => {
        const updatedItem = dataSource.find(item => item.key === editingRow);
        if (!updatedItem) return;

        let updatedProcessIds = [...updatedItem.processId];

        if (modalMessage === t('switchToDigitalPrintingQuestion')) {
            updatedProcessIds = updatedProcessIds.filter(id => id !== CTP_ID && id !== OFFSET_PRINTING_ID);
            updatedProcessIds.push(DIGITAL_PRINTING_ID);
        } else if (modalMessage === t('switchToOffsetPrintingQuestion')) {
            updatedProcessIds = updatedProcessIds.filter(id => id !== DIGITAL_PRINTING_ID);
            updatedProcessIds.push(CTP_ID);
            updatedProcessIds.push(OFFSET_PRINTING_ID);
        }

        const payload = {
            ...updatedItem,
            processId: updatedProcessIds,
        };

        try {
            await API.put(`/QuantitySheet/${editingRow}`, payload);
            setEditingRow(null);
            fetchQuantity(selectedLotNo);
        } catch (error) {
            console.error(t('failedToSaveChanges'), error);
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
                console.error(t('failedToDeleteItem'), error);
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
            if (Array.isArray(record.processId)) {
                setSelectedProcessIds(record.processId.map(id => process.find(proc => proc.id === id)?.name).filter(Boolean));
            } else {
                setSelectedProcessIds([]);
            }

            const hasCTP = record.processId.includes(CTP_ID);
            const hasOffsetPrinting = record.processId.includes(OFFSET_PRINTING_ID);
            const hasDigitalPrinting = record.processId.includes(DIGITAL_PRINTING_ID);

            if (hasCTP && hasOffsetPrinting) {
                setModalMessage(t('switchToDigitalPrintingQuestion'));
            } else if (hasDigitalPrinting) {
                setModalMessage(t('switchToOffsetPrintingQuestion'));
            } else {
                setModalMessage(t('switchProcessesQuestion'));
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
            console.error(t('selectedLotNoUndefined'));
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
            console.error(t('failedToAddNewRow'), error);
        }
    };

    const handleStopButtonClick = (key) => {
        console.log(t('stopButtonClicked'), key);
    };

    const handlePageSizeChange = (current, size) => {
        setPageSize(size);
    };

    return (
        <div className='mt-'>
            {showBtn && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
                        <Input.Search
                            placeholder={t('searchByCatchNo')}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '250px' }}
                            allowClear
                        />
                        <Button onClick={() => setShowNewRow(prev => !prev)} type="primary" className={`${customBtn} ${customDark === "dark-dark" ? `border` : `border-0`}`}>
                            {showNewRow ? t('cancel') : t('addNewCatch')}
                        </Button>
                    </div>
                    {showNewRow && (
                        <div className="mb-3">
                            <table className='table table-bordered'>
                                <tbody>
                                    <tr>
                                        <td><Input size="small" placeholder={t('catchNo')} name="catchNo" value={newRowData.catchNo} onChange={handleNewRowChange} /></td>
                                        <td><Input size="small" placeholder={t('paper')} name="paper" value={newRowData.paper} onChange={handleNewRowChange} /></td>
                                        <td><Input size="small" placeholder={t('course')} name="course" value={newRowData.course} onChange={handleNewRowChange} /></td>
                                        <td><Input size="small" placeholder={t('subject')} name="subject" value={newRowData.subject} onChange={handleNewRowChange} /></td>
                                        <td><Input size="small" placeholder={t('innerEnvelope')} name="innerEnvelope" value={newRowData.innerEnvelope} onChange={handleNewRowChange} /></td>
                                        <td><Input size="small" placeholder={t('outerEnvelope')} name="outerEnvelope" value={newRowData.outerEnvelope} onChange={handleNewRowChange} /></td>
                                        <td><Input size="small" placeholder={t('quantity')} type="number" name="quantity" value={newRowData.quantity} onChange={handleNewRowChange} /></td>
                                        <td><Button size="small" onClick={handleAddRow} className={`${customDark === "dark-dark" ? `border` : ``}`}>{t('add')}</Button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {showTable && (
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{
                        pageSize: pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '25', '50', '100'],
                        total: dataSource.length,
                        showTotal: (total, range) => `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
                        onShowSizeChange: handlePageSizeChange,
                        className: `p-2 rounded rounded-top-0 ${customDark === "dark-dark" ? `bg-white` : ``} mt`
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
                        <BootstrapModal.Title>{t('editProcess')}</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        {t(modalMessage)}
                        <div className="mt-3">
                            <Checkbox checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)}>
                                {modalMessage === "switchToDigitalPrintingQuestion" ? t('switchFromOffsetToDigital') :
                                    modalMessage === "switchToOffsetPrintingQuestion" ? t('switchFromDigitalToOffset') :
                                        t('confirmThisChange')}
                            </Checkbox>
                        </div>
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>{t('close')}</Button>
                        <Button variant="primary" onClick={handleSaveEdit} disabled={!isConfirmed}>{t('saveChanges')}</Button>
                    </BootstrapModal.Footer>
                </BootstrapModal>
            )}

            {showDeleteModal && (
                <BootstrapModal show={true} onHide={handleModalClose}>
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>{t('confirmDeletion')}</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        {t('areYouSureDeleteCatchNo', { catchNo: itemToDelete?.catchNo })}
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>{t('cancel')}</Button>
                        <Button variant="danger" onClick={handleConfirmDelete}>{t('delete')}</Button>
                    </BootstrapModal.Footer>
                </BootstrapModal>
            )}
        </div>
    );
};

export default ViewQuantitySheet;
