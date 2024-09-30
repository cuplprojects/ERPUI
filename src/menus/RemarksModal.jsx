import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const RemarksModal = ({ show, handleClose, handleSave , data }) => {
    const [remarks, setRemarks] = useState('');

    const handleSubmit = () => {
        handleSave(remarks);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Set Remarks</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {data ? (
                    <div className="details mb-3 d-flex justify-content-between align-items-center">
                        <div>
                            <span className="fw-bold">Catch No </span>: {data.catchNumber}
                        </div>
                        <div>
                            <span className="fw-bold ">Status </span>:
                            <span
                                className={`fw-bold ${data.status === 'Pending' ? 'text-danger' : data.status === 'Started' ? 'text-primary' : data.status === 'Completed' ? 'text-success' : ''}`}
                            >
                                {data.status}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div>No data available</div>
                )}
                <Form.Group controlId="formRemarks">
                    <Form.Label>Remarks</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RemarksModal;
