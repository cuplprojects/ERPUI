import React, { useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';

const ColumnToggleModal = ({ show, handleClose, columnVisibility, setColumnVisibility, featureData, hasFeaturePermission }) => {
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = useMemo(() => getCssClasses(), [getCssClasses]);
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const { t } = useTranslation();

    const handleToggle = (column) => {
        setColumnVisibility((prevVisibility) => ({
            ...prevVisibility,
            [column]: !prevVisibility[column],
        }));
    };

    const columns = [
        { key: 'interimQuantity', label: t('interimQuantity') },
        { key: 'remarks', label: t('remarks') },
        { key: 'teamAssigned', label: t('teamAssigned') },
        { key: 'paper', label: t('paper') },
        { key: 'course', label: t('course') },
        { key: 'subject', label: t('subject') }
    ];

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className={`${customDark} ${customDarkText}`}>
                <Modal.Title className={`${customLightText} fs-4`}>{t('toggleColumns')}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${customLight} ${customDarkText} p-4`}>
                <Form>
                    {columns.map((column) => (
                        <Form.Group key={column.key} className="mb-3">
                            <Form.Check
                                type="switch"
                                id={`custom-switch-${column.key}`}
                                label={column.label}
                                checked={columnVisibility[column.key]}
                                onChange={() => handleToggle(column.key)}
                            />
                        </Form.Group>
                    ))}
                </Form>
            </Modal.Body>
            <Modal.Footer className={`${customLight} justify-content-center`}>
                <Button 
                    className={`${customBtn} border-0 px-4 py-2 fs-5`} 
                    onClick={handleClose}
                >
                    {t('close')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ColumnToggleModal;