import React, { useState, useEffect } from 'react';
import { Modal, Button, Tag, Checkbox, DatePicker } from 'antd';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { decrypt } from '../Security/Security';
import API from '../CustomHooks/MasterApiHooks/api';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { Modal as BootstrapModal } from 'react-bootstrap';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

// Extend dayjs with the isBetween plugin
dayjs.extend(isBetween);

const CatchTransferModal = ({ visible, onClose, catches, onCatchesChange, lots = [], selectedLotNo, fetchQuantity, dispatchedLots = [] }) => {
    const { t } = useTranslation();
    const [selectedLot, setSelectedLot] = useState(null);
    const { encryptedProjectId } = useParams();
    const projectId = decrypt(encryptedProjectId);
    const [projectName, setProjectName] = useState('');
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const [selectedDate, setSelectedDate] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [key, setKey] = useState(0);
    const [lotDateRanges, setLotDateRanges] = useState({});

    useEffect(() => {
        const fetchProjectName = async () => {
            try {
                const response = await API.get(`/Project/${projectId}`);
                setProjectName(response.data.name);
            } catch (error) {
                console.error(t('failedToFetchProjectName'), error);
            }
        };

        const fetchLotDateRanges = async () => {
            try {
                const response = await API.get(`/QuantitySheet/lot-dates?projectId=${projectId}`);
                if (response.data && typeof response.data === 'object') {
                    setLotDateRanges(response.data);
                } else {
                    console.error('Invalid date ranges format:', response.data);
                    setLotDateRanges({});
                }
            } catch (error) {
                console.error('Failed to fetch lot date ranges:', error);
                setLotDateRanges({});
            }
        };

        if (visible) {
            fetchProjectName();
            fetchLotDateRanges();
        }
    }, [projectId, visible]);

    // Handle date selection and checking against lot date ranges
    const handleDateChange = (date) => {
        const formattedDate = date ? date.format('DD-MM-YYYY') : null;
        setSelectedDate(formattedDate);
    
        if (formattedDate) {
            const selectedDateObj = dayjs(formattedDate, 'DD-MM-YYYY');
    
            // Find the lot that matches the selected date range
            let foundLot = null;
            let firstLot = null;
            let lastLot = null;
            
            const lotEntries = Object.entries(lotDateRanges);
    
            // Sort the lots by their min date for easier comparison
            const sortedLots = lotEntries.sort((a, b) => {
                const aMinDate = dayjs(a[1].minDate, 'DD-MM-YYYY');
                const bMinDate = dayjs(b[1].minDate, 'DD-MM-YYYY');
                return aMinDate.isBefore(bMinDate) ? -1 : 1;
            });
    
            // Loop through the sorted lots to check if the selected date is within any lot's range
            sortedLots.forEach(([lot, range]) => {
                const minDate = dayjs(range.minDate, 'DD-MM-YYYY');
                const maxDate = dayjs(range.maxDate, 'DD-MM-YYYY');
    
                // Check if the selected date is within the lot's date range
                if (selectedDateObj.isBetween(minDate, maxDate, null, '[]')) {
                    foundLot = lot;
                }
                // Track the first and last lots based on the minDate
                if (!firstLot) firstLot = lot;
                lastLot = lot;
            });
    
            if (foundLot) {
                setSelectedLot(foundLot);
                setIsConfirmed(true);  // Enable confirmation once a valid lot is found
            } else if (selectedDateObj.isBefore(dayjs(sortedLots[0][1].minDate, 'DD-MM-YYYY'))) {
                // If the selected date is earlier than the first lot's minDate, assign it to the first lot
                setSelectedLot(firstLot);
                setIsConfirmed(true);
            } else if (selectedDateObj.isAfter(dayjs(sortedLots[sortedLots.length - 1][1].maxDate, 'DD-MM-YYYY'))) {
                // If the selected date is later than the last lot's maxDate, assign it to the last lot
                setSelectedLot(lastLot);
                setIsConfirmed(true);
            } else {
                setSelectedLot(null);
                setIsConfirmed(false);
            }
        } else {
            setSelectedLot(null);
            setIsConfirmed(false);
        }
    };
    

    const handleTransfer = async () => {
        try {
            if (!selectedLot || !selectedDate || !isConfirmed) {
                console.log('Validation failed:', { selectedLot, selectedDate, isConfirmed });
                return;
            }

            const payload = {
                projectId: projectId,
                sourceLotNo: selectedLotNo,
                targetLotNo: selectedLot,
                catchIds: catches.map(catch_ => catch_.id),
                newExamDate: selectedDate
            };

            const response = await API.put('/QuantitySheet/transfer-catches', payload);
            if (response && response.status === 200) {
                try {
                    await fetchQuantity();
                } catch (fetchError) {
                    console.error('Error fetching updated quantity:', fetchError);
                }
                resetModal();
            }
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

    if (!visible) {
        return null;
    }

    return (
        <BootstrapModal show={visible} onHide={resetModal} className={`${customDark === "dark-dark" ? "" : ""}`}>
            <BootstrapModal.Header closeButton={false} className={customDark}>
                <BootstrapModal.Title className={customLightText}>
                    {t('transferCatches')} : {projectName} {t('fromLot')} - {selectedLotNo} {t('from')}
                </BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body className={customLight}>
                <div className="mb-4">
                    <div className={`mb-3 ${customDarkText}`}>
                        {t('selectedCatchesWillBeTransferredToSelectedLot')}:
                    </div>
                    
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

                    <div className="mb-3">
                        <label className={`${customDarkText} mb-2`}>{t('selectNewExamDate')}:</label>
                        <div className="mt-2">
                            <DatePicker
                                key={key}
                                onChange={handleDateChange}
                                value={selectedDate ? dayjs(selectedDate, 'DD-MM-YYYY') : null}
                                format="DD-MM-YYYY"
                                className={`w-100 ${customDarkText}`}
                                placeholder={t('selectDate')}
                            />
                        </div>
                    </div>

                    {selectedLot && (
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
