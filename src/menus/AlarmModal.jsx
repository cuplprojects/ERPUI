import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaMicrophone } from 'react-icons/fa6';
import API from '../CustomHooks/MasterApiHooks/api'; // Adjust import as necessary

const statusMapping = {
    0: 'Pending',
    1: 'Started',
    2: 'Completed',
};

const AlarmModal = ({ show, handleClose, data, processId, handleSave }) => {
    console.log(data);
    const [alarmType, setAlarmType] = useState('');
    const [alarmId, setAlarmId] = useState(null); // State to hold selected alarmId
    const [customMessage, setCustomMessage] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [alarmOptions, setAlarmOptions] = useState([]); // State to hold alarm types

    const handleAlarmTypeChange = (e) => {
        const selectedOption = alarmOptions.find(option => option.message === e.target.value);
        setAlarmType(selectedOption ? selectedOption.message : '');
        setAlarmId(selectedOption ? selectedOption.alarmId : null); // Set alarmId based on selected option
        setShowCustomInput(e.target.value === 'Other');
    };

    const getAlarm = async () => {
        try {
            const response = await API.get('/alarms'); // Adjust endpoint as necessary
            setAlarmOptions(response.data); // Set alarm options from API response
        } catch (error) {
            console.error("Failed to fetch alarm types", error);
        }
    };

    useEffect(() => {
        getAlarm();
    }, []); // Add an empty dependency array to run once on mount

    const handleSubmit = async () => {
       
        try {
            let existingTransactionData;
            if (data.transactionId) {
                // Fetch existing transaction data if transactionId exists
                const response = await API.get(`/Transactions/${data.transactionId}`);
                existingTransactionData = response.data;
            }

            const postData = {
                transactionId: data.transactionId || 0,
                interimQuantity: data.interimQuantity || 0, // Retain existing quantity
                remarks: existingTransactionData ? existingTransactionData.remarks : "", // Retain existing remarks
                projectId: data.projectId,
                quantitysheetId: data.srNo || 0,
                processId: processId,
                zoneId: existingTransactionData ? existingTransactionData.zoneId : 0,
                status: existingTransactionData ? existingTransactionData.status : 0, // Retain existing status
                alarmId: alarmId,
                lotNo: data.lotNo,
                teamId: existingTransactionData ? existingTransactionData.teamId : 0,               
            };

            if (data.transactionId) {
                // Update existing transaction
                const response = await API.put(`/Transactions/${data.transactionId}`, postData);
                console.log('Update Response:', response.data);
            } else {
                // Create a new transaction
                const response = await API.post('/Transactions', postData);
                console.log('Create Response:', response.data);
            }
            handleSave(alarmId)
            handleClose(); // Close modal
            setAlarmType('');
            setAlarmId(null); // Reset alarmId
            setCustomMessage('');
        } catch (error) {
            console.error('Error saving alarm:', error);
        }
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
                                <span className="fw-bold">Status </span>:
                                <span className={`fw-bold ${data.status === 0 ? 'text-danger' :
                                        data.status === 1 ? 'text-primary' :
                                        data.status === 2 ? 'text-success' : ''
                                    }`}>
                                    {statusMapping[data.status]}
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
                        {alarmOptions.map(option => (
                            <option key={option.id} value={option.message}>{option.message}</option>
                        ))}
                        <option value="Other">Other</option>
                    </Form.Control>
                </Form.Group>
                {showCustomInput && (
                    <Form.Group controlId="formCustomMessage">
                        <Form.Label>Custom Message</Form.Label>
                        <div className='d-flex justify-content-between align-items-center'>
                            <div className="text-box w-75">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your custom message"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                />
                            </div>
                            <div className="mic rounded">
                                <Button className='custom-theme-dark-btn'>
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
