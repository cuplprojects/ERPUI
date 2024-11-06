import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

import { FaMicrophone } from 'react-icons/fa6';

import API from '../CustomHooks/MasterApiHooks/api'; // Adjust import as necessary


const AlarmModal = ({ show, handleClose, handleSave, data }) => {
    const [alarmType, setAlarmType] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);


    const handleSubmit = async () => {
        try {
            let existingTransactionData;
            if (data.transactionId) {
                // Fetch existing transaction data if transactionId exists
                const response = await API.get(`/Transactions/${data.transactionId}`);
                existingTransactionData = response.data;
            }

            // If "Other" is selected, use customMessage as alarmId
            const finalAlarmId = alarmType === 'Other' && customMessage.trim() !== "" ? customMessage : alarmId;

            // Validate that alarmId is not null or empty
            if (!finalAlarmId) {
                alert("Alarm ID is required. Please select a valid alarm type or enter a custom message.");
                return; // Prevent submission if alarmId is missing
            }

            // Convert alarmId to string if it's not already
            const alarmIdString = String(finalAlarmId); // Ensure alarmId is always a string

            // Ensure the `transaction` field is properly set. Assuming `transactionId` should be passed.
            const postData = {
                transactionId: data.transactionId || 0, // Transaction field as per the API requirement
                interimQuantity: existingTransactionData ? existingTransactionData.interimQuantity : 0, // Retain existing quantity
                remarks: existingTransactionData ? existingTransactionData.remarks : "", // Retain existing remarks
                projectId: data.projectId,
                quantitysheetId: data.srNo || 0,
                processId: processId,
                zoneId: existingTransactionData ? existingTransactionData.zoneId : 0,
                machineId: existingTransactionData ? existingTransactionData.machineId : 0,
                status: existingTransactionData ? existingTransactionData.status : 0, // Retain existing status
                alarmId: alarmIdString,  // Ensure alarmId is a string
                lotNo: data.lotNo,
                teamId: existingTransactionData ? existingTransactionData.teamId : 0,
                voiceRecording: existingTransactionData ? existingTransactionData.voiceRecording : ""
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

            handleSave(alarmIdString); // Pass the final alarmId (custom or selected)
            handleClose(); // Close modal
            setAlarmType('');
            setAlarmId(null); // Reset alarmId
            setCustomMessage(''); // Reset custom message
        } catch (error) {
            console.error('Error saving alarm:', error);
        }

    };

    const handleAlarmTypeChange = (e) => {
        const selectedOption = alarmOptions.find(option => option.message === e.target.value);

        if (e.target.value === 'Other') {
            // When "Other" is selected, the alarmId should be set to the custom message
            setAlarmType('Other');
            setShowCustomInput(true); // Show the custom input field
        } else {
            // When a valid alarm type is selected, set the corresponding alarmId
            setAlarmType(selectedOption ? selectedOption.message : '');
            setAlarmId(selectedOption ? selectedOption.alarmId : null); // Set the alarmId based on selected option
            setShowCustomInput(false); // Hide the custom input field
        }
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
