import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api'; // Adjust import as necessary

const statusMapping = {
    0: 'Pending',
    1: 'Started',
    2: 'Completed',
};
const InterimQuantityModal = ({ show, handleClose, handleSave, data, processId }) => {
    const [interimQuantity, setInterimQuantity] = useState('');


    const handleSubmit = async () => {
        // Calculate total interim quantity including existing and new
        const totalInterimQuantity = data.interimQuantity + parseFloat(interimQuantity);

        // Ensure total interim quantity is not greater than total quantity
        if (totalInterimQuantity > data.quantity) {
            alert("Total interim quantity cannot be greater than total quantity.");
            return;
        }

        try {
            let existingTransactionData;
            if (data.transactionId) {
                const response = await API.get(`/Transactions/${data.transactionId}`);
                existingTransactionData = response.data;
            }

            const postData = {
                transactionId: data.transactionId || 0,
                interimQuantity: totalInterimQuantity,
                remarks: existingTransactionData ? existingTransactionData.remarks : "", 
                projectId: data.projectId,
                quantitysheetId: data.srNo || 0,
                processId: processId,
                zoneId: existingTransactionData ? existingTransactionData.zoneId : 0,
                machineId: existingTransactionData ? existingTransactionData.machineId : 0,
                status: existingTransactionData ? existingTransactionData.status : 0,
                alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
                lotNo: data.lotNo,
                teamId: existingTransactionData ? existingTransactionData.teamId : [],  
                voiceRecording: existingTransactionData? existingTransactionData.voiceRecording : ""             
            };

            // Always use POST
            const response = await API.post('/Transactions', postData);
            console.log('Response:', response.data);
            
            handleSave(interimQuantity);
            setInterimQuantity('');
            handleClose(); // Close modal
        } catch (error) {
            console.error('Error updating interim quantity:', error);
        }
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
                                <span className={`fw-bold ${data.status === 0 ? 'text-danger' :
                                        data.status === 1 ? 'text-primary' :
                                        data.status === 2 ? 'text-success' : ''
                                    }`}>
                                    {statusMapping[data.status]}
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
