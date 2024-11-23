import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Tag, Checkbox, DatePicker } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { decrypt } from '../Security/Security';
import API from '../CustomHooks/MasterApiHooks/api';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { Modal as BootstrapModal } from 'react-bootstrap';
import dayjs from 'dayjs';

const CatchTransferModal = ({ visible, onClose, catches, onCatchesChange, lots = [], selectedLotNo, fetchQuantity, dispatchedLots = [] }) => {
    const { t } = useTranslation();
    const [selectedLot, setSelectedLot] = useState(null);
    const { encryptedProjectId } = useParams();
    const projectId = decrypt(encryptedProjectId);
    const [projectName, setProjectName] = useState('');
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [lotDates, setLotDates] = useState({
        previousLot: [],
        nextLot: []
    });
    const [isFirstLot, setIsFirstLot] = useState(false);
    const [isLastLot, setIsLastLot] = useState(false);
    const [key, setKey] = useState(0); // Add key for DatePicker

    useEffect(() => {
        const fetchProjectName = async () => {
            try {
                const response = await API.get(`/Project/${projectId}`);
                setProjectName(response.data.name);
            } catch (error) {
                console.error(t('failedToFetchProjectName'), error);
            }
        };

        if (visible) {
            fetchProjectName();
        }
    }, [projectId, visible]);

    // Filter out the current lot and dispatched lots from available lots
    const availableLots = lots.filter(lot => 
        lot !== selectedLotNo && !dispatchedLots.includes(lot)
    );

    // Fetch available dates when target lot is selected
    useEffect(() => {
        const fetchAvailableDates = async () => {
            if (selectedLot) {
                try {
                    const response = await API.get(`/QuantitySheet/exam-dates?projectId=${projectId}&lotNo=${selectedLot}`);
                    setAvailableDates(response.data);
                } catch (error) {
                    console.error('Failed to fetch available dates:', error);
                }
            }
        };

        fetchAvailableDates();
    }, [selectedLot]);

    // Fetch date range from backend when lot is selected
    useEffect(() => {
        const fetchDateRange = async () => {
            if (!selectedLot) return;

            try {
                const response = await API.get(`/QuantitySheet/calculate-date-range?projectId=${projectId}&selectedLot=${selectedLot}`);
                const { startDate, endDate, isFirstLot, isLastLot } = response.data;

                // Set date range based on backend response
                setDateRange({
                    start: dayjs(startDate),
                    end: dayjs(endDate)
                });

                // Reset selected date and increment key to force re-render
                setSelectedDate(null);
                setKey(prevKey => prevKey + 1);

                // Set flags for first/last lot
                setIsFirstLot(isFirstLot);
                setIsLastLot(isLastLot);
            } catch (error) {
                console.error('Failed to fetch date range:', error);
            }
        };

        fetchDateRange();
    }, [selectedLot, projectId]);

    // Custom date disabling function
    const disabledDate = (current) => {
        if (!dateRange.start || !dateRange.end) return false;

        // Convert current to start of day for consistent comparison
        const currentDate = current.startOf('day');
        const startDate = dateRange.start.startOf('day');
        const endDate = dateRange.end.startOf('day');

        // Check if date is outside the valid range
        const isOutsideRange = currentDate.isBefore(startDate) || currentDate.isAfter(endDate);

        return isOutsideRange;
    };

    // Update the date selection handler
    const handleDateChange = (date) => {
        setSelectedDate(date ? date.format('DD-MM-YYYY') : null);
    };

    const handleTransfer = async () => {
        if (!selectedLot || !selectedDate || !isConfirmed) return;
        
        const payload = {
            projectId: projectId,
            sourceLotNo: selectedLotNo,
            targetLotNo: selectedLot,
            catchIds: catches.map(catch_ => catch_.id),
            newExamDate: selectedDate
        };

        try {
            await API.put('/QuantitySheet/transfer-catches', payload);
            await fetchQuantity();
            resetModal();
        } catch (error) {
            console.error('Transfer failed:', error);
        }
    };

    const resetModal = () => {
        setSelectedLot(null);
        setSelectedDate(null);
        setIsConfirmed(false);
        onClose();
    };

    const handleTagClose = (catchItem) => {
        const updatedCatches = catches.filter(item => item.id !== catchItem.id);
        onCatchesChange(updatedCatches);
        if (updatedCatches.length === 0) {
            setSelectedLot(null);
            onClose();
        }
    };

    // Don't render if not visible
    if (!visible) {
        return null;
    }

    return (
        <BootstrapModal show={visible} onHide={resetModal} className={`${customDark === "dark-dark" ? "" : ""}`}>
            <BootstrapModal.Header closeButton={false} className={customDark}>
                <BootstrapModal.Title className={customLightText}>
                    {t('transferCatches')} : {projectName} {t('fromLot')}-{selectedLotNo}
                </BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body className={customLight}>
                <div className="mb-4">
                    <div className={`mb-3 ${customDarkText}`}>
                        {t('selectedCatchesWillBeTransferredToSelectedLot')}:
                    </div>
                    
                    {/* Selected Catches */}
                    <div className="mb-3">
                        <label className={`${customDarkText} mb-2`}>{t('selectedCatches')}:</label>
                        <div className="d-flex flex-wrap gap-2">
                            {catches.map(catchItem => (
                                <Tag 
                                    key={catchItem.id} 
                                    closable 
                                    onClose={(e) => {
                                        e.preventDefault();
                                        handleTagClose(catchItem);
                                    }}
                                    className={`${customMid} ${customDarkText} fs-6`}
                                >
                                    {catchItem.catchNo}
                                </Tag>
                            ))}
                        </div>
                    </div>

                    {/* Target Lot Selection */}
                    <div className="mb-3">
                        <label className={`${customDarkText} mb-2`}>{t('targetLot')}:</label>
                        <Select
                            placeholder={t('selectLot')}
                            onChange={setSelectedLot}
                            value={selectedLot}
                            style={{ width: '100%' }}
                            className={`${customMid} ${customDarkText} rounded`}
                        >
                            {availableLots.map(lot => (
                                <Select.Option key={lot} value={lot} className={customDarkText}>
                                    {t('lot')} - {lot}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    {/* Date Selection with Calendar */}
                    {selectedLot && (
                        <div className="mb-3">
                            <label className={`${customDarkText} mb-2`}>{t('selectNewExamDate')}:</label>
                            <div className="mt-2">
                                <DatePicker
                                    key={key} // Add key prop to force re-render
                                    disabledDate={disabledDate}
                                    onChange={handleDateChange}
                                    value={selectedDate ? dayjs(selectedDate, 'DD-MM-YYYY') : null}
                                    format="DD-MM-YYYY"
                                    className={`w-100 ${customDarkText}`}
                                    placeholder={t('selectDate')}
                                    minDate={dateRange.start}
                                    maxDate={dateRange.end}
                                    defaultValue={dateRange.start}
                                    defaultPickerValue={dateRange.start}
                                />
                            </div>
                        </div>
                    )}

                    {/* Confirmation Checkbox */}
                    {selectedLot && selectedDate && (
                        <div className="mt-4">
                            <Checkbox 
                                checked={isConfirmed} 
                                onChange={(e) => setIsConfirmed(e.target.checked)}
                                className={customDarkText}
                            >
                                {t('confirmTransferAndDateChange')}
                            </Checkbox>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className={`fs-6 mt-3 text-center ${customDarkText}`}>
                    {t('transferSummary')}: {t('lot')} {selectedLotNo} → {selectedLot ? `${t('lot')} ${selectedLot}` : t('selectLot')}
                    {selectedDate && <div>{t('newExamDate')}: {selectedDate}</div>}
                </div>
            </BootstrapModal.Body>
            <BootstrapModal.Footer className={customDark}>
                <Button onClick={resetModal} className={`${customBtn}`}>{t('cancel')}</Button>
                <Button 
                    onClick={handleTransfer} 
                    disabled={!selectedLot || !selectedDate || !isConfirmed} 
                    className={`${customBtn}`}
                >
                    {t('transfer')}
                </Button>
            </BootstrapModal.Footer>
        </BootstrapModal>
    );
};

export default CatchTransferModal;
