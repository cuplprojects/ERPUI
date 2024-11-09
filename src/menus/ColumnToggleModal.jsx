import React, { useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';


const ColumnToggleModal = ({ show, handleClose, columnVisibility, setColumnVisibility, featureData,hasFeaturePermission }) => {
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = useMemo(() => getCssClasses(), [getCssClasses]);
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;


    const handleToggle = (column) => {
        setColumnVisibility((prevVisibility) => ({
            ...prevVisibility,
            [column]: !prevVisibility[column],
        }));
    };

    const columns = ['Interim Quantity', 'Remarks', 'Team Assigned', 'Paper', 'Course', 'Subject'];

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className={`${customDark} ${customDarkText}`}>
                <Modal.Title className={`${customLightText} fs-4`}>Toggle Columns</Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${customLight} ${customDarkText} p-4`}>
                <Form>

                    {['Interim Quantity', 'Remarks', 'Team Assigned', 'Course', 'Subject', 'Paper'].map((column) => (
                        <Form.Group key={column} className="mb-3">
                            <Form.Check
                                type="switch"
                                id={`custom-switch-${column}`}
                                label={column}
                                checked={columnVisibility[column]}
                                onChange={() => handleToggle(column)}
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
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ColumnToggleModal;