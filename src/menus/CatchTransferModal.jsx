import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Tag } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { decrypt } from '../Security/Security';
import API from '../CustomHooks/MasterApiHooks/api';
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';
import { Modal as BootstrapModal } from 'react-bootstrap';

const CatchTransferModal = ({ visible, onClose, catches, onCatchesChange, lots = [], selectedLotNo, fetchQuantity }) => {
    const { t } = useTranslation();
    const [selectedLot, setSelectedLot] = useState(null);
    const { encryptedProjectId } = useParams();
    const projectId = decrypt(encryptedProjectId);
    const [projectName, setProjectName] = useState('');
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

    // Filter out the current lot from available lots
    const availableLots = lots.filter(lot => lot !== selectedLotNo);

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

    const handleTransfer = async () => {
        if (!selectedLot) return;
        
        const payload = {
            projectId: projectId,
            sourceLotNo: selectedLotNo,
            targetLotNo: selectedLot,
            catchIds: catches.map(catch_ => catch_.id)
        };

        try {
            await API.put('/QuantitySheet/transfer-catches', payload);
            await fetchQuantity();
            setSelectedLot(null);
            onClose();
        } catch (error) {
            console.error('Transfer failed:', error);
        }
    };

    const handleTagClose = (catchItem) => {
        const updatedCatches = catches.filter(item => item.id !== catchItem.id);
        onCatchesChange(updatedCatches);
        if (updatedCatches.length === 0) {
            setSelectedLot(null);
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedLot(null);
        onClose();
    };

    // Don't render if not visible
    if (!visible) {
        return null;
    }

    return (
        <BootstrapModal show={visible} onHide={handleClose} className={`${customDark === "dark-dark" ? "" : ""}`}>
            <BootstrapModal.Header closeButton={false} className={customDark}>
                <BootstrapModal.Title className={customLightText}>
                    <div>{t('transferCatches')} : {projectName} From Lot-{selectedLotNo}</div>
                   
                </BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body className={customLight}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px' }} className={customDarkText}>
                        {t('selectedCatchesWillBeTransferredToSelectedLot')}:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <RightOutlined style={{ fontSize: '20px' }} className={customDarkText} />
                        </div>
                        
                        <div>
                            <Select
                                placeholder={t('selectLot')}
                                onChange={setSelectedLot}
                                style={{ width: '200px' }}
                                className={`${customMid} ${customDarkText} rounded`}
                            >
                                {availableLots.map(lot => (
                                    <Select.Option key={lot} value={lot} className={customDarkText}>
                                        {t('lot')} - {lot}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="fs-6 mt-2 text-center">
                {t('lot')} {selectedLotNo} → {selectedLot ? `${t('lot')} ${selectedLot}` : t('selectLot')}
                </div>
            </BootstrapModal.Body>
            <BootstrapModal.Footer className={customDark}>
                <Button onClick={handleClose} className={`${customBtn}`}>{t('cancel')}</Button>
                <Button onClick={handleTransfer} disabled={!selectedLot} className={`${customBtn}`}>{t('transfer')}</Button>
            </BootstrapModal.Footer>
        </BootstrapModal>
    );
};

export default CatchTransferModal;
