import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const InterimQuantityModal = ({ show, handleClose, handleSave, data }) => {
    const [interimQuantity, setInterimQuantity] = useState('');

    const handleSubmit = () => {
        handleSave(interimQuantity);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Set Interim Quantity</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {data ? (
                    <>
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
                        <div className="details mb-3 d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-bold">Total Quantity </span>: {data.quantity}
                            </div>
                            <div>
                                <span className="fw-bold ">Interim Quantity </span>:{data.interimQuantity}
                            </div>
                        </div>
                    </>
                ) : (
                    <div>No data available</div>
                )}
                <Form.Group controlId="formInterimQuantity">
                    <Form.Label>Interim Quantity</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Enter interim quantity"
                        value={interimQuantity}
                        onChange={(e) => setInterimQuantity(e.target.value)}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleClose}>
                    Close
                </Button>
                <Button className='custom-theme-dark-btn custom-theme-dark-border' onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InterimQuantityModal;
