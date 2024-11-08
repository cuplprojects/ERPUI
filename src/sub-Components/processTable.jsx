import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Card, Spinner, Row, Col } from 'react-bootstrap';
import ProjectDetailsTable from './projectDetailTable';
import StatusPieChart from "./StatusPieChart";
import StatusBarChart from "./StatusBarChart";
import "./../styles/processTable.css";
import { Switch, Select } from 'antd';
import CatchProgressBar from './catchProgressBar';
import AlertBadge from "./AlertBadge";
import CatchDetailModal from '../menus/CatchDetailModal';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';
import { MdPending, MdCloudUpload } from "react-icons/md";
import { Link } from 'react-router-dom';
import { FaRegHourglassHalf } from "react-icons/fa6";

import API from '../CustomHooks/MasterApiHooks/api';
import { useUserData } from '../store/userDataStore';
import { getProjectProcessAndFeature, getProjectProcessByProjectAndSequence } from '../CustomHooks/ApiServices/projectProcessAndFeatureService';
import useCurrentProcessStore from '../store/currentProcessStore';
import { decrypt } from "../Security/Security";
import { getCombinedPercentages } from '../CustomHooks/ApiServices/transacationService';

const ProcessTable = () => {
    const { encryptedProjectId, encryptedLotNo } = useParams();
    const id = decrypt(encryptedProjectId);
    const lotNo = decrypt(encryptedLotNo);
    const [featureData, setFeatureData] = useState(null);
    const { processId, processName } = useCurrentProcessStore();
    const { setProcess } = useCurrentProcessStore((state) => state.actions);
    const userData = useUserData();

    const { getCssClasses } = useStore(themeStore);
    const cssClasses = useMemo(() => getCssClasses(), [getCssClasses]);
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

    const [tableData, setTableData] = useState([]);
    const [showBarChart, setShowBarChart] = useState(true);
    const [catchDetailModalShow, setCatchDetailModalShow] = useState(false);
    const [catchDetailModalData, setCatchDetailModalData] = useState(null);
    const [selectedLot, setSelectedLot] = useState(lotNo);
    const [projectName, setProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [projectLots, setProjectLots] = useState([]);
    const [previousProcess, setPreviousProcess] = useState(null);
    const [processes, setProcesses] = useState([]);
    const [previousProcessCompletionPercentage, setPreviousProcessCompletionPercentage] = useState(0);


    useEffect(() => {
        fetchCombinedPercentages();
    }, [selectedLot, previousProcess]);

    const handleProcessChange = async (value) => {
        const selectedProcess = processes.find(p => p.processId === value);
        if (selectedProcess) {
            setProcess(selectedProcess.processId, selectedProcess.processName);
            setIsLoading(true);
            try {
                // Fetch new feature data for selected process
                const data = await getProjectProcessAndFeature(userData.userId, id);
                const processData = data.find(p => p.processId === value);
                setFeatureData(processData);

                // Update previous process data
                if (processData.sequence > 1) {
                    const previousProcessData = await getProjectProcessByProjectAndSequence(id, processData.sequence - 1);
                    setPreviousProcess(previousProcessData);
                } else {
                    setPreviousProcess(null);
                }

                // Refresh quantity sheet data
                await fetchQuantitySheet();
            } catch (error) {
                console.error("Error updating process data:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const fetchCombinedPercentages =async () => {
        try {
            const data = await getCombinedPercentages(id);
            // Update state with combined percentages data
            if (data && previousProcess) {
                // Handle the combined percentages data
                console.log("Combined percentages:", data?.lotProcessWeightageSum[selectedLot][previousProcess.processId]);
                setPreviousProcessCompletionPercentage(data?.lotProcessWeightageSum[selectedLot][previousProcess.processId]);
            }
        } catch (error) {
            console.error("Error fetching combined percentages:", error);
        }
    };
    
    const hasFeaturePermission = useCallback((featureId) => {
        if (userData?.role?.roleId === 1) {
            return true;
        }
        if (featureData?.featuresList) {
            return featureData.featuresList.includes(featureId);
        }
        return false;
    }, [userData, featureData]);

    const formatQuantitySheetData = (item) => ({
        srNo: item?.quantitySheetId || "",
        catchNumber: item?.catchNo,
        paper: item?.paper || "undefined",
        course: item?.course,
        subject: item?.subject,
        outerEnvelope: item?.outerEnvelope,
        innerEnvelope: item?.innerEnvelope,
        lotNo: item?.lotNo,
        quantity: item?.quantity,
        percentageCatch: item?.percentageCatch,
        projectId: item?.projectId,
        processId: item?.processId || [],
        status: item?.status || "Pending",
        alerts: "",
        interimQuantity: "0",
        remarks: "",
        previousProcessStats: "",
        voiceRecording: ""
    });

    const fetchData = useCallback(async () => {
        if (userData?.userId && id !== processId) {
            setIsLoading(true);
            try {
                const data = await getProjectProcessAndFeature(userData.userId, id);
                if (Array.isArray(data) && data.length > 0) {
                    console.log(data);
                    // Default to first process if none selected
                    const selectedProcess = data.find(p => p.processId === processId) || data[0];
                    setProcess(selectedProcess.processId, selectedProcess.processName);
                    setFeatureData(selectedProcess);

                    if (selectedProcess.sequence > 1) {
                        const previousProcessData = await getProjectProcessByProjectAndSequence(id, selectedProcess.sequence - 1);
                        setPreviousProcess(previousProcessData);
                    }

                    // Store all processes for toggling
                    setProcesses(data.map(p => ({
                        processId: p.processId,
                        processName: p.processName,
                        sequence: p.sequence
                    })));

                }
            } catch (error) {
                console.error("Error fetching project process data:", error);
                setProcess(0, "Unknown Process");
                setFeatureData([]);
                setProcesses([]);
            } finally {
                setIsLoading(false);
            }
        }
    }, [userData, id, processId, setProcess]);

    const fetchQuantitySheet = useCallback(async () => {
        try {
            const response = await API.get(`/QuantitySheet/CatchByproject?ProjectId=${id}`);
            const quantitySheetData = response.data;

            if (Array.isArray(quantitySheetData) && quantitySheetData.length > 0) {
                const formDataGet = quantitySheetData.map(formatQuantitySheetData);

                // Filter data for selected lot if one is selected
                const filteredData = selectedLot
                    ? formDataGet.filter(item => Number(item.lotNo) === Number(selectedLot))
                    : formDataGet;

                setTableData(filteredData);

                // Extract unique lot numbers and sort them
                const uniqueLots = [...new Set(quantitySheetData.map(item => item.lotNo))].sort((a,b) => a - b);
                setProjectLots(uniqueLots.map(lotNo => ({ lotNo })));
            }
        } catch (error) {
            console.error("Error fetching quantity sheet data:", error);
            setTableData([]);
            setProjectLots([]);
        }
    }, [id, selectedLot]);

    useEffect(() => {
        fetchData();
        
        // Fetch project name
        const fetchProjectName = async () => {
            try {
                const response = await API.get(`/Project/${id}`);
                setProjectName(response.data.name);
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        };
        fetchProjectName();
    }, [fetchData, id]);

    // Update useEffect to watch for selectedLot changes
    useEffect(() => {
        if (selectedLot) {
            fetchQuantitySheet();
        }
    }, [selectedLot, fetchQuantitySheet]);

    const handleLotClick = async (lot) => {
        // Only update if clicking a different lot
        if (lot !== selectedLot) {
            setSelectedLot(lot);
            setIsLoading(true);
            try {
                const response = await API.get(`/QuantitySheet/CatchByproject?ProjectId=${id}`);
                const quantitySheetData = response.data;
                const formDataGet = quantitySheetData.map(formatQuantitySheetData);
                const filteredData = formDataGet.filter(item => Number(item.lotNo) === Number(lot));
                setTableData(filteredData);
            } catch (error) {
                console.error("Error fetching lot data:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCatchClick = (record) => {
        setCatchDetailModalShow(true);
        setCatchDetailModalData(record);
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading project details...</span>
            </div>
        );
    }

    const catchNumbers = tableData.map((item) => item.catchNumber).sort((a, b) => a - b);

    // Combine entries with the same catch number
    const combinedTableData = tableData.reduce((acc, item) => {
        const existingItem = acc.find(i => i.catchNumber === item.catchNumber);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            acc.push({ ...item });
        }
        return acc;
    }, []);

    return (
        <div className="container-fluid">
            <Row className="mb-">
                <Col lg={12} md={12} xs={12} className=''>
                    <Card className="shadow-sm">
                        <Card.Header as="h3" className={`${customDark === 'dark-dark' ? `${customDark} text-white` : `${customDark} text-white`}`}>
                            <Row className='d-flex align-items-center'>
                                <Col lg={6} md={4} xs={12} className='d-lg-none d-md-none'>
                                    <div className="center-head d-flex justify-content-center">
                                        <span className='text-center fs-4 me-3'>{projectName}</span>
                                        <span className='text-center fs-4'>Lot - {selectedLot}</span>
                                    </div>
                                </Col>
                                <div className="d-flex justify-content-center d-lg-none d-md-none">
                                    <hr className='w-100 center' />
                                </div>

                                {processName === 'preProQC' ? (
                                    <Col lg={3} md={4} xs={12} className='d-flex justify-content-center'>
                                        <Link to="/quantity-sheet-uploads" className={`${customMid} ${customDarkText} ${customLightBorder} border-3 p1 rounded d-flex align-items-center p-1 text-decoration-none shadow-lg`}>
                                            <span>Quantity</span>
                                            <span><MdCloudUpload className='ms-2' /></span>
                                        </Link>
                                    </Col>
                                ) : (
                                    <Col lg={3} md={4} xs={12}>
                                        <div className={`align-items-center flex-column`}>
                                            <div className='text-center fs-5'>Previous Process</div>
                                            <div className={`p-1 fs-6 text-primary border ${customDarkBorder} rounded ms-1 d-flex justify-content-center align-items-center ${customDark === 'dark-dark' ? `${customBtn} text-white` : `${customLight} bg-light`}`} style={{ fontWeight: 900 }}>
                                                {previousProcess ? `${previousProcess.processName} - ${previousProcessCompletionPercentage}%` : 'N/A'}
                                                <span className='ms-2'><FaRegHourglassHalf color='blue' size="20" /></span>
                                            </div>
                                        </div>
                                    </Col>
                                )}

                                <div className="d-flex justify-content-center d-lg-none d-md-none">
                                    <hr className='w-100 center' />
                                </div>

                                <Col lg={6} md={4} xs={12} className='d-none d-lg-block d-md-block'>
                                    <div className="center-head">
                                        <div className='text-center fs-4'>{projectName}</div>
                                        <div className='text-center fs-4'>Lot - {selectedLot}</div>
                                    </div>
                                </Col>

                                <Col lg={3} md={4} xs={12}>
                                    <div className={`align-items-center flex-column`}>
                                        <div className='text-center fs-5'>Current Process</div>
                                        <Select
                                            value={processId}
                                            onChange={handleProcessChange}
                                            className={`w-100 ${customDark === 'dark-dark' ? 'text-white' : ''}`}
                                        >
                                            {processes.map(process => (
                                                <Select.Option key={process.processId} value={process.processId}>
                                                    {process.processName}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Header>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={12} md={12}>
                    <div className="marquee-container mt-2 mb-2">
                        <marquee id="alert-marquee" behavior="scroll" direction="left" scrollamount="5" onMouseOver={(e) => e.target.stop()} onMouseOut={(e) => e.target.start()}>
                            <div className="d-flex gap-4">
                                {tableData.map((record, index) => (
                                    record.alerts && record.alerts.length > 0 && (
                                        <AlertBadge key={index} catchNo={record.catchNumber} alerts={record.alerts} onClick={() => handleCatchClick(record)} status="level1" />
                                    )
                                ))}
                            </div>
                        </marquee>
                    </div>
                </Col>
            </Row>

            <Row className='mb-5'>
                <Col lg={12} md={12}>
                    <CatchProgressBar data={combinedTableData} />
                </Col> 
            </Row>

            <Row>
                <Col lg={12} md={12} className="pe-0">
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {projectLots.map((lot, index) => (
                            <button
                                key={index}
                                className={`${selectedLot === lot.lotNo ? 'bg-white text-dark border-dark' : customBtn} ${customDark === "dark-dark" ? 'border' : 'custom-light-border'} d-flex align-items-center justify-content-center p-2 rounded-2 ${customDark === "dark-dark" ? 'text-dark border-dark' : 'text-dark'} ${customDarkBorder}`}
                                onClick={() => handleLotClick(lot.lotNo)}
                                style={{
                                    minWidth: '100px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Lot {lot.lotNo}
                            </button>
                        ))}
                    </div>
                </Col>
                 {/* <Col lg={3} md={12} className="pe-0">
                            <h4 className={`${customDark} text-white p-2`}>Project Lots</h4>
                            <div className="d-flex flex-column" style={{ width: '100%', maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden', backgroundColor: '#f0f8ff' }}>
                                {projectLots.map((lot, index) => (
                                    <div
                                        key={index}
                                        className={`mb-2 p-2 rounded-1 ${customLight} ${customDarkText} ${selectedLot === lot.lotNo ? 'border border-primary shadow-lg' : 'border'}`}
                                        onClick={() => handleLotClick(lot.lotNo)}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            transform: selectedLot === lot.lotNo ? 'scale(1.02)' : 'scale(1)',
                                            backgroundColor: selectedLot === lot.lotNo ? '#e6f7ff' : '#ffffff'
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className={`mb-0 ${selectedLot === lot.lotNo ? 'fw-bold text-dark' : ''}`} style={{ width: '90%' }}>
                                                <span className="d-flex justify-content-start align-items-center" style={{ height: '100%' }}>
                                                    Lot {lot.lotNo}
                                                </span>
                                            </h5>
                                            {selectedLot === lot.lotNo && <span className="text-primary">✓</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col> */}
            </Row>

            <Row className='mb-2 mt-1'>



                <Col lg={12} md={12} className="">
                    {tableData?.length > 0 && (
                        <ProjectDetailsTable
                            tableData={combinedTableData}
                            setTableData={setTableData}
                            projectId={id}
                            lotNo={selectedLot}
                            featureData={featureData}
                            hasFeaturePermission={hasFeaturePermission}
                            processId={processId}
                            projectLots={projectLots}
                        />
                    )}
                </Col>
            </Row>

            <Row className='mb-4 d-flex justify-content-between'>
                <Col lg={8} md={12} className='mb-1'>
                    <Switch checked={showBarChart} onChange={() => setShowBarChart(!showBarChart)} />
                    <span className={`ms-2 ${customDarkText}`}>
                        {showBarChart ? 'Show Overall Completion Data' : 'Show Catch Data'}
                    </span>
                </Col>

                {showBarChart ? (
                    <Col lg={12} md={12} sm={12} className='mt-1 d-fle justify-content-center'>
                        <StatusBarChart data={combinedTableData} catchNumbers={catchNumbers} />
                    </Col>
                ) : (
                    <Col lg={12} md={12} sm={12} className='mt-1 d-fle justify-content-center'>
                        <StatusPieChart data={combinedTableData} />
                    </Col>
                )}
            </Row>

            <CatchDetailModal
                show={catchDetailModalShow}
                handleClose={() => setCatchDetailModalShow(false)}
                data={catchDetailModalData}
            />
        </div>
    );
};

export default ProcessTable;