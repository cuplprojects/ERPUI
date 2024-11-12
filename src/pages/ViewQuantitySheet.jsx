import React, { useState, useEffect } from 'react';
import { Button, Select, Table, Input, Checkbox } from 'antd';
import { useStore } from 'zustand';
import { Modal as BootstrapModal } from 'react-bootstrap';
import themeStore from './../store/themeStore';
import API from '../CustomHooks/MasterApiHooks/api';
import { EditOutlined, DeleteOutlined, StopOutlined, WarningOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { decrypt } from '../Security/Security';
import CatchTransferModal from '../menus/CatchTransferModal';

const ViewQuantitySheet = ({ selectedLotNo, showBtn, showTable ,lots}) => {
    const { t } = useTranslation();
    const [modalMessage, setModalMessage] = useState('');
    const { encryptedProjectId } = useParams();
    const projectId = decrypt(encryptedProjectId);
    const [process, setProcess] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [selectedProcessIds, setSelectedProcessIds] = useState([]);
    const [selectedCatches, setSelectedCatches] = useState([]);
    const [quantitySheetId, setQuantitySheetId] = useState(null);
    const [newRowData, setNewRowData] = useState({
        catchNo: '',
        paper: '',
        course: '',
        subject: '',
        innerEnvelope: '',
        outerEnvelope: '',
        examDate: '',
        examTime: '',
        quantity: 0,
        percentageCatch: 0,
        projectId: projectId,
        quantitySheetId:quantitySheetId,
        examDate: '',
        examTime: '',
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
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
            title: t('select'),
            dataIndex: 'selection',
            key: 'selection', 
            width: '2%',
            render: (_, record) => (
                <Checkbox
                    checked={selectedCatches.some(item => item.id === record.quantitySheetId)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedCatches([...selectedCatches, {
                                id: record.quantitySheetId,
                                catchNo: record.catchNo
                            }]);
                        } else {
                            setSelectedCatches(selectedCatches.filter(item => item.id !== record.quantitySheetId));
                        }
                    }}
                />
            )
        },
        {
            title: t('catchNo'),
            dataIndex: 'catchNo',
            key: 'catchNo',
            width: 100,
            filteredValue: [searchText],
            onFilter: (value, record) => 
                record.catchNo.toString().toLowerCase().includes(value.toLowerCase()),
            sorter: (a, b) => a.catchNo.localeCompare(b.catchNo)
        },
        {
            title: t('paper'),
            dataIndex: 'paper',
            key: 'paper',
            width: 100,
            sorter: (a, b) => a.paper.localeCompare(b.paper)
        },
        {
            title: t('course'),
            dataIndex: 'course',
            key: 'course',
            width: 100,
            sorter: (a, b) => a.course.localeCompare(b.course)
        },
        {
            title: t('subject'),
            dataIndex: 'subject',
            key: 'subject',
            width: 100,
            sorter: (a, b) => a.subject.localeCompare(b.subject)
        },
        {
            title: t('examDate'),
            dataIndex: 'examDate',
            key: 'examDate',
            width: 100,
            sorter: (a, b) => new Date(a.examDate) - new Date(b.examDate),
            render: (text, record) => (
                <span>
                    {text}
                    {record.isExamDateOverlapped && 
                        <WarningOutlined style={{color: '#ff4d4f', marginLeft: '5px'}} />
                    }
                </span>
            )
        },
        {
            title: t('examTime'),
            dataIndex: 'examTime',
            key: 'examTime',
            width: 100,
            sorter: (a, b) => a.examTime.localeCompare(b.examTime)
        },
        {
            title: t('innerEnvelope'),
            dataIndex: 'innerEnvelope',
            key: 'innerEnvelope',
            width: 100,
            sorter: (a, b) => a.innerEnvelope.localeCompare(b.innerEnvelope)
        },
        {
            title: t('outerEnvelope'),
            dataIndex: 'outerEnvelope',
            key: 'outerEnvelope',
            width: 100,
            sorter: (a, b) => a.outerEnvelope.localeCompare(b.outerEnvelope)
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
            sorter: (a, b) => {
                const aProcesses = a.processId.map(id => process.find(proc => proc.id === id)?.name).join(',');
                const bProcesses = b.processId.map(id => process.find(proc => proc.id === id)?.name).join(',');
                return aProcesses.localeCompare(bProcesses);
            }
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
            console.log("lot data in qty sheet",response.data);
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

        if (modalMessage === 'switchToDigitalPrintingQuestion') {
            updatedProcessIds = updatedProcessIds.filter(id => id !== CTP_ID && id !== OFFSET_PRINTING_ID);
            updatedProcessIds.push(DIGITAL_PRINTING_ID);
        } else if (modalMessage === 'switchToOffsetPrintingQuestion'){
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
        setShowTransferModal(false);
        setShowDeleteModal(false);
        setItemToDelete(null);
        setEditingRow(null);
        setSelectedProcessIds([]);
        setIsConfirmed(false);
        setSelectedCatches([]);
        
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
                setModalMessage('switchToDigitalPrintingQuestion');
            } else if (hasDigitalPrinting) {
                setModalMessage('switchToOffsetPrintingQuestion');
            } else {
                setModalMessage('switchProcessesQuestion');
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
                examDate: newRowData.examDate,
                examTime: newRowData.examTime,
                quantity: parseInt(newRowData.quantity, 10),
                percentageCatch: 0,
                projectId: projectId,
                processId: []
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
                examDate: '',
                examTime: '',
                percentageCatch: 0,
                projectId: projectId,
                examDate: '',
                examTime: '',
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

    const handleCatchesChange = (updatedCatches) => {
        setSelectedCatches(updatedCatches);
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
                        <div>
                            {selectedCatches.length > 0 && (
                                <Button 
                                    type="primary" 
                                    className={`${customBtn} ${customDark === "dark-dark" ? `border` : `border-0`} me-2`}
                                    onClick={() => setShowTransferModal(true)}
                                >
                                    {t('transferCatch')}
                                </Button>
                            )}
                            <Button onClick={() => setShowNewRow(prev => !prev)} type="primary" className={`${customBtn} ${customDark === "dark-dark" ? `border` : `border-0`}`}>
                                {showNewRow ? t('cancel') : t('addNewCatch')}
                            </Button>
                        </div>
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
                        <BootstrapModal.Title>{t('editProcess')} - {t('catchNo')}: {dataSource.find(item => item.key === editingRow)?.catchNo}</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        {t(modalMessage) } 
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
                        <BootstrapModal.Title>{t('confirmDeletion')}  {itemToDelete?.catchNo}</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        {t('areYouSureDeleteCatchNo')}  ?
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>{t('cancel')}</Button>
                        <Button variant="danger" onClick={handleConfirmDelete}>{t('delete')}</Button>
                    </BootstrapModal.Footer>
                </BootstrapModal>
            )}

            <CatchTransferModal 
                visible={showTransferModal}
                onClose={handleModalClose}
                catches={selectedCatches}
                onCatchesChange={handleCatchesChange}
                projectId={projectId}
                fetchQuantity={fetchQuantity}
                lots={lots}
                selectedLotNo={selectedLotNo}
            />
        </div>
    );
};

export default ViewQuantitySheet;
