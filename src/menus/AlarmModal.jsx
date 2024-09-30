import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaMicrophone } from 'react-icons/fa6';

const AlarmModal = ({ show, handleClose, handleSave, data }) => {
    const [alarmType, setAlarmType] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleAlarmTypeChange = (e) => {
        const value = e.target.value;
        setAlarmType(value);
        setShowCustomInput(value === 'Other');
    };

    const handleSubmit = () => {
        const alarm = showCustomInput ? customMessage : alarmType;
        handleSave(alarm);
        handleClose();
        setAlarmType();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Set Alarm</Modal.Title>
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
                        <div className='details mb-3 d-flex justify-content-between align-items-center'>
                            <div>
                                <span className='fw-bold'>Total Quantity : </span>
                                <span className=''>{data.quantity}</span>
                            </div>
                            <div>
                                <span className='fw-bold'>Remaining Quantity : </span>
                                <span className=''>{data.quantity - data.interimQuantity}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div>No data available</div>
                )}
                <Form.Group controlId="formAlarmType">
                    <Form.Label>Alarm Type</Form.Label>
                    <Form.Control
                        as="select"
                        value={alarmType}
                        onChange={handleAlarmTypeChange}
                    >
                        <option value="">Select an alarm type</option>
                        <option value="Machine breakdown">Machine breakdown</option>
                        <option value="Paper shortage">Paper shortage</option>
                        <option value="Manpower not available">Manpower not available</option>
                        <option value="Plate replacement">Plate replacement</option>
                        <option value="Item removed from the lot">Item removed from the lot</option>
                        <option value="Item added in the lot">Item added in the lot</option>
                        <option value="Quantity increased">Quantity increased</option>
                        <option value="Quantity decreased  ">Quantity decreased</option>
                        <option value="Quantity shortfall">Quantity shortfall</option>
                        <option value="Other">Other...</option>
                    </Form.Control>
                </Form.Group>
                {showCustomInput && (
                    <Form.Group controlId="formCustomMessage">
                        <Form.Label>Custom Message</Form.Label>
                        <div className='d-flex justify-content-between align-items-cneter'>
                            <div className="text-box w-75" >
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your custom message"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                />
                            </div>
                            {/* Mic button with icon */}
                            <div className="mic rounded">
                                <Button className='custom-theme-dark-btn' >
                                    <FaMicrophone size={20} />
                                </Button>
                            </div>
                        </div>
                    </Form.Group>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleClose}>
                    Close
                </Button>
                <Button className='custom-theme-dark-btn' onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AlarmModal;
