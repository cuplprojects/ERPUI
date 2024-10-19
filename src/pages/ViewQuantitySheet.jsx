import React, { useState, useEffect } from 'react';
import { Button, Select, Table } from 'antd';
import axios from 'axios';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal as BootstrapModal } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';

const ViewQuantitySheet = ({selectedLotNo }) => {
    const [process, setProcess] = useState([]);
  
    const [dataSource, setDataSource] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [selectedProcessIds, setSelectedProcessIds] = useState([]);
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();

    const column = [
        {
            title: 'Catch No',
            dataIndex: 'catchNo',
            key: 'catchNo',
            width: 100,
        },
        {
            title: 'Paper',
            dataIndex: 'paper',
            key: 'paper',
            width: 100,
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            width: 100,
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            width: 100,
        },
        {
            title: 'Inner Envelope',
            dataIndex: 'innerEnvelope',
            key: 'innerEnvelope',
            width: 100,
        },
        {
            title: 'Outer Envelope',
            dataIndex: 'outerEnvelope',
            key: 'outerEnvelope',
            width: 100,
        },
        {
            title: 'Lot No',
            dataIndex: 'lotNo',
            key: 'lotNo',
            width: 100,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            sorter: true,
        },
        {
            title: 'Process',
            dataIndex: 'processId',
            key: 'processId',
            width: 100,
            render: (text, record) => (
                editingRow === record.key ? (
                    <>
                        <Select
                            mode="multiple"
                            defaultValue={text}
                            onChange={(value) => handleProcessEdit(record.key, value)}
                        >
                            {process.map(proc => (
                                <Select.Option key={proc.id} value={proc.id}>
                                    {proc.name}
                                </Select.Option>
                            ))}
                        </Select>

                    </>
                ) : (
                    <span>{text.map(id => process.find(proc => proc.id === id)?.name).join(', ') || 'N/A'}</span>
                )
            ),
        },
        {
            title: 'Action',
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (_, record) => (


                <Button onClick={() => handleEditButtonClick(record.key)}>
                    Edit
                </Button>

            ),
        },
    ];

    const fetchQuantity = async (lotNo) => {
        try {
            const response = await API.get(`/QuantitySheet?ProjectId=1&lotNo=${lotNo}`);
            const dataWithKeys = response.data.map(item => ({
                ...item, key: item.quantitySheetId
            }));
            console.log(dataWithKeys)
            setDataSource(dataWithKeys);
        } catch (error) {
            console.error('Failed to fetch Quantity', error);
        }
    };

   

    useEffect(() => {
        fetchProcess();
    }, []);

    useEffect(() => {
        if (selectedLotNo) {
            fetchQuantity(selectedLotNo);
        }
    }, [selectedLotNo]);

    const fetchProcess = async () => {
        try {
            const response = await API.get('/Processes');
            setProcess(response.data);
        } catch (error) {
            console.error('Failed to fetch Processes', error);
        }
    };

    /**
     * Handles changes in the process selection.
     * 
     * This function manages the interdependencies between different printing processes:
     * - Digital Printing is mutually exclusive with CTP and Offset Printing.
     * - CTP and Offset Printing are always selected or deselected together.
     * - Other processes are preserved regardless of the printing process selection.
     * 
     * The function ensures that:
     * 1. If Digital Printing is selected, CTP and Offset Printing are deselected.
     * 2. If either CTP or Offset Printing is selected, Digital Printing is deselected.
     * 3. If neither Digital Printing nor CTP/Offset Printing is selected, CTP and Offset Printing are added by default.
     * 
     * 
     */
    const handleProcessChange = (value) => {
        let newValue = [...value];

        const hasDigitalPrinting = newValue.includes('Digital Printing');
        const hasOffsetPrinting = newValue.includes('Offset Printing');
        const hasCTP = newValue.includes('CTP');

        // Preserve all processes except CTP, Offset Printing, and Digital Printing
        const otherProcesses = newValue.filter(process =>
            !['Digital Printing', 'Offset Printing', 'CTP'].includes(process)
        );

        if (hasDigitalPrinting) {
            // If Digital Printing is deselected, add CTP and Offset Printing
            if (!value.includes('Digital Printing')) {
                newValue = ['CTP', 'Offset Printing', ...otherProcesses];
            } else {
                newValue = ['Digital Printing', ...otherProcesses];
            }
        } else if (hasOffsetPrinting || hasCTP) {
            // If either CTP or Offset Printing is deselected, add Digital Printing
            if (!value.includes('Offset Printing') || !value.includes('CTP')) {
                newValue = ['Digital Printing', ...otherProcesses];
            } else {
                newValue = ['CTP', 'Offset Printing', ...otherProcesses];
            }
        } else {
            newValue = ['CTP', 'Offset Printing', ...otherProcesses];
        }

        setSelectedProcessIds(newValue);
    };

    const handleSaveEdit = async () => {
        // Save the selected processes after confirmation
        const updatedItem = dataSource.find(item => item.key === editingRow);
        if (!updatedItem) return;

        const payload = {
            quantitySheetId: updatedItem.quantitySheetId,
            catchNo: updatedItem.catchNo,
            paper: updatedItem.paper,
            course: updatedItem.course,
            subject: updatedItem.subject,
            innerEnvelope: updatedItem.innerEnvelope,
            outerEnvelope: updatedItem.outerEnvelope,
            lotNo: updatedItem.lotNo,
            quantity: updatedItem.quantity,
            percentageCatch: updatedItem.percentageCatch, // Set to your required value
            projectId: updatedItem.projectId, // Set to your required value
            isOverridden: false,
            processId: selectedProcessIds.map(procName => process.find(proc => proc.name === procName)?.id).filter(Boolean),
        };

        try {
            await API.put(`/QuantitySheet/${editingRow}`, payload);
            setEditingRow(null); // Exit edit mode
            fetchQuantity(); // Refresh data
        } catch (error) {
            console.error('Failed to save changes', error);
        }
    };

    const handleEditButtonClick = (key) => {
        setEditingRow(key);
        const record = dataSource.find(item => item.key === key);
        setSelectedProcessIds(record.processId.map(id => process.find(proc => proc.id === id)?.name) || []);
    };

    const handleModalClose = () => {
        setEditingRow(null); // Exit edit mode without saving
        setSelectedProcessIds([]); // Reset selected processes
    };

    return (
        <div className='mt-3'> 
            {dataSource.length >0 &&
            <Table
                className={cssClasses.customTable}

                columns={column}
                dataSource={dataSource}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    total: dataSource.length,
                    showTotal: (total) => `Total ${total} items`,
                }}
                scroll={{ x: 'max-content' }}
            /> }

            {editingRow !== null && (
                <BootstrapModal
                    show={true}
                    onHide={handleModalClose}
                >
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Edit Process</BootstrapModal.Title>
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <Select
                            mode="multiple"
                            value={selectedProcessIds}
                            onChange={handleProcessChange}
                            style={{ width: '100%' }}
                        >
                            {process.map(proc => (
                                <Select.Option key={proc.id} value={proc.name}>
                                    {proc.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveEdit}>
                            Save Changes
                        </Button>
                    </BootstrapModal.Footer>
                </BootstrapModal>
            )}
        </div>
    );
};

export default ViewQuantitySheet;