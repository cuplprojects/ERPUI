
// import React, { useState } from 'react';
// import { Modal, Button, Form } from 'react-bootstrap';
// import API from '../CustomHooks/MasterApiHooks/api';

// const statusMapping = {
//     0: 'Pending',
//     1: 'Started',
//     2: 'Completed',
// };

// const RemarksModal = ({ show, handleClose, data, processId,handleSave }) => {
//     const [remarks, setRemarks] = useState('');
    

//     const handleSubmit = async() => {
//         try {
//             let existingTransactionData;
//             if (data.transactionId) {
//                 // Fetch existing transaction data if transactionId exists
//                 const response = await API.get(`/Transactions/${data.transactionId}`);
//                 existingTransactionData = response.data;
//             }

//             const postData = {
//                 transactionId: data.transactionId || 0,
//                 interimQuantity: existingTransactionData ? existingTransactionData.interimQuantity : 0, // Retain existing quantity
//                 remarks: remarks, // Retain existing remarks
//                 projectId: data.projectId,
//                 quantitysheetId: data.srNo || 0,
//                 processId: processId,
//                 zoneId: existingTransactionData ? existingTransactionData.zoneId : 0,
//                 status: existingTransactionData ? existingTransactionData.status : 0, // Retain existing status
//                 alarmId: existingTransactionData ? existingTransactionData.alarmId : 0,
//                 lotNo: data.lotNo,
//                 teamId: existingTransactionData ? existingTransactionData.teamId : 0,               
//             };

//             if (data.transactionId) {
//                 // Update existing transaction
//                 const response = await API.put(`/Transactions/${data.transactionId}`, postData);
//                 console.log('Update Response:', response.data);
//             } else {
//                 // Create a new transaction
//                 const response = await API.post('/Transactions', postData);
//                 console.log('Create Response:', response.data);
//             }
//             handleSave(remarks)
//             handleClose(); // Close modal
//         } catch (error) {
//             console.error('Error updating remarks:', error);
//         }

// import React, { useState, useEffect } from 'react';
// import { Modal, Button, Form, Container, Row, Col } from 'react-bootstrap';
// import { useReactMediaRecorder } from "react-media-recorder";
// import { useStore } from 'zustand';
// import themeStore from './../store/themeStore';
// import { FaMicrophone } from 'react-icons/fa';

// const RemarksModal = ({ show, handleClose, handleSave, data }) => {
//     const [remarks, setRemarks] = useState('');
//     const [isRecording, setIsRecording] = useState(false);
//     const [recordingTime, setRecordingTime] = useState(0);

//     const { getCssClasses } = useStore(themeStore);
//     const cssClasses = getCssClasses();
//     const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

//     const {
//         status,
//         startRecording,
//         stopRecording,
//         mediaBlobUrl
//     } = useReactMediaRecorder({
//         video: false,
//         audio: true,
//         echoCancellation: true
//     });

//     useEffect(() => {
//         let interval;
//         if (isRecording) {
//             interval = setInterval(() => {
//                 setRecordingTime((prevTime) => prevTime + 1);
//             }, 1000);
//         } else {
//             clearInterval(interval);
//         }
//         return () => clearInterval(interval);
//     }, [isRecording]);

//     const formatTime = (time) => {
//         const minutes = Math.floor(time / 60).toString().padStart(2, '0');
//         const seconds = (time % 60).toString().padStart(2, '0');
//         return `${minutes}:${seconds}`;
//     };

//     const handleSubmit = () => {
//         handleSave(remarks, mediaBlobUrl);
//         handleClose();

//     };

//     const toggleRecording = () => {
//         if (isRecording) {
//             stopRecording();
//         } else {
//             startRecording();
//         }
//         setIsRecording(!isRecording);
//     };

//     const isSaveDisabled = remarks.trim() === '';

//     return (
//         <Modal show={show} onHide={handleClose} className={``} size="md">
//             <Modal.Header className={`${customDark === "dark-dark" ? `${customDark} border` : customDark}`}>
//                 <Modal.Title className={`${customLightText}`}>Set Remarks</Modal.Title>
//             </Modal.Header>

//             <Modal.Body>
//             {data ? (
//                     <div className="details mb-3 d-flex justify-content-between align-items-center">
//                         <div>
//                             <span className="fw-bold">Catch No </span>: {data.catchNumber}
//                         </div>
//                         <div>
//                                 <span className="fw-bold">Status </span>:
//                                 <span
//                                     className={`fw-bold ${
//                                         data.status === 0 ? 'text-danger' :
//                                         data.status === 1 ? 'text-primary' :
//                                         data.status === 2 ? 'text-success' : ''
//                                     }`}
//                                 >
//                                     {statusMapping[data.status]}
//                                 </span>
//                             </div>
//                     </div>
//                 ) : (
//                     <div>No data available</div>
//                 )}
//                 <Form.Group controlId="formRemarks">
//                     <Form.Label>Remarks</Form.Label>
//                     <Form.Control
//                         type="text"
//                         placeholder="Enter remarks"
//                         value={remarks}
//                         onChange={(e) => setRemarks(e.target.value)}
//                     />
//                 </Form.Group>

//             <Modal.Body className={`${customLight} ${customDark === "dark-dark" ? `${customDark} border-top-0 border border-bottom-0` : customDark}`}>
//                 <Container fluid className="">
//                     <Row>
//                         <Col xs={12} md={12}>
//                             <Form.Group controlId="formRemarks" className="mb-3">
//                                 <Form.Label className={`${customDarkText} fs-4`}>Remarks <span className="text-danger">*</span></Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={5}
//                                     placeholder="Enter remarks"
//                                     value={remarks}
//                                     onChange={(e) => setRemarks(e.target.value)}
//                                     className={`${customDarkText}`}
//                                     required
//                                 />
//                             </Form.Group>
//                         </Col>
//                         <Col xs={12} md={12}>
//                             <div className="voice-recording mb-3">
//                                 <h5 className={`${customDarkText}`}>Voice Recording</h5>
//                                 <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2">
//                                     <Button 
//                                         variant={isRecording ? "danger" : "primary"} 
//                                         onClick={toggleRecording}
//                                         className={`${customBtn} ${customLightBorder} mb-2 mb-md-0`}
//                                     >
//                                         <FaMicrophone className="me-2" />
//                                         {isRecording ? "Stop Recording" : "Start Recording"}
//                                     </Button>
//                                     <div className={`${customDarkText}`}>
//                                         <span className="fw-bold">Status: </span>
//                                         {status}
//                                     </div>
//                                     <div className={`${customDarkText}`}>
//                                         <span className="fw-bold">Time: </span>
//                                         {formatTime(recordingTime)}
//                                     </div>
//                                 </div>
//                                 {mediaBlobUrl && (
//                                     <audio src={mediaBlobUrl} controls className="mt-3 w-100" />
//                                 )}
//                             </div>
//                         </Col>
//                     </Row>
//                 </Container>

//             </Modal.Body>
//             <Modal.Footer className={`${customDark === "dark-dark" ? `${customDark} border` : customDark}`}>
//                 <Button variant="secondary" onClick={handleClose} className={`${customBtn} ${customLightBorder}`}>
//                     Close
//                 </Button>
//                 <Button 
//                     variant="primary" 
//                     onClick={handleSubmit} 
//                     className={`${customBtn} ${customLightBorder}`}
//                     disabled={isSaveDisabled}
//                 >
//                     Save Changes
//                 </Button>
//             </Modal.Footer>
//         </Modal>
//     );
// };

// export default RemarksModal;