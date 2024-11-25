import React, { useState, useEffect } from 'react';
import { Button, Select, Table, Input, Checkbox, Tag, Form, Row, Col } from 'antd';
import { useStore } from 'zustand';
import { Modal as BootstrapModal } from 'react-bootstrap';
import themeStore from './../store/themeStore';
import API from '../CustomHooks/MasterApiHooks/api';
import { EditOutlined, DeleteOutlined, StopOutlined, WarningOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { decrypt } from '../Security/Security';
import CatchTransferModal from '../menus/CatchTransferModal';

const ViewQuantitySheet = ({ selectedLotNo, showBtn, showTable, lots }) => {
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
        status: 0,
        projectId: projectId,
        quantitySheetId: quantitySheetId,
    });
    const [formErrors, setFormErrors] = useState({});
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
    const [dispatchedLots, setDispatchedLots] = useState([]);
    const [dates, setDates] = useState([]);
    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);

    const columns = [
        {
            title: t('select'),
            dataIndex: 'selection',
            key: 'selection',
            width: '2%',
            render: (_, record) => {
                const isDispatched = dispatchedLots.includes(selectedLotNo);
                return (
                    <Checkbox
                        disabled={isDispatched}
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
                );
            }
        },
        {
            title: t('catchNo'),
            dataIndex: 'catchNo',
            key: 'catchNo',
            width: 100,
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
            sorter: (a, b) => {
                // Convert DD-MM-YYYY to Date objects for proper comparison
                const [dayA, monthA, yearA] = a.examDate.split('-');
                const [dayB, monthB, yearB] = b.examDate.split('-');
                
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                
                return dateA - dateB;
            },
            render: (text, record) => (
                <span>
                    {text}
                    {record.isExamDateOverlapped &&
                        <WarningOutlined style={{ color: '#ff4d4f', marginLeft: '5px' }} />
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
            title: t('Process'),
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
            render: (_, record) => {
                const isDispatched = dispatchedLots.includes(selectedLotNo);
                return (
                    <>
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEditButtonClick(record.key)}
                            style={{ marginRight: 8 }}
                            disabled={isDispatched}
                        />
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveButtonClick(record.key)}
                            style={{ marginRight: 8 }}
                            danger
                            disabled={isDispatched}
                        />
                        <Button
                            icon={<StopOutlined />}
                            onClick={() => handleStopButtonClick(record.key)}
                            danger
                            disabled={isDispatched}
                        />
                    </>
                );
            },
        }
    ];

    const getFilteredData = () => {
        if (!searchText) return dataSource;

        return dataSource.filter(record => {
            return Object.keys(record).some(key => {
                // Skip processId and other non-string fields
                if (key === 'processId' || key === 'key' || key === 'quantitySheetId' || key === 'status' || key === 'projectId') return false;

                const value = record[key];
                if (value === null || value === undefined) return false;

                return value.toString().toLowerCase().includes(searchText.toLowerCase());
            });
        });
    };

    const fetchQuantity = async (lotNo = selectedLotNo) => {
        try {
            const response = await API.get(`/QuantitySheet/Catch?ProjectId=${projectId}&lotNo=${lotNo}`);
            console.log("lot data in qty sheet", response.data);
            const dataWithKeys = response.data.map(item => ({
                ...item, key: item.quantitySheetId
            }));
            setDataSource(dataWithKeys);
        } catch (error) {
            console.error(t('failedToFetchQuantity'), error);
        }
    };

    const formatDate = (dateString) => {
        const [day, month, year] = dateString.split('-');  // Split the DD-MM-YYYY format
        return new Date(`${year}-${month}-${day}`);        // Convert to YYYY-MM-DD format for Date constructor
    };

    const getAvailableDates = async (lotNo) => {
        try {
            const response = await API.get(`/QuantitySheet/exam-dates?projectId=${projectId}&lotNo=${lotNo}`);
            console.log("Exam data in quantity sheet", response.data);

            // Convert dates to proper Date objects and sort them
            const availableDates = response.data.map(formatDate);
            const sortedDates = availableDates.sort((a, b) => a - b);  // Sort by date in ascending order

            // Set the sorted dates and the min/max values
            setDates(sortedDates);
            setMinDate(sortedDates[0].toISOString().split('T')[0]);  // Convert back to YYYY-MM-DD string
            setMaxDate(sortedDates[sortedDates.length - 1].toISOString().split('T')[0]);

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
            getAvailableDates(selectedLotNo)
        }
    }, [selectedLotNo]);

    useEffect(() => {
        const fetchDispatchedLots = async () => {
            try {
                const response = await API.get(`/Dispatch/project/${projectId}`);
                const dispatchedLotNos = response.data.map(dispatch => dispatch.lotNo);
                setDispatchedLots(dispatchedLotNos);
            } catch (error) {
                console.error('Failed to fetch dispatched lots:', error);
            }
        };

        fetchDispatchedLots();
    }, [projectId]);

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
        } else if (modalMessage === 'switchToOffsetPrintingQuestion') {
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
        // Clear error when user starts typing
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!newRowData.course) errors.course = t('courseRequired');
        if (!newRowData.catchNo) errors.catchNo = t('catchNoRequired');
        if (!newRowData.paper) errors.paper = t('paperCodeRequired');
        if (!newRowData.examDate) errors.examDate = t('examDateRequired');
        if (!newRowData.examTime) errors.examTime = t('examTimeRequired');
        if (!newRowData.quantity || newRowData.quantity <= 0) errors.quantity = t('validQuantityRequired');
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddRow = async () => {
        if (!selectedLotNo) {
            console.error(t('selectedLotNoUndefined'));
            return;
        }

        if (!validateForm()) {
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
                examDate: newRowData.examDate,
                examTime: newRowData.examTime,
                processId: [],
                status: 0
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
                examDate: '',
                examTime: '',
                innerEnvelope: '',
                outerEnvelope: '',
                quantity: 0,
                percentageCatch: 0,
                projectId: projectId,
                status: 0
            });
            setFormErrors({});
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
                            placeholder={t('searchAllFields')}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '250px' }}
                            allowClear
                        />
                        <div>
                            {selectedCatches.length > 0 && !dispatchedLots.includes(selectedLotNo) && (
                                <Button
                                    type="primary"
                                    className={`${customBtn} ${customDark === "dark-dark" ? `border` : `border-0`} me-2`}
                                    onClick={() => setShowTransferModal(true)}
                                >
                                    {t('transferCatch')}
                                </Button>
                            )}
                            
                            <Button 
                                onClick={() => setShowNewRow(prev => !prev)} 
                                type="primary" 
                                className={`${customBtn} ${customDark === "dark-dark" ? `border` : `border-0`}`}
                                disabled={dispatchedLots.includes(selectedLotNo)}
                            >
                                {showNewRow ? t('cancel') : t('addNewCatch')}
                            </Button>
                        </div>
                    </div>
                    {showNewRow && (
                        <Form layout="vertical" className="mb-3">
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item label={<>
                                            {t('catchNo')} <span style={{ color: 'red' }}>*</span>
                                        </>}
                                        validateStatus={formErrors.catchNo ? "error" : ""}
                                        help={formErrors.catchNo}
                                    >
                                        <Input 
                                            size="small" 
                                            name="catchNo" 
                                            value={newRowData.catchNo} 
                                            onChange={handleNewRowChange}
                                            placeholder={t('enterCatchNo')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item 
                                        label={<>
                                            {t('paperCode')} <span style={{ color: 'red' }}>*</span>
                                        </>}
                                        validateStatus={formErrors.paper ? "error" : ""}
                                        help={formErrors.paper}
                                    >
                                        <Input 
                                            size="small" 
                                            name="paper" 
                                            value={newRowData.paper} 
                                            onChange={handleNewRowChange}
                                            placeholder={t('enterPaperCode')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item 
                                        label={<>
                                            {t('course')} <span style={{ color: 'red' }}>*</span>
                                        </>}
                                        validateStatus={formErrors.course ? "error" : ""}
                                        help={formErrors.course}
                                    >
                                        <Input 
                                            size="small" 
                                            name="course" 
                                            value={newRowData.course} 
                                            onChange={handleNewRowChange}
                                            placeholder={t('enterCourse')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('subject')}>
                                        <Input 
                                            size="small" 
                                            name="subject" 
                                            value={newRowData.subject} 
                                            onChange={handleNewRowChange}
                                            placeholder={t('enterSubject')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item 
                                        label={<>
                                            {t('examDate')} <span style={{ color: 'red' }}>*</span>
                                        </>}
                                        validateStatus={formErrors.examDate ? "error" : ""}
                                        help={formErrors.examDate}
                                    >
                                        <Input
                                            size="small"
                                            type="date"
                                            name="examDate"
                                            value={newRowData.examDate}
                                            onChange={handleNewRowChange}
                                            min={minDate}
                                            max={maxDate}
                                            disabled={dates.length === 0}
                                            placeholder={t('selectExamDate')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item 
                                        label={<>
                                            {t('examTime')} <span style={{ color: 'red' }}>*</span>
                                        </>}
                                        validateStatus={formErrors.examTime ? "error" : ""}
                                        help={formErrors.examTime}
                                    >
                                        <Input 
                                            size="small" 
                                            name="examTime" 
                                            value={newRowData.examTime} 
                                            onChange={handleNewRowChange}
                                            placeholder={t('enterExamTime')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('innerEnvelope')}>
                                        <Input 
                                            size="small" 
                                            name="innerEnvelope" 
                                            value={newRowData.innerEnvelope} 
                                            onChange={handleNewRowChange}
                                            placeholder={t('enterInnerEnvelope')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('outerEnvelope')}>
                                        <Input 
                                            size="small" 
                                            name="outerEnvelope" 
                                            value={newRowData.outerEnvelope} 
                                            onChange={handleNewRowChange}
                                            placeholder={t('enterOuterEnvelope')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item 
                                        label={<>
                                            {t('quantity')} <span style={{ color: 'red' }}>*</span>
                                        </>}
                                        validateStatus={formErrors.quantity ? "error" : ""}
                                        help={formErrors.quantity}
                                    >
                                        <Input 
                                            size="small" 
                                            type="number" 
                                            name="quantity" 
                                            value={newRowData.quantity} 
                                            onChange={handleNewRowChange}
                                            placeholder={t('enterQuantity')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label=" ">
                                        <Button size="small" onClick={handleAddRow} className={`${customDark === "dark-dark" ? `border` : ``}`}>
                                            {t('add')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </>
            )}

            {showTable && (
                <Table
                    columns={columns}
                    dataSource={getFilteredData()}
                    pagination={{
                        pageSize: pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '25', '50', '100'],
                        total: getFilteredData().length,
                        showTotal: (total, range) => `${range[0]}-${range[1]} ${t('of')} ${total} ${t('items')}`,
                        onShowSizeChange: handlePageSizeChange,
                        className: `p-2 rounded rounded-top-0 ${customDark === "dark-dark" ? `bg-white` : ``} mt`
                    }}
                    scroll={{ x: true }}
                    className={`${customDark === "default-dark" ? "thead-default" :
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
                dispatchedLots={dispatchedLots}
            />
        </div>
    );
};

export default ViewQuantitySheet;
