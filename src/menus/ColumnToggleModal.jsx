import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ColumnToggleModal = ({ show, handleClose, columnVisibility, setColumnVisibility }) => {
    const handleToggle = (column) => {
        setColumnVisibility((prevVisibility) => ({
            ...prevVisibility,
            [column]: !prevVisibility[column],
        }));
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Toggle Columns</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {['Interim Quantity', 'Remarks', 'Team Assigned', 'Paper', 'Course', 'Subject'].map((column) => (
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
            <Modal.Footer>
                <Button className='custom-theme-dark-btn' onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ColumnToggleModal;