import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Spinner, Dropdown, Pagination } from "react-bootstrap";
import { FaFilePdf, FaFileExcel, FaFileExport, FaSearch, FaFilter, FaSave, FaArrowLeft, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import API from "../../CustomHooks/MasterApiHooks/api";
import Table from 'react-bootstrap/Table';
import ExcelExport from './excel';
import PdfExport from './Pdf';

import ProcessDetails from './Process';

const ProjectReport = () => {
    const [activeProjects, setActiveProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(() => localStorage.getItem('selectedProjectId') || "");
    const [selectedGroup, setSelectedGroup] = useState(() => localStorage.getItem('selectedGroup') || "");
    const [selectedLot, setSelectedLot] = useState("");
    const [lotNumbers, setLotNumbers] = useState([]);
    const [groups, setGroups] = useState({});
    const [quantitySheets, setQuantitySheets] = useState([]);
    const [showTable, setShowTable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedCatch, setSelectedCatch] = useState(null);
    const [showCatchView, setShowCatchView] = useState(false);
    const [viewMode, setViewMode] = useState('catch'); // 'catch' or 'process'
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState({
        catchNo: true,
        subject: true,
        course: true,
        examDate: true,
        examTime: true,
        quantity: true,
        pageNo: true,
        status: true,
        dispatchDate: true
    });

    const columnDefinitions = [
        { id: 'catchNo', label: 'Catch No' },
        { id: 'subject', label: 'Subject' },
        { id: 'course', label: 'Course' },
        { id: 'examDate', label: 'Exam Date' },
        { id: 'examTime', label: 'Exam Time' },
        { id: 'quantity', label: 'Quantity' },
        { id: 'pageNo', label: 'Page NO' },
        { id: 'status', label: 'Status' },
        { id: 'dispatchDate', label: 'Dispatch Date' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const groupsResponse = await API.get("/Reports/GetAllGroups");
                const groupsMap = {};
                groupsResponse.data.forEach((group) => {
                    if (group.status) {
                        groupsMap[group.id] = group.name;
                    }
                });
                setGroups(groupsMap);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            if (selectedGroup) {
                setIsLoading(true);
                try {
                    const projectsResponse = await API.get(`/Reports/GetProjectsByGroupId/${selectedGroup}`);
                    setActiveProjects(projectsResponse.data);
                    localStorage.setItem('selectedGroup', selectedGroup);
                } catch (error) {
                    console.error("Error fetching projects:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setActiveProjects([]);
            }
        };

        fetchProjects();
    }, [selectedGroup]);

    useEffect(() => {
        const fetchLotNumbers = async () => {
            if (selectedProjectId) {
                setIsLoading(true);
                try {
                    const projectIndex = activeProjects.indexOf(selectedProjectId) + 1;
                    const response = await API.get(`/Reports/GetLotNosByProjectId/${projectIndex}`);
                    setLotNumbers(response.data);
                    localStorage.setItem('selectedProjectId', selectedProjectId);
                } catch (error) {
                    console.error("Error fetching lot numbers:", error);
                    setLotNumbers([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setLotNumbers([]);
            }
        };

        fetchLotNumbers();
    }, [selectedProjectId, activeProjects]);

    const handleViewReport = async () => {
        if (selectedProjectId) {
            setIsLoading(true);
            try {
                const projectIndex = activeProjects.indexOf(selectedProjectId) + 1;
                const response = await API.get(`/Reports/GetQuantitySheetsByProjectId/${projectIndex}/LotNo/${selectedLot}`);
                const filteredSheets = selectedLot
                    ? response.data.filter((sheet) => sheet.lotNo === selectedLot)
                    : response.data;
                setQuantitySheets(filteredSheets);
                setShowTable(true);
            } catch (error) {
                console.error("Error fetching quantity sheets:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };
    const handleSearch = async (query, page = 1, pageSize = 5) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await fetch(`/Reports/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&groupId=${selectedGroup}&projectId=${selectedProjectId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }
            const data = await response.json();
            setSearchResults(data.results);
        } catch (error) {
            console.error("Error searching:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };


    const handleSearchs = async (value) => {
        setSearchTerm(value);

        if (!value) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            const response = await fetch(`https://localhost:7212/api/Reports/GetQuantitySheetsByCatchNo/${value}`);
            if (!response.ok) throw new Error("Failed to fetch data");

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchResultClicks = (item) => {
        setSelectedItem(item);
        setSearchTerm(item.catchNo);
        setShowDropdown(false);
    };

    const [currentPage, setCurrentPage] = useState(0);
    const recordsPerPage = 5;

    return (
        <Container fluid className="py-1"
        >


            <Row  >
                <Col xs={12} md={3} lg={2} className="mb-3 mb-md-0">
                    <Form.Label className="fw-bold text-primary mb-2" style={{ fontSize: "1.1rem", letterSpacing: "0.5px", fontWeight: "700" }}>
                        <span style={{ color: '#2c3e50', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Group</span>
                        <span style={{ color: '#e74c3c' }}>*</span>
                    </Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            setSelectedGroup(e.target.value);
                            setQuantitySheets([]);
                        }}
                        value={selectedGroup}
                        className="form-select-lg border-0 rounded-pill"
                        style={{
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                    >
                        <option value="">Select Group</option>
                        {Object.entries(groups).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </Form.Select>
                </Col>

                <Col xs={12} md={3} lg={2} className="mb-3 mb-md-0">
                    <Form.Label className="fw-bold text-primary mb-2" style={{ fontSize: "1.1rem", letterSpacing: "0.5px", fontWeight: "700" }}>
                        <span style={{ color: '#2c3e50', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Project</span>
                        <span style={{ color: '#e74c3c' }}>*</span>
                    </Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            setSelectedProjectId(e.target.value);
                            setSelectedLot("");
                            setQuantitySheets([]);
                        }}
                        value={selectedProjectId}
                        className="form-select-lg border-0 rounded-pill"
                        style={{
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                    >
                        <option value="">Select Project</option>
                        {activeProjects.map((project, index) => (
                            <option key={index} value={project}>{project}</option>
                        ))}
                    </Form.Select>
                </Col>

                <Col xs={12} md={3} lg={2} className="mb-3 mb-md-0">
                    <Form.Label className="fw-bold text-primary mb-2" style={{ fontSize: "1.1rem", letterSpacing: "0.5px", fontWeight: "700" }}>
                        <span style={{ color: '#2c3e50', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>Lot</span>
                        <span style={{ color: '#e74c3c' }}>*</span>
                    </Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            setSelectedLot(e.target.value);
                            setQuantitySheets([]);
                        }}
                        value={selectedLot}
                        disabled={!selectedProjectId}
                        className="form-select-lg border-0 rounded-pill"
                        style={{
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            opacity: selectedProjectId ? 1 : 0.7
                        }}
                    >
                        <option value="">Select Lot</option>
                        {lotNumbers.map((lotNo) => (
                            <option key={lotNo} value={lotNo}>{lotNo}</option>
                        ))}
                    </Form.Select>
                </Col>

                {selectedGroup && selectedProjectId && selectedLot && (
                    <Col xs={12} md={3} lg={1} className="mb-2 mb-md-0 d-flex align-items-end">
                        <Button
                            variant="primary"
                            onClick={handleViewReport}
                            disabled={isLoading}
                            className="w-100 py-2 rounded-pill fw-bold"
                            style={{
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
                                opacity: isLoading ? 0.7 : 1,
                                transform: isLoading ? "none" : "translateY(-1px)"
                            }}
                        >
                            View Report
                        </Button>
                    </Col>
                )}
                <div className="container mt-2">
                    {/* Selected Item Details */}
                    {selectedItem && (
                        <div className="mb-3 p-2 bg-light rounded shadow-sm">
                            <div className="row">
                                <div className="col-md-3">
                                    <strong>Group:</strong> {groups[selectedGroup]}
                                </div>
                                <div className="col-md-3">
                                    <strong>Project:</strong> {selectedProjectId}
                                </div>
                                <div className="col-md-3">
                                    <strong>Lot:</strong> {selectedItem.lotNo}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Dropdown */}
                    <div className="d-flex justify-content-end mb-3">
                        <Dropdown show={showDropdown} onToggle={(isOpen) => setShowDropdown(isOpen)}>
                            <Dropdown.Toggle
                                variant="primary"
                                id="dropdown-search"
                                style={{
                                    borderRadius: "30px",
                                    backgroundColor: "#4A90E2",
                                    padding: "10px 20px",
                                    width: "250px",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <FaSearch style={{ marginRight: "10px" }} />
                                {searchTerm || "Quick search..."}
                            </Dropdown.Toggle>

                            <Dropdown.Menu style={{ width: "400px", padding: "20px", height: "300px", overflowY: "auto" }}>
                                <div className="position-relative mb-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Catch No..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            handleSearch(e.target.value);
                                            handleSearchs(e.target.value);
                                        }}
                                        style={{ borderRadius: "20px", border: "1px solid #4A90E2", paddingLeft: "40px" }}
                                    />
                                    <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#4A90E2" }} />
                                </div>

                                {isSearching ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" size="sm" variant="primary" />
                                        <div className="text-muted mt-2">Searching...</div>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="search-results">
                                        {searchResults.map((result, index) => (
                                            <div key={index} className="p-3 border-bottom hover-bg-light" onClick={() => handleSearchResultClicks(result)} style={{ cursor: "pointer" }}>

                                                <div className="fw-bold text-primary">{result.catchNo}</div>
                                                <div className="text-muted small">{result.examDate}</div>
                                                <div className="text-muted small">Status: {result.catchStatus}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchTerm ? (
                                    <div className="text-center py-4">
                                        <div className="text-muted">No results found</div>
                                        <small className="text-muted">Try a different search term</small>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <div>Type to search for Catch No</div>
                                        <small>Search results will appear here</small>
                                    </div>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>

                    {/* Table to display selected data */}
                    {selectedItem && (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Catch No</th>
                                    <th>Paper</th>
                                    <th>Exam Date</th>
                                    <th>Exam Time</th>
                                    <th>Lot No</th>
                                    <th>Quantity</th>
                                    <th>Pages</th>
                                    <th>Status</th>
                                    <th>Current Process</th>
                                    <th>Processes</th>
                                    <th>Teams</th>
                                    <th>Machines</th>
                                    <th>Dispatch</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{selectedItem.catchNo}</td>
                                    <td>{selectedItem.paper}</td>
                                    <td>{new Date(selectedItem.examDate).toLocaleDateString()}</td>
                                    <td>{selectedItem.examTime}</td>
                                    <td>{selectedItem.lotNo}</td>
                                    <td>{selectedItem.quantity}</td>
                                    <td>{selectedItem.pages}</td>
                                    <td>{selectedItem.catchStatus}</td>
                                    <td>{selectedItem.currentProcessName}</td>
                                    <td>
                                        <ul>
                                            {selectedItem.processNames.map((process, i) => (
                                                <li key={i}>{process}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>
                                        {selectedItem.transactionData.teamDetails.map((team, i) => (
                                            <div key={i}>
                                                <b>{team.teamName}</b>: {team.userNames.join(", ")}
                                            </div>
                                        ))}
                                    </td>
                                    <td>{selectedItem.transactionData.machineNames.join(", ")}</td>
                                    <td>
                                        {selectedItem.dispatchDate}
                                        <Button
                                            variant="link"
                                            className="ms-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                selectedItem.showProcessDetails = !selectedItem.showProcessDetails;
                                                setSelectedItem({ ...selectedItem });
                                            }}
                                        >
                                            <FaArrowLeft style={{
                                                transform: selectedItem.showProcessDetails ? 'rotate(90deg)' : 'rotate(270deg)',
                                                transition: 'transform 0.3s'
                                            }} />
                                        </Button>
                                    </td>
                                </tr>
                                {selectedItem.showProcessDetails && (
                                    <tr>
                                        <td colSpan="13">
                                            <ProcessDetails
                                                catchData={selectedItem}
                                                projectName={selectedProjectId}
                                                groupName={groups[selectedGroup]}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </div>






            </Row>

            {isLoading && (
                <div className="text-center mt-4">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {!isLoading && showTable && quantitySheets.length > 0 && (
                <Row className="mt-4">
                    <Col>
                        <Row className="mb-3 align-items-center">


                            <Col xs={12} md={4}>
                                <div className="position-relative w-100 d-flex align-items-center">
                                    <Form.Control
                                        type="search"
                                        placeholder="Search..."
                                        className="rounded-pill"
                                        onChange={(e) => {
                                            const searchTerm = e.target.value.toLowerCase();
                                            if (!searchTerm) {
                                                handleViewReport();
                                                return;
                                            }
                                            const filteredSheets = quantitySheets.filter(sheet => {
                                                return (
                                                    sheet.catchNo?.toString().toLowerCase().includes(searchTerm) ||
                                                    sheet.examDate?.toString().toLowerCase().includes(searchTerm) ||
                                                    sheet.examTime?.toString().toLowerCase().includes(searchTerm) ||
                                                    sheet.lotNo?.toString().toLowerCase().includes(searchTerm) ||
                                                    sheet.quantity?.toString().toLowerCase().includes(searchTerm) ||
                                                    sheet.status?.toString().toLowerCase().includes(searchTerm) ||
                                                    sheet.catchStatus?.toLowerCase().includes(searchTerm) ||
                                                    sheet.currentProcessName?.toLowerCase().includes(searchTerm) ||
                                                    sheet.transactionData?.zoneDescriptions?.join(', ').toLowerCase().includes(searchTerm) ||
                                                    sheet.transactionData?.teamDetails?.some(team =>
                                                        team.teamName.toLowerCase().includes(searchTerm) ||
                                                        team.userNames.join(', ').toLowerCase().includes(searchTerm)
                                                    ) ||
                                                    sheet.transactionData?.machineNames?.join(', ').toLowerCase().includes(searchTerm) ||
                                                    sheet.processNames?.some(process => process.toLowerCase().includes(searchTerm))
                                                );
                                            });
                                            setQuantitySheets(filteredSheets);
                                        }}
                                    />
                                    <FaSearch className="position-absolute" style={{ right: '45px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                                    <div className="dropdown">
                                        <Button
                                            variant="link"
                                            className="p-0 ms-2"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                            onClick={(e) => {
                                                e.currentTarget.parentElement.nextElementSibling.classList.toggle('show');
                                            }}
                                        >
                                            <FaFilter style={{ color: '#6c757d' }} />
                                        </Button>
                                        <div className="dropdown-menu p-3" style={{ minWidth: '300px' }}>
                                            <div className="d-flex justify-content-between mb-3">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                >
                                                    <FaSave className="me-1" /> Save
                                                </Button>
                                            </div>
                                            <div>
                                                <div className="mb-3">
                                                    <div className="d-flex flex-wrap gap-2" id="selected-filters">
                                                        <span className="badge bg-primary" style={{ cursor: 'pointer' }} data-id="1">
                                                            Catch No <span className="ms-1">&times;</span>
                                                        </span>
                                                        <span className="badge bg-primary" style={{ cursor: 'pointer' }} data-id="2">
                                                            Exam Date <span className="ms-1">&times;</span>
                                                        </span>
                                                        <span className="badge bg-primary" style={{ cursor: 'pointer' }} data-id="4">
                                                            Lot No <span className="ms-1">&times;</span>
                                                        </span>
                                                        <span className="badge bg-primary" style={{ cursor: 'pointer' }} data-id="5">
                                                            Quantity <span className="ms-1">&times;</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="column-list" style={{ cursor: 'grab' }}>
                                                    {columnDefinitions.map(column => (
                                                        <div key={column.id} className="form-check mb-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`column-${column.id}`}
                                                                checked={visibleColumns[column.id]}
                                                                onChange={(e) => {
                                                                    setVisibleColumns(prev => ({
                                                                        ...prev,
                                                                        [column.id]: e.target.checked
                                                                    }));
                                                                }}
                                                            />
                                                            <label className="form-check-label" htmlFor={`column-${column.id}`}>
                                                                {column.label}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={12} md={4} className="text-end">
                                <div className="mt-3">
                                    <Dropdown className="d-inline-block">
                                        <Dropdown.Toggle variant="primary" id="export-dropdown" className="me-2">
                                            <FaFileExport className="me-3" />
                                            Export
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="mt-1">
                                            <Dropdown.Item
                                                as={ExcelExport}
                                                data={quantitySheets}
                                                projectName={selectedProjectId}
                                                groupName={groups[selectedGroup]}
                                                visibleColumns={visibleColumns}
                                                className="py-2"
                                            >

                                            </Dropdown.Item>

                                            <Dropdown.Divider />

                                            <Dropdown.Item
                                                as={PdfExport}
                                                data={quantitySheets}
                                                projectName={selectedProjectId}
                                                groupName={groups[selectedGroup]}
                                                visibleColumns={visibleColumns}
                                                className="py-2"
                                            >
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </Col>
                        </Row>

                        {!showCatchView ? (
                            <div className="table-responsive">


                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    <div className="bg-light p-2 rounded shadow-sm">
                                        <span className="fw-bold text-primary">Total Records: </span>
                                        <span className="badge bg-danger">{quantitySheets.length}</span>
                                    </div>
                                    <div>
                                        Show: 
                                        <select 
                                            className="form-select form-select-sm d-inline-block w-auto ms-2"
                                            value={recordsPerPage}
                                            onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>

                                <Table striped bordered hover className="shadow-sm">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            {visibleColumns.catchNo && <th>Catch No</th>}
                                            {visibleColumns.subject && <th>Subject</th>}
                                            {visibleColumns.course && <th>Course</th>}
                                            {visibleColumns.examDate && <th>Exam Date</th>}
                                            {visibleColumns.examTime && <th>Exam Time</th>}
                                            {visibleColumns.quantity && <th>Quantity</th>}
                                            {visibleColumns.pageNo && <th>Page NO</th>}
                                            {visibleColumns.status && <th>Status</th>}
                                            {visibleColumns.dispatchDate && <th>Dispatch Date</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quantitySheets
                                            .slice(currentPage * recordsPerPage, (currentPage + 1) * recordsPerPage)
                                            .map((sheet, index) => [
                                            <tr key={`${index}-main`} style={{ cursor: 'pointer' }} className="hover-highlight">
                                                {visibleColumns.catchNo && <td>{sheet.catchNo}</td>}
                                                {visibleColumns.subject && <td>{sheet.subject}</td>}
                                                {visibleColumns.course && <td>{sheet.course}</td>}
                                                {visibleColumns.examDate && <td>{new Date(sheet.examDate).toLocaleDateString()}</td>}
                                                {visibleColumns.examTime && <td>{sheet.examTime}</td>}
                                                {visibleColumns.quantity && <td>{sheet.quantity}</td>}
                                                {visibleColumns.pageNo && <td>{sheet.pages}</td>}
                                                {visibleColumns.status && (
                                                    <td>
                                                        <span className={`badge ${sheet.catchStatus === 'Completed' ? 'bg-success' :
                                                            sheet.catchStatus === 'Running' ? 'bg-warning' : 'bg-secondary'
                                                            }`}>
                                                            {sheet.catchStatus}
                                                        </span>
                                                    </td>
                                                )}
                                                {visibleColumns.dispatchDate && (
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            {sheet.dispatchDate}
                                                            <Button
                                                                variant="link"
                                                                className="ms-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCatch(sheet);
                                                                    sheet.showProcessDetails = !sheet.showProcessDetails;
                                                                    setQuantitySheets([...quantitySheets]);
                                                                }}
                                                            >
                                                                <FaArrowLeft style={{
                                                                    transform: sheet.showProcessDetails ? 'rotate(90deg)' : 'rotate(270deg)',
                                                                    transition: 'transform 0.3s'
                                                                }} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>,
                                            sheet.showProcessDetails && (
                                                <tr key={`${index}-details`}>
                                                    <td colSpan="9">
                                                        <ProcessDetails
                                                            catchData={sheet}
                                                            projectName={selectedProjectId}
                                                            groupName={groups[selectedGroup]}
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        ])}
                                    </tbody>
                                </Table>

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className="text-muted" style={{
                                        fontSize: "0.95rem",
                                        fontWeight: "500",
                                        padding: "8px 12px",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "6px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                                    }}>
                                        <span className="text-primary">Showing</span>{" "}
                                        <span className="fw-bold">{currentPage * recordsPerPage + 1}</span>{" "}
                                        <span className="text-primary">to</span>{" "}
                                        <span className="fw-bold">{Math.min((currentPage + 1) * recordsPerPage, quantitySheets.length)}</span>{" "}
                                        <span className="text-primary">of</span>{" "}
                                        <span className="text-danger">{quantitySheets.length}</span>{" "}
                                        <span className="text-primary">entries</span>
                                    </div>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link" 
                                                onClick={() => setCurrentPage(p => p - 1)}
                                                disabled={currentPage === 0}
                                            >
                                                Previous
                                            </button>
                                        </li>
                                        {[...Array(Math.ceil(quantitySheets.length / recordsPerPage))].map((_, i) => {
                                            // Show first page, current page, last page and one page before/after current
                                            const showPage = i === 0 || // First page
                                                           i === Math.ceil(quantitySheets.length / recordsPerPage) - 1 || // Last page
                                                           Math.abs(currentPage - i) <= 1; // Current page and adjacent pages
                                            
                                            if (!showPage) {
                                                // Show ellipsis if there's a gap
                                                if (i === currentPage - 2 || i === currentPage + 2) {
                                                    return (
                                                        <li key={i} className="page-item disabled">
                                                            <span className="page-link">...</span>
                                                        </li>
                                                    );
                                                }
                                                return null;
                                            }

                                            return (
                                                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                                                    <button 
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(i)}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        <li className={`page-item ${currentPage >= Math.ceil(quantitySheets.length / recordsPerPage) - 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                disabled={currentPage >= Math.ceil(quantitySheets.length / recordsPerPage) - 1}
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            viewMode === 'catch' ? (
                                <CatchDetails
                                    catchData={selectedCatch}
                                    projectName={selectedProjectId}
                                    groupName={groups[selectedGroup]}
                                />
                            ) : (
                                <ProcessDetails
                                    catchData={selectedCatch}
                                    projectName={selectedProjectId}
                                    groupName={groups[selectedGroup]}
                                />
                            )
                        )}
                    </Col>
                </Row>
            )}


        </Container>
    );
};

export default ProjectReport;


