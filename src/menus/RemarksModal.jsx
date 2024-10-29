import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';

const statusMapping = {
    0: 'Pending',
    1: 'Started',
    2: 'Completed',
};

const RemarksModal = ({ show, handleClose, data, processId,handleSave }) => {
    const [remarks, setRemarks] = useState('');
    

    const handleSubmit = async() => {
        try {
            let existingTransactionData;
            if (data.transactionId) {
                // Fetch existing transaction data if transactionId exists
                const response = await API.get(`/Transactions/${data.transactionId}`);
                existingTransactionData = response.data;
            }

            const postData = {
                transactionId: data.transactionId || 0,
                interimQuantity: existingTransactionData ? existingTransactionData.interimQuantity : 0, // Retain existing quantity
                remarks: remarks, // Retain existing remarks
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
            handleSave(remarks)
            handleClose(); // Close modal
        } catch (error) {
            console.error('Error updating remarks:', error);
        }
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
