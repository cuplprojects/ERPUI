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
        // Ensure interim quantity is smaller than total quantity
        if (parseFloat(interimQuantity) >= data.quantity) {
            alert("Interim quantity must be smaller than total quantity.");
            return;
        }

        try {
            let existingTransactionData;
            if (data.transactionId) {
                // Fetch existing transaction data if transactionId exists
                const response = await API.get(`/Transactions/${data.transactionId}`);
                existingTransactionData = response.data;
            }

            const postData = {
                transactionId: data.transactionId || 0,
                interimQuantity: interimQuantity, // Retain existing quantity
                remarks: existingTransactionData ? existingTransactionData.remarks : "", // Retain existing remarks
                projectId: data.projectId,
                quantitysheetId: data.srNo || 0,
                processId: processId,
                zoneId: existingTransactionData ? existingTransactionData.zoneId : 0,
                status: existingTransactionData ? existingTransactionData.status : 0, // Retain existing status
                alarmId: existingTransactionData ? existingTransactionData.alarmId : 0,
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

            handleSave(interimQuantity); // Call save function after successful API call
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
                                <span className="fw-bold">Status </span>:
                                <span
                                    className={`fw-bold ${
                                        data.status === 0 ? 'text-danger' :
                                        data.status === 1 ? 'text-primary' :
                                        data.status === 2 ? 'text-success' : ''
                                    }`}
                                >
                                    {statusMapping[data.status]}
                                </span>
                            </div>
                        </div>
                        <div className="details mb-3 d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-bold">Total Quantity </span>: {data.quantity}
                            </div>
                            <div>
                                <span className="fw-bold">Interim Quantity </span>: {data.interimQuantity}
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
                <Button 
                    className='custom-theme-dark-btn custom-theme-dark-border' 
                    onClick={handleSubmit}
                    disabled={!interimQuantity} // Disable if interimQuantity is empty
                >
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InterimQuantityModal;
