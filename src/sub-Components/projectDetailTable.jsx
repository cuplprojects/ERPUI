import React, { useState, useEffect } from 'react';
import { Table, Dropdown, Menu, Button, Switch, Input, Select } from 'antd';
import ColumnToggleModal from './../menus/ColumnToggleModal';
import AlarmModal from './../menus/AlarmModal';
import InterimQuantityModal from './../menus/InterimQuantityModal';
import RemarksModal from './../menus/RemarksModal';
import CatchDetailModal from './../menus/CatchDetailModal';
import SelectZoneModal from './../menus/SelectZoneModal';
import AssignTeamModal from './../menus/AssignTeamModal';
import './../styles/ProjectDetailsTable.css';
import { IoCloseCircle } from "react-icons/io5";
import StatusToggle from '../menus/StatusToggle';
import { PiDotsNineBold } from "react-icons/pi";
import { RiSearchLine } from 'react-icons/ri';
import { Col, Row } from 'react-bootstrap';
import { FaEdit } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { BiSolidFlag } from "react-icons/bi";
import { MdPending } from "react-icons/md";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

const { Option } = Select;

const ProjectDetailsTable = ({ tableData, setTableData, projectId, lotNo, featureData, hasFeaturePermission }) => {
    // Theme Change Section
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const customDark = cssClasses[0];
    const customBtn = cssClasses[3];
    const customDarkText = cssClasses[4];

    const [initialTableData, setInitialTableData] = useState(tableData);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
    const [selectZoneModalData, setSelectZoneModalData] = useState(null);
    const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);
    const [showOnlyCompletedPreviousProcess, setShowOnlyCompletedPreviousProcess] = useState(true);
    const [showOnlyRemarks, setShowOnlyRemarks] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({
        Alerts: false,
        'Interim Quantity': false,
        Remarks: false,
        'Team Assigned': false,
    });
    const [assignTeamModalShow, setAssignTeamModalShow] = useState(false);
    const [assignTeamModalData, setAssignTeamModalData] = useState([]);

    useEffect(() => {
        setInitialTableData(tableData);
    }, [tableData]);

    useEffect(() => {
        const newVisibleKeys = filteredData.map(item => item.catchNumber);
        setVisibleRowKeys(newVisibleKeys);
    }, [searchText, hideCompleted]);

    const filteredData = tableData.filter(item =>
        Object.values(item).some(value =>
            value && value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
        && (!hideCompleted || item.status !== 'Completed')
    );

    useEffect(() => {
        setShowOptions(selectedRowKeys.length > 0);
    }, [selectedRowKeys]);

    const handleRowStatusChange = (catchNumber, newStatusIndex) => {
        const statusSteps = ["Pending", "Started", "Completed"];
        const newStatus = statusSteps[newStatusIndex];

        const updatedData = tableData.map((row) => {
            if (row.catchNumber === catchNumber) {
                return { ...row, status: newStatus };
            }
            return row;
        });

        setTableData(updatedData);
    };


    const handleCatchClick = (record) => {
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
                                    onClick={() => handleCatchClick(record)}
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
        ...(columnVisibility['Team Assigned'] ? [{
            title: 'Team Assigned',
            dataIndex: 'teamAssigned',
            key: 'teamAssigned',
            align: 'center',
            sorter: (a, b) => (a.teamAssigned || '').localeCompare(b.teamAssigned || ''),
        }] : []),
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '20%',
            align: 'center',
            render: (text, record) => {
                const statusSteps = ["Pending", "Started", "Running", "Completed"];
                const initialStatusIndex = statusSteps.indexOf(record.status);
                return (
                    <>
                        <div className="d-flex justify-content-center">
                            <StatusToggle
                                initialStatusIndex={initialStatusIndex}
                                onStatusChange={(newIndex) => handleRowStatusChange(record.catchNumber, newIndex)}
                                statusSteps={[
                                    { status: "Pending", color: "red" },
                                    { status: "Started", color: "blue" },
                                    { status: "Running", color: "orange" },
                                    { status: "Completed", color: "green" },
                                ]}
                            />
                        </div>
                    </>
                );
            },
            sorter: (a, b) => a.status.localeCompare(b.status),
        }
    ];
    const handleStatusChange = (newStatus) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                let nextStatus;
                switch (row.status) {
                    case "Pending":
                        nextStatus = "Started";
                        break;
                    case "Started":
                        nextStatus = "Completed";
                        break;
                    default:
                        nextStatus = row.status;
                }
                return { ...row, status: nextStatus };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]);
        setSelectAll(false);
        setShowOptions(false);
    };
    const getSelectedStatus = () => {
        if (selectedRowKeys.length > 1) {
            const selectedRows = tableData.filter((row) => selectedRowKeys.includes(row.catchNumber));
            const statuses = selectedRows.map((row) => row.status);
            const uniqueStatuses = [...new Set(statuses)];
            if (uniqueStatuses.length === 1) {
                return uniqueStatuses[0];
            }
        }
        return null;
    };

    const handleToggleChange = (checked) => {
        setHideCompleted(checked);
    };


    const handleDropdownSelect = (action) => {
        if (selectedRowKeys.length > 0) {
            const selectedRows = tableData.filter((row) => selectedRowKeys.includes(row.catchNumber));
            switch (action) {
                case 'Alarm':
                    if (hasFeaturePermission(3)) {
                        setAlarmModalShow(true);
                        setAlarmModalData(selectedRows);
                    }
                    break;
                case 'Interim Quantity':
                    if (hasFeaturePermission(7)) {
                        setInterimQuantityModalShow(true);
                        setInterimQuantityModalData(selectedRows);
                    }
                    break;
                case 'Remarks':
                    setRemarksModalShow(true);
                    setRemarksModalData(selectedRows);
                    break;
                case 'Select Zone':
                    if (hasFeaturePermission(4)) {
                        setSelectZoneModalShow(true);
                        setSelectZoneModalData(selectedRows);
                    }
                    break;
                case 'Assign Team':
                    if (hasFeaturePermission(5) || true) {
                        setAssignTeamModalShow(true);
                        setAssignTeamModalData(selectedRows);
                    }
                    break;
                default:
                    break;
            } 
        } else {
            alert("Please select at least one row.");
        }
    };
    const handleSelectZoneSave = (zone) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, zone };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]);
        setShowOptions(false);
    };
    const handleAssignTeamSave = (team) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, teamAssigned: team };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]);
        setShowOptions(false);
        setAssignTeamModalShow(false);
    };
    const handleAlarmSave = (alarm) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, alerts: alarm };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]);
        setShowOptions(false);
    };

    const handleInterimQuantitySave = (interimQuantity) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, interimQuantity };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]);
        setShowOptions(false);
    };
    const handleRemarksSave = (remarks) => {
        const updatedData = tableData.map((row) => {
            if (selectedRowKeys.includes(row.catchNumber)) {
                return { ...row, remarks };
            }
            return row;
        });
        setTableData(updatedData);
        setSelectedRowKeys([]);
        setShowOptions(false);
    };
    const menu = (
        <Menu>
            {hasFeaturePermission(3) && (
                <Menu.Item
                    onClick={() => handleDropdownSelect('Alarm')}
                    disabled={selectedRowKeys.length === 0}
                >
                    Alarm
                </Menu.Item>
            )}
            {hasFeaturePermission(7) && (
                <Menu.Item
                    onClick={() => handleDropdownSelect('Interim Quantity')}
                    disabled={selectedRowKeys.length === 0}
                >
                    Interim Quantity
                </Menu.Item>
            )}
            <Menu.Item
                onClick={() => handleDropdownSelect('Remarks')}
                disabled={selectedRowKeys.length === 0}
            >
                Remarks
            </Menu.Item>
            <Menu.Item onClick={() => setColumnModalShow(true)}>Columns</Menu.Item>
            {hasFeaturePermission(4) && (
                <Menu.Item
                    onClick={() => handleDropdownSelect('Select Zone')}
                    disabled={selectedRowKeys.length === 0}
                >
                    Select Zone
                </Menu.Item>
            )}
             {(hasFeaturePermission(5) || true) && (
                <Menu.Item
                    onClick={() => handleDropdownSelect('Assign Team')}
                    disabled={selectedRowKeys.length === 0}
                >
                    Assign Team
                </Menu.Item>
             )}
        </Menu>
    );
    const customPagination = {
        pageSize,
        pageSizeOptions: [5, 10, 25, 50, 100],
        showSizeChanger: true,
        onShowSizeChange: (current, size) => setPageSize(size),
        showTotal: (total) => `Total ${total} items`,
        locale: { items_per_page: "Rows" },
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
    const getStatusIndex = (status) => {
        switch (status) {
            case "Pending":
                return 0;
            case "Started":
                return 1;
            case "Completed":
                return 2;
            default:
                return 0;
        }
    };
    const filteredDataAlert = tableData.filter((item) =>
        Object.values(item).some((value) =>
            value && value.toString().toLowerCase().includes(searchText.toLowerCase())
        )
        && (!hideCompleted || item.status !== 'Completed')
        && (!showOnlyAlerts || item.alerts)
        && (!showOnlyCompletedPreviousProcess || item.previousProcessStats === 'Completed')
        && (!showOnlyRemarks || item.remarks)
    );
    return (
        <>
            <Row>
                {/* filter button */}
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
                                initialStatusIndex={getStatusIndex(getSelectedStatus())}
                                onStatusChange={(newIndex) => handleStatusChange(["Pending", "Started", "Completed"][newIndex])}
                                statusSteps={[
                                    { status: "Pending", color: "red" },
                                    { status: "Started", color: "blue" },
                                    { status: "Completed", color: "green" },
                                ]}
                            />
                        </div>
                    )}
                </Col>

                {/* search box */}
                <Col lg={5} md={6} xs={12}>
                    <div className="d-flex justify-content-end align-items-center search-container mb-2">
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
                handleSave={handleAlarmSave}
                data={alarmModalData} // Pass the alarm modal data as a prop
            />
            <InterimQuantityModal
                show={interimQuantityModalShow}
                handleClose={() => setInterimQuantityModalShow(false)}
                handleSave={handleInterimQuantitySave}
                data={interimQuantityModalData} // Pass the interim quantity modal data as a prop
            />
            <RemarksModal
                show={remarksModalShow}
                handleClose={() => setRemarksModalShow(false)}
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
            />
            <AssignTeamModal
                show={assignTeamModalShow}
                handleClose={() => setAssignTeamModalShow(false)}
                handleSave={handleAssignTeamSave}
                data={assignTeamModalData}
            />
        </>
    );
};
export default ProjectDetailsTable;
