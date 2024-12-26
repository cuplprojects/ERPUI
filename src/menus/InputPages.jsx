import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';
import API from '../CustomHooks/MasterApiHooks/api';


const InputPages = ({ show, handleClose, data, processId, fetchTransactions }) => {
    const [inputValues, setInputValues] = useState([]);

    // Access the theme store
    const themeState = useStore(themeStore);
    const cssClasses = themeState.getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

    // Force re-render when theme changes
    useEffect(() => {
        // This ensures the theme CSS classes are refreshed dynamically.
    }, [cssClasses]);

    const handleInputChange = (event, item) => {
        const { name, value } = event.target;
        setInputValues((prevState) => {
            const existingIndex = prevState.findIndex(
                (entry) => entry.catchNumber === item.catchNumber
            );

            const updatedEntry = {
                ...item,
                [name]: value,
                pages: value,
            };

            if (existingIndex > -1) {
                // Replace the existing entry with the updated one
                const updatedState = [...prevState];
                updatedState[existingIndex] = updatedEntry;
                return updatedState;
            }

            // Add a new entry if not already in state
            return [...prevState, updatedEntry];
        });
    };

    const handleSave = async () => {
        const formattedData = inputValues.map((item) => ({
            pages: item.pages || '',
            catchNumber: item.catchNumber,
            lotNo: item.lotNo,
            projectId: item.projectId,
        }));
        try {
            const res = await API.post(`/QuantitySheet/UpdatePages`, formattedData);
            console.log('Formatted Data:', formattedData);

            if (res) {
                await fetchTransactions(processId, formattedData);
            }
            handleClose();
        } catch (error) {
            console.error('Error updating pages:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton className={`${customDark} ${customDarkText}`}>
                <Modal.Title className={`${customLightText} fs-4`}>Input Values</Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${customLight} ${customDarkText} p-4`}>
                <Table striped bordered hover responsive className={`table-bordered ${customLightBorder}`}>
                    <thead>
                        <tr className={`${customDark} ${customLightText}`}>
                            <th className='text-center'>Catch Number</th>
                            <th className='text-center'>Lot Number</th>
                            <th className='text-center'>Input Pages</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <td className='text-center'>{item.catchNumber}</td>
                                    <td className='text-center'>{item.lotNo}</td>
                                    <td>
                                        <Form.Control
                                            className='text-center'
                                            type="number"
                                            name="pages"
                                            size="sm"
                                            defaultValue={item.pages} // Autofill the pages value
                                            onChange={(e) => handleInputChange(e, item)}

                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className={`text-center ${customDarkText}`}>
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer className={`${customLight} justify-content-center`}>
                <Button
                    size="sm"
                    onClick={handleClose}
                    className={`${customBtn} border-0 `}
                >
                    Close
                </Button>
                <Button
                    size="sm"
                    className={`${customBtn} border-0 `}
                    onClick={handleSave}
                >
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InputPages;
