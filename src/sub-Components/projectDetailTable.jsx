import React, { useState, useEffect } from 'react';
import { Table, Dropdown, Menu, Button, Switch, Input, Select } from 'antd';
import ColumnToggleModal from './../menus/ColumnToggleModal';
import AlarmModal from './../menus/AlarmModal';
import InterimQuantityModal from './../menus/InterimQuantityModal';
import RemarksModal from './../menus/RemarksModal';
import CatchDetailModal from './../menus/CatchDetailModal';
import SelectZoneModal from './../menus/SelectZoneModal';
import SelectMachineModal from '../menus/SelectMachineModal';
import AssignTeamModal from './../menus/AssignTeamModal';
import './../styles/ProjectDetailsTable.css';
import { IoCloseCircle } from "react-icons/io5";
import StatusToggle from '../menus/StatusToggle';
import { PiDotsNineBold } from "react-icons/pi";
import { RiSearchLine } from 'react-icons/ri';
import { Col, Row } from 'react-bootstrap';
import { FaEdit } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";//filter icon for table filter menu
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { BiSolidFlag } from "react-icons/bi";
import { MdPending } from "react-icons/md";// for pending
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";// for completed
import API from '../CustomHooks/MasterApiHooks/api';

const { Option } = Select;

const ProjectDetailsTable = ({ tableData, setTableData, projectId, hasFeaturePermission, featureData, processId, lotNo }) => {
    console.log(lotNo);
    console.log(tableData);
    //Theme Change Section
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const customDark = cssClasses[0];
    const customBtn = cssClasses[3];
    const customDarkText = cssClasses[4];
    const [initialTableData, setInitialTableData] = useState(tableData);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({
        Alerts: false,
        'Interim Quantity': false,
        Remarks: false,
    });
    const [hideCompleted, setHideCompleted] = useState(false);
    const [columnModalShow, setColumnModalShow] = useState(false);
    const [alarmModalShow, setAlarmModalShow] = useState(false);
    const [interimQuantityModalShow, setInterimQuantityModalShow] = useState(false);
    const [remarksModalShow, setRemarksModalShow] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [pageSize, setPageSize] = useState(5);
    const [alarmModalData, setAlarmModalData] = useState(null);
    const [interimQuantityModalData, setInterimQuantityModalData] = useState(null);
    const [remarksModalData, setRemarksModalData] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [visibleRowKeys, setVisibleRowKeys] = useState([]);
    const [searchVisible, setSearchVisible] = useState(false);
    const [catchDetailModalShow, setCatchDetailModalShow] = useState(false);
    const [catchDetailModalData, setCatchDetailModalData] = useState(null);
    const [selectZoneModalShow, setSelectZoneModalShow] = useState(false);
    const [selectMachineModalShow, setSelectMachineModalShow] = useState(false);
    const [assignTeamModalShow, setAssignTeamModalShow] = useState(false);
    const [selectZoneModalData, setSelectZoneModalData] = useState(null);
    const [selectMachineModalData, setSelectMachineModalData] = useState(null);
    const [assignTeamModalData, setAssignTeamModalData] = useState(null);
    const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);
    const [showOnlyCompletedPreviousProcess, setShowOnlyCompletedPreviousProcess] = useState(true);
    const [showOnlyRemarks, setShowOnlyRemarks] = useState(false);

    useEffect(() => {
        // Update the initialTableData state whenever tableData changes
        setInitialTableData(tableData);
    }, [tableData]);

    useEffect(() => {
        const newVisibleKeys = filteredData.map(item => item.catchNumber);
        setVisibleRowKeys(newVisibleKeys);
    }, [searchText, hideCompleted]); // Add other dependencies if necessary

    const filteredData = tableData.filter(item => {
        const matchesSearchText = Object.values(item).some(value =>
            value && value.toString().toLowerCase().includes(searchText.toLowerCase())
        );
        const statusCondition = !hideCompleted || item.status !== 2;
        const remarksCondition = showOnlyRemarks ? (item.remarks && item.remarks.trim() !== '') : true;
        const alertsCondition = showOnlyAlerts ? (item.alerts && item.alerts.trim() !== '') : true;
        return matchesSearchText && statusCondition && remarksCondition && alertsCondition;
    });


    useEffect(() => {
        setShowOptions(selectedRowKeys.length === 1);
    }, [selectedRowKeys]);

    // Update useEffect to immediately fetch data when lotNo changes
    useEffect(() => {
        if (projectId && processId && lotNo) {
            fetchTransactions();
        }
    }, [projectId, processId, lotNo]); 

    const fetchTransactions = async () => {
        try {
            const response = await API.get(`/Transactions?ProjectId=${projectId}&ProcessId=${processId}`);
            const transactions = response.data || [];
    
            // Create a mapping of quantitysheetId to status, alarmId (or alarmMessage), interimQuantity, and remarks
            const statusMap = transactions.reduce((acc, transaction) => {
                // If alarmId is "0", treat it as invalid by setting it to an empty string or null
                const alarmId = transaction.alarmMessage || (transaction.alarmId !== "0" ? transaction.alarmId : "");
    
                acc[transaction.quantitysheetId] = {
                    status: transaction.status,
                    alarmId: alarmId, // Use valid alarmId or an empty string if it's "0"
                    interimQuantity: transaction.interimQuantity, // Map interim quantity
                    remarks: transaction.remarks, // Map remarks
                    transactionId: transaction.transactionId // Store the transactionId
                };
                return acc;
            }, {});
    
            // Update tableData with the status, alarmId (or alarmMessage), interimQuantity, and remarks from transactions
            const updatedData = tableData.map(item => ({
                ...item,
                status: statusMap[item.srNo] ? statusMap[item.srNo].status : 0,
                alerts: statusMap[item.srNo] ? statusMap[item.srNo].alarmId : "", // Use alarmId or alarmMessage
                interimQuantity: statusMap[item.srNo] ? statusMap[item.srNo].interimQuantity : 0, // Add interim quantity
                remarks: statusMap[item.srNo] ? statusMap[item.srNo].remarks : "", // Add remarks
                transactionId: statusMap[item.srNo] ? statusMap[item.srNo].transactionId : null, // Add transactionId to each item
            }));
    
            setTableData(updatedData);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleRowStatusChange = async (catchNumber, newStatusIndex) => {
        console.log(`Toggling status for catch number ${catchNumber} to index ${newStatusIndex}`);
        const statusSteps = ["Pending", "Started", "Completed"];
        const newStatus = statusSteps[newStatusIndex];

        const updatedRow = tableData.find(row => row.catchNumber === catchNumber);

        try {
            // Fetch the existing transaction data if transactionId exists
            let existingTransactionData;
            if (updatedRow.transactionId) {
                const response = await API.get(`/Transactions/${updatedRow.transactionId}`);
                existingTransactionData = response.data;
            }

            const postData = {
                transactionId: updatedRow?.transactionId || 0, // Use the transactionId from the updated row
                interimQuantity: existingTransactionData ? existingTransactionData.interimQuantity : 0,
                remarks: existingTransactionData ? existingTransactionData.remarks : "",
                projectId: projectId,
                quantitysheetId: updatedRow?.srNo || 0,
                processId: processId,
                zoneId: existingTransactionData ? existingTransactionData.zoneId : 0,
                machineId: existingTransactionData ? existingTransactionData.machineId : 0,
                status: newStatusIndex, // Change only this field
                alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
                lotNo: existingTransactionData ? existingTransactionData.lotNo : 0,
                teamId: existingTransactionData ? existingTransactionData.teamId : 0,
                voiceRecording: existingTransactionData? existingTransactionData.voiceRecording : ""
            };
            // Update or create the transaction
            if (updatedRow.transactionId) {
                // If it exists, update using PUT
                const response = await API.put(`/Transactions/${updatedRow.transactionId}`, postData);
                console.log('Update Response:', response.data);
            } else {
                // If it doesn't exist, create using POST
                const response = await API.post('/Transactions', postData);
                console.log('Create Response:', response.data);
            }
            fetchTransactions(); // Refresh data
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };


    const handleCatchClick = (record) => {
        console.log('handleCatchClick called', record);
        setCatchDetailModalShow(true);
        setCatchDetailModalData(record);
    };

    const columns = [
        {
            width: '5%',
            title: (
                <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectAll(checked);
                        if (checked) {
                            setSelectedRowKeys(tableData.map((row) => row.catchNumber));
                        } else {
                            setSelectedRowKeys([]);
                        }
                    }}
                />
            ),
            key: 'selectAll',
            render: (_, record) => (
                <input
                    type="checkbox"
                    checked={selectAll || selectedRowKeys.includes(record.catchNumber)}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                            setSelectedRowKeys([...selectedRowKeys, record.catchNumber]);
                        } else {
                            setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.catchNumber));
                            setSelectAll(false);
                        }
                    }}
                />
            ),
            responsive: ['sm'],
        },
        {
            width: '10%',
            title: 'Sr.No.',
            key: 'srNo',
            align: "center",
            render: (_, __, index) => index + 1,
            responsive: ['sm'],
        },
        {
            width: '15%',
            title: 'Catch No.',
            dataIndex: 'catchNumber',
            key: 'catchNumber',
            align: 'center',
            sorter: (a, b) => a.catchNumber.localeCompare(b.catchNumber),
            render: (text, record) => (
                <>
                    <Row>
                        <Col lg={3} md={3} sm={3} xs={3}>
                            <div className='d-inline'>
                                {record.previousProcessStats === "Completed" ? (
                                    <IoCheckmarkDoneCircleSharp size={20} color="green" className="" />
                                ) : (
                                    <MdPending size={20} color="orange" className="" />
                                )}
                            </div>
                        </Col>
                        <Col lg={5} md={5} sm={5} xs={5}>
                            <div>
                                <button
                                    className="rounded border fs-6 custom-zoom-btn bg-white position-relative "
                                    onClick={() => console.log('Detail:', record)}
                                >
                                    {text}
                                </button>
                            </div>
                        </Col>
                        <Col lg={1} md={1} sm={1} xs={1}>
                            <div className='d-inline'>
                                <span
                                    className=''
                                    onClick={() => {
                                        setCatchDetailModalShow(true);
                                        setCatchDetailModalData(record);
                                    }}
                                >
                                    {record.remarks && (
                                        <FaEdit
                                            className=''
                                            size={20} // Adjust the size to make it smaller as a superscript
                                            style={{
                                                position: 'absolute',
                                                color: 'blue',
                                            }}
                                        />
                                    )}
                                </span>
                            </div>
                        </Col>
                        <Col lg={1} md={1} sm={1} xs={1}>
                            <div className="d-inline">
                                <span
                                    className="fs-6  position-relative "
                                    onClick={() => handleCatchClick(record)}
                                >
                                    {record.alerts && (
                                        <BiSolidFlag
                                            title={record.alerts}
                                            className=''
                                            size={20} // Adjust the size to make it smaller as a superscript
                                            style={{
                                                position: 'absolute',
                                                color: 'red',
                                            }}
                                        />
                                    )}
                                </span>
                            </div>
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            width: '12%',
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            sorter: (a, b) => a.quantity - b.quantity,
        },
        ...(columnVisibility['Interim Quantity'] && hasFeaturePermission(7) ? [{
            title: 'Interim Quantity',
            dataIndex: 'interimQuantity',
            width: '20%',
            align: 'center',
            key: 'interimQuantity',
            sorter: (a, b) => a.interimQuantity - b.interimQuantity,
        }] : []),
        ...(columnVisibility.Remarks ? [{
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            align: 'center',
            sorter: (a, b) => a.remarks.localeCompare(b.remarks),
        }] : []),
        ...(columnVisibility['Team Assigned'] && hasFeaturePermission(7) ? [{
            title: 'Interim Quantity',
            dataIndex: 'interimQuantity',
            width: '20%',
            align: 'center',
            key: 'interimQuantity',
            sorter: (a, b) => a.interimQuantity - b.interimQuantity,
        }] : []),
        ...(columnVisibility['Course'] && hasFeaturePermission(13) ? [{
            title: 'Course',
            dataIndex: 'course',
            width: '20%',
            align: 'center',
            key: 'course',
            sorter: (a, b) => a.course - b.course,
        }] : []),
        ...(columnVisibility['Subject'] && hasFeaturePermission(14) ? [{
            title: 'Subject',
            dataIndex: 'subject',
            width: '20%',
            align: 'center',
            key: 'subject',
            sorter: (a, b) => a.subject - b.subject,
        }] : []),
        ...(columnVisibility['Paper'] && hasFeaturePermission(15) ? [{
            title: 'Paper',
            dataIndex: 'paper',
            width: '20%',
            align: 'center',
            key: 'paper',
            sorter: (a, b) => a.paper - b.paper,
        }] : []),
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '20%',
            align: 'center',
            render: (text, record) => {
                const statusSteps = ["Pending", "Started", "Completed"];
                const initialStatusIndex = text !== undefined ? text : 0;
                const hasAlerts = record.alerts && record.alerts.length > 0;
                return (
                    <div className="d-flex justify-content-center">
                        {hasAlerts ? (
                            <span className="text-danger" title="Status cannot be changed due to alerts.">
                                <StatusToggle
                                    initialStatusIndex={initialStatusIndex}
                                    statusSteps={statusSteps.map((status, index) => ({
                                        status,
                                        color: index === 0 ? "red" : index === 1 ? "blue" : "green"
                                    }))}
                                    disabled // Disable the toggle
                                />
                            </span>
                        ) : (
                            <StatusToggle
                                initialStatusIndex={initialStatusIndex}
                                onStatusChange={(newIndex) => handleRowStatusChange(record.catchNumber, newIndex)}
                                statusSteps={statusSteps.map((status, index) => ({
                                    status,
                                    color: index === 0 ? "red" : index === 1 ? "blue" : "green"
                                }))}
                            />
                        )}
                    </div>
                );
            },
            sorter: (a, b) => a.status.localeCompare(b.status),
        },

    ];

    const clearSelections = () => {
        setSelectedRowKeys([]);
        setSelectAll(false);
        setShowOptions(false);
    };

    const handleStatusChange = async (newStatus) => {
        const statusSteps = ["Pending", "Started", "Completed"];
        const newStatusIndex = statusSteps.indexOf(newStatus);

        // Iterate over selectedRowKeys and update status
        const updates = selectedRowKeys.map(async (key) => {
            const updatedRow = tableData.find(row => row.catchNumber === key);
            if (updatedRow) {
                const postData = {
                    transactionId: updatedRow.transactionId || 0,
                    interimQuantity: updatedRow?.interimQuantity || 0,
                    remarks: updatedRow?.remarks || "",
                    projectId: projectId,
                    quantitysheetId: updatedRow?.srNo || 0,
                    processId: processId,
                    zoneId: updatedRow?.zoneId || 0,
                    status: newStatusIndex,
                    alarmId: updatedRow?.alarmId || "",
                    machineId: updatedRow?.machineId || 0,
                    lotNo: updatedRow?.lotNo || 0,
                    voiceRecording: updatedRow?.voiceRecording || "",
                    teamId: updatedRow?.teamId || 0
                };

                try {
                    // Update or create based on existence of transactionId
                    if (updatedRow.transactionId) {
                        await API.put(`/Transactions/${updatedRow.transactionId}`, postData);
                    } else {
                        await API.post('/Transactions', postData);
                    }
                } catch (error) {
                    console.error(`Error updating status for ${key}:`, error);
                }
            }
        });

        // Wait for all updates to finish
        await Promise.all(updates);
        clearSelections()
        fetchTransactions();
    };


    const getSelectedStatus = () => {
        if (selectedRowKeys.length > 0) {
            const selectedRows = tableData.filter((row) => selectedRowKeys.includes(row.catchNumber));
            const statuses = selectedRows.map((row) => row.status);
            const uniqueStatuses = [...new Set(statuses)];
            // Check if all selected rows have the same status
            if (uniqueStatuses.length === 1) {
                const status = uniqueStatuses[0];
                // If status is 0 (Pending), return 0; if 1 (Started), return 1; if 2 (Completed), return null
                return status < 2 ? status : null;
            }
        }
        return null;
    };

    const handleToggleChange = (checked) => {
        setHideCompleted(checked);
    };

    const handleDropdownSelect = (action) => {
        if (showOptions && selectedRowKeys.length > 0) {
            const selectedRow = tableData.find((row) => row.catchNumber === selectedRowKeys[0]);
            if (action === 'Alarm' && hasFeaturePermission(3)) {
                setAlarmModalShow(true);
                setAlarmModalData(selectedRow); // Pass the selected row's data to the alarm modal
            } else if (action === 'Interim Quantity' && hasFeaturePermission(7)) {
                setInterimQuantityModalShow(true);
                setInterimQuantityModalData(selectedRow); // Pass the selected row's data to the interim quantity modal
            } else if (action === 'Remarks') {
                setRemarksModalShow(true);
                setRemarksModalData(selectedRow); // Pass the selected row's data to the remarks modal
            } else if (action === 'Select Zone' && hasFeaturePermission(4)) {
                setSelectZoneModalShow(true);
                setSelectZoneModalData(selectedRow); // Pass the selected row's data to the select zone modal
            } 
            else if (action === 'Select Machine' && hasFeaturePermission(10)) {
                setSelectMachineModalShow(true);
                setSelectMachineModalData(selectedRow);
            }
            else if (action === 'Assign Team' && hasFeaturePermission(5)) {
                setAssignTeamModalShow(true);
                setAssignTeamModalData(selectedRow); // Pass the selected row's data to the assign team modal
            }
        } else {
            alert("Selected row not found.");

        }
    };

    const handleSelectZoneSave = (zone) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, zone }; // Update the zone or any other necessary field
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]); // Deselect all rows
        setShowOptions(false); // Reset options visibility
        fetchTransactions();
    };

    const handleSelectMachineSave = (machine) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, machine }; // Update the zone or any other necessary field
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]); // Deselect all rows
        setShowOptions(false); // Reset options visibility
        fetchTransactions();
    };


    const handleAssignTeamSave = (team) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, team };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]); // Deselect all rows
        setShowOptions(false); // Reset options visibility
    };

    const handleAlarmSave = (alarm) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, alerts: alarm };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]); // Deselect all rows
        setShowOptions(false); // Reset options visibility
        fetchTransactions();
    };

    const handleInterimQuantitySave = (interimQuantity) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) { // Use catchNumber for comparison
                return { ...row, interimQuantity };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]); // Deselect all rows
        setShowOptions(false); // Reset options visibility
        fetchTransactions();
    };

    const handleRemarksSave = (remarks, mediaBlobUrl) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, remarks,mediaBlobUrl };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]); // Deselect all rows
        setShowOptions(false); // Reset options visibility
        fetchTransactions();
    };

    const selectedRows = tableData.filter((row) => selectedRowKeys.includes(row.catchNumber));
    const isCompleted = selectedRows.every(row => row.status === 2); // Check if the selected row is completed

    const menu = (
        <Menu>
            {hasFeaturePermission(3) && !isCompleted && (
                <Menu.Item onClick={() => handleDropdownSelect('Alarm')}>
                    Alarm
                </Menu.Item>
            )}
            {hasFeaturePermission(7) && !isCompleted && (
                <Menu.Item onClick={() => handleDropdownSelect('Interim Quantity')}>
                    Interim Quantity
                </Menu.Item>
            )}
            {!isCompleted && (
                <Menu.Item onClick={() => handleDropdownSelect('Remarks')}>
                    Remarks
                </Menu.Item>
            )}
            <Menu.Item onClick={() => setColumnModalShow(true)}>Columns</Menu.Item>
            {hasFeaturePermission(4) && (
                <Menu.Item onClick={() => handleDropdownSelect('Select Zone')}

                    disabled={selectedRowKeys.length === 0}>Select Zone</Menu.Item>
            )}
            {hasFeaturePermission(10) && (
                <Menu.Item onClick={() => handleDropdownSelect('Select Machine')}

                    disabled={selectedRowKeys.length === 0}>Select Machine</Menu.Item>
            )}
            {hasFeaturePermission(5) && (
                <Menu.Item onClick={() => handleDropdownSelect('Assign Team')}

                    disabled={selectedRowKeys.length === 0}>Assign Team</Menu.Item>
            )}
        </Menu>
    );

    const customPagination = {

        pageSize,
        pageSizeOptions: [5, 10, 25, 50, 100],
        showSizeChanger: true,
        onShowSizeChange: (current, size) => setPageSize(size),
        showTotal: (total) => `Total ${total} items`,
        locale: { items_per_page: "Rows" }, // Removes the "/page" text
        pageSizeRender: (props) => (
            <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: 8 }} className=''>Limit Rows:</span>
                {props}
            </div>
        ),
        itemRender: (page, type, originalElement) => {
            if (type === "page") {
                return <span>{page}</span>;
            }
            return originalElement;
        },
    };


    const rowClassName = (record, index) => {
        if (record.status === 'Pending') {
            return 'pending-row';
        } else if (record.status === 'Started') {
            return 'started-row';
        } else if (record.status === 'Completed') {
            return 'completed-row';
        } else {
            return '';
        }
    };


    return (
        <>
            <Row>
                <Col lg={1} md={1} sx={2} className='d-flex justify-content- mt-md-1 mt-xs-1 mb-md-1 mb-xs-1'>
                    {hasFeaturePermission(6) && (
                        <Dropdown overlay={
                            <Menu>
                                <Menu.Item className='d-flex align-items-center'>
                                    <Switch
                                        checked={hideCompleted}
                                        onChange={handleToggleChange}
                                    />
                                    <span className='ms-2'>Hide Completed</span>
                                </Menu.Item>

                                <Menu.Divider />
                                <Menu.Item className='d-flex align-items-center'>
                                    <Switch
                                        checked={showOnlyCompletedPreviousProcess}
                                        onChange={() => setShowOnlyCompletedPreviousProcess(!showOnlyCompletedPreviousProcess)}
                                    />
                                    {/* <span className='ms-2'>{previousProcess} Completed</span> */}
                                    <span className='ms-2'>Previous  Completed</span>
                                </Menu.Item>
                                <Menu.Divider />

                                <Menu.Item className='d-flex align-items-center'>
                                    <Switch
                                        checked={showOnlyAlerts}
                                        onChange={() => setShowOnlyAlerts(!showOnlyAlerts)}
                                    />
                                    <span className='ms-2'>Catches With Alerts</span>
                                </Menu.Item>

                                <Menu.Divider />
                                <Menu.Item className='d-flex align-items-center'>
                                    <Switch
                                        checked={showOnlyRemarks}
                                        onChange={() => setShowOnlyRemarks(!showOnlyRemarks)}
                                    />
                                    <span className='ms-2'>Catches With Remarks</span>
                                </Menu.Item>

                                <Menu.Divider />

                                <Menu.Item onClick={(e) => e.stopPropagation()}> {/* Add this */}
                                    <span>Limit Rows:</span>
                                    <Select
                                        value={pageSize}
                                        style={{ width: 60 }}
                                        onChange={(value) => setPageSize(value)}
                                        className='ms-4'
                                    >
                                        <Option value={5}>5</Option>
                                        <Option value={10}>10</Option>
                                        <Option value={25}>25</Option>
                                        <Option value={50}>50</Option>
                                        <Option value={100}>100</Option>
                                    </Select>
                                </Menu.Item>
                            </Menu>
                        } trigger={['click']}>
                            <Button style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }} className={`p-1 border ${customDark === 'dark-dark' ? `${customDark} text-white` : 'bg-white'}`}>
                                <FaFilter size={20} className={`${customDarkText}`} />
                                {/* <span className='d-none d-lg-block d-md-none ms-1 fs-6 fw-bold'>Filter</span> */}

                            </Button>
                        </Dropdown>
                    )}
                </Col>

                {/* update status button */}
                <Col lg={5} md={4} sx={2} className='mt-md-1 mt-xs-1'>
                    {selectedRowKeys.length > 1 && getSelectedStatus() !== null && (
                        <div className="mt-1 d-flex align-items-center">
                            <span className={`me-2 ${customDark === 'dark-dark' ? 'text-white' : 'custom-theme-dark-text'} fs-6 fw-bold`}>Update Status: </span>
                            <StatusToggle
                                initialStatusIndex={getSelectedStatus()} // Use the index returned by getSelectedStatus
                                onStatusChange={(newIndex) => handleStatusChange(["Pending", "Started", "Completed"][newIndex])}
                                statusSteps={[
                                    { status: "Pending", color: "red" },
                                    { status: "Started", color: "blue" },
                                    { status: "Completed", color: "green" },
                                ]}
                                disabled={selectedRowKeys.some(catchNumber => {
                                    const row = tableData.find(item => item.catchNumber === catchNumber);
                                    return row && row.alerts; // Check if this row has alerts
                                })}
                            />
                        </div>
                    )}
                </Col>


                {/* search box */}
                <Col lg={5} md={6} xs={12}>
                    <div className="d-flex justify-content-end align-items-center search-container">
                        {searchVisible && (
                            <div className="search-box" style={{ position: 'relative', zIndex: "2" }}>
                                {searchText && (
                                    <Button
                                        className={`${customBtn}`}
                                        onClick={() => setSearchText('')}
                                        icon={<IoCloseCircle size={20} className={`rounded-circle ${customBtn}`} />}
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            right: 8
                                        }}
                                    />
                                )}
                                <Input
                                    placeholder="Search Within Table"
                                    allowClear
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: '180px' }} // Space for remove icon
                                    className={`custom-placeholder text-primary `}
                                />
                            </div>
                        )}
                        <Button
                            onClick={() => setSearchVisible(!searchVisible)}
                            icon={<RiSearchLine size={20} />}
                            className='custom-theme-dark-borde p-1 search-btn'
                            style={{ marginLeft: 5 }}
                        />
                    </div>
                </Col>

                {/* group action icon */}
                <Col lg={0} md={1} sx={2}>
                    <div className="d-flex justify-content-end ms-">
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Button
                                style={{
                                    backgroundColor: 'transparent', // Remove background
                                    border: 'none',                 // Remove border
                                    boxShadow: 'none',              // Remove shadow
                                    padding: 0                      // Optional: adjust padding if needed
                                }}
                            >
                                <PiDotsNineBold size={30} className={` ${customDark === 'dark-dark' ? 'text-white' : customDarkText}`} />
                            </Button>
                        </Dropdown>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col lg={12} md={12}>
                    <Table
                        rowClassName={rowClassName}
                        className={`${customDark === "default-dark" ? "thead-default" : ""}
                                    ${customDark === "red-dark" ? "thead-red" : ""}
                                    ${customDark === "green-dark" ? "thead-green" : ""}
                                    ${customDark === "blue-dark" ? "thead-blue" : ""}
                                    ${customDark === "dark-dark" ? "thead-dark" : ""}
                                    ${customDark === "pink-dark" ? "thead-pink" : ""}
                                    ${customDark === "purple-dark" ? "thead-purple" : ""}
                                    ${customDark === "light-dark" ? "thead-light" : ""}
                                    ${customDark === "brown-dark" ? "thead-brown" : ""} `}
                        rowKey="catchNumber"
                        columns={columns}
                        dataSource={filteredData}
                        pagination={customPagination}
                        bordered
                        style={{ position: "relative", zIndex: "900" }}
                        striped={true}
                        tableLayout="auto"
                    />
                </Col>
            </Row>
            <ColumnToggleModal
                show={columnModalShow}
                handleClose={() => setColumnModalShow(false)}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
                featureData={featureData}
                hasFeaturePermission={hasFeaturePermission}
            />
            <AlarmModal
                show={alarmModalShow}
                handleClose={() => setAlarmModalShow(false)}
                processId={processId}
                handleSave={handleAlarmSave}
                data={alarmModalData} // Pass the alarm modal data as a prop
            />
            <InterimQuantityModal
                show={interimQuantityModalShow}
                handleClose={() => setInterimQuantityModalShow(false)}
                processId={processId}
                handleSave={handleInterimQuantitySave}
                data={interimQuantityModalData} // Pass the interim quantity modal data as a prop
            />
            <RemarksModal
                show={remarksModalShow}
                handleClose={() => setRemarksModalShow(false)}
                processId={processId}
                handleSave={handleRemarksSave}
                data={remarksModalData} // Pass the remarks modal data as a prop
            />
            <CatchDetailModal
                show={catchDetailModalShow}
                handleClose={() => setCatchDetailModalShow(false)}
                data={catchDetailModalData}
            />
            <SelectZoneModal
                show={selectZoneModalShow}
                handleClose={() => setSelectZoneModalShow(false)}
                handleSave={handleSelectZoneSave}
                data={selectZoneModalData}
                processId={processId}
            />
            <SelectMachineModal
                show={selectMachineModalShow}
                handleClose={() => setSelectMachineModalShow(false)}
                handleSave={handleSelectMachineSave}
                data={selectMachineModalData}
                processId={processId}
            />
            <AssignTeamModal
                show={assignTeamModalShow}
                handleClose={() => setAssignTeamModalShow(false)}
                handleSave={handleAssignTeamSave}
                data={assignTeamModalData}
                processId={processId}
            />
        </>
    );
};
export default ProjectDetailsTable;