import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Card, Spinner, Row, Col } from 'react-bootstrap'; // Import Bootstrap components
import ProjectDetailsTable from './projectDetailTable'; // Import the new component
import StatusPieChart from "./StatusPieChart";
import StatusBarChart from "./StatusBarChart";
import "./../styles/processTable.css";
import { Switch } from 'antd';
import CatchProgressBar from './catchProgressBar';
import AlertBadge from "./AlertBadge";
import CatchDetailModal from '../menus/CatchDetailModal';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';
import { MdPending, MdCloudUpload } from "react-icons/md";
import { Link } from 'react-router-dom';
import { FaRegHourglassHalf } from "react-icons/fa6";//pre process running
import API from '../CustomHooks/MasterApiHooks/api';
import { useUserData } from '../store/userDataStore';
import { getProjectProcessAndFeature, getProjectProcessByProjectAndSequence } from '../CustomHooks/ApiServices/projectProcessAndFeatureService';
import useCurrentProcessStore from '../store/currentProcessStore';
import { decrypt } from "../Security/Security";


const ProcessTable = () => {

    const { encryptedProjectId, encryptedLotNo } = useParams();
    const id = decrypt(encryptedProjectId);
    const lotNo = decrypt(encryptedLotNo);
    const [featureData, setFeatureData] = useState(null);
    const { processId, processName } = useCurrentProcessStore();
    const { setProcess, clearProcess } = useCurrentProcessStore((state) => state.actions);
    console.log(featureData);
    const userData = useUserData();

    const { getCssClasses } = useStore(themeStore);
    const cssClasses = useMemo(() => getCssClasses(), [getCssClasses]);
    const [
        customDark,
        customMid,
        customLight,
        customBtn,
        customDarkText,
        customLightText,
        customLightBorder,
        customDarkBorder
    ] = cssClasses;

    const location = useLocation();


    const [tableData, setTableData] = useState([]);
    const [showBarChart, setShowBarChart] = useState(true);
    const [catchDetailModalShow, setCatchDetailModalShow] = useState(false);
    const [catchDetailModalData, setCatchDetailModalData] = useState(null);
    const [previousProcessPercentage, setPreviousProcessPercentage] = useState(90);

    const [selectedLot, setSelectedLot] = useState(lotNo);
    const [projectName, setProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [projectLots, setProjectLots] = useState([]);
    const [previousProcess, setPreviousProcess] = useState(null);

    const fetchData = useCallback(async () => {
        if (userData && userData.userId && id !== processId) {
            setIsLoading(true);
            try {
                const data = await getProjectProcessAndFeature(userData.userId, id);
                console.log(data);
                if (Array.isArray(data) && data.length > 0) {
                    const process = data[0];
                    setProcess(process.processId, process.processName);
                    setFeatureData(process);

                    // Fetch previous process
                    if (process.sequence > 1) {
                        console.log(process.sequence);
                        const previousProcessData = await getProjectProcessByProjectAndSequence(id, process.sequence - 1);
                        setPreviousProcess(previousProcessData);
                    }
                } else {
                    console.warn("No process data available or unexpected data format received");
                    setProcess(0, "Unknown Process");
                    setFeatureData([]);
                }
            } catch (error) {
                console.error("Error fetching project process data:", error);
                setErrorMessage("Failed to load process data. Using default values.");
                setProcess(0, "Unknown Process");
                setFeatureData([]);
            } finally {
                setIsLoading(false);
            }
        }
    }, [userData, id, processId, setProcess]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const hasFeaturePermission = (featureId) => {
        if (userData?.role?.roleId === 1) {
            return true;
        }
        if (featureData?.featuresList) {
            return featureData.featuresList.includes(featureId);
        }
        return false;
    }


    useEffect(() => {
        const fetchQuantitySheet = async () => {
            try {

                const response = await API.get(`/QuantitySheet/CatchByproject?ProjectId=${id}`);

                const quantitySheetData = response.data;

                if (Array.isArray(quantitySheetData) && quantitySheetData.length > 0) {
                    console.log(quantitySheetData);
                    const formDataGet = quantitySheetData.map((item) => ({
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
                        status: item?.status || 0,
                        alerts: "",
                        interimQuantity: "0",
                        remarks: "",
                        previousProcessStats: "",
                        voiceRecording: ""
                    }));
                    console.log('Formatted data:', formDataGet);
                    setTableData(formDataGet); // Set the table data only here

                    // Extract unique lot numbers and set projectLots
                    const uniqueLots = [...new Set(formDataGet.map(item => item.lotNo))];
                    setProjectLots(uniqueLots.map(lotNo => ({ lotNo })));
                } else {
                    console.error("API response is not an array or is empty");
                    setTableData([]); // Set to empty only if there's no data
                    setProjectLots([]); // Set projectLots to empty array
                }
            } catch (error) {
                console.error("Error fetching quantity sheet data:", error);
                setTableData([]); // Set to empty on error
                setProjectLots([]); // Set projectLots to empty array on error
            }
        };

        fetchQuantitySheet();
    }, [id, lotNo]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await API.get(`/Project/${id}`);
                const projectData = response.data;
                setProjectName(projectData.name);
                // You can set other project details here if needed
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        };

        fetchProjectDetails();
    }, [id]);



    const handleToggleChange = () => {
        setShowBarChart(!showBarChart);
    };


    if (isLoading) {

        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading project details...</span>
            </div>
        );
    }

    const handleCatchClick = (record) => {
        setCatchDetailModalShow(true);
        setCatchDetailModalData(record);
    };

    const handleLotClick = (lot) => {
        setSelectedLot(lot);
    };

    const catchNumbers = tableData.map((item) => item.catchNumber).sort((a, b) => a - b);
    console.log(catchNumbers);

    const filteredTableData = selectedLot
        ? tableData.filter(item => item.lotNo === selectedLot)
        : tableData;

    // Combine entries with the same catch number and sum their quantities
    const combinedTableData = filteredTableData.reduce((acc, item) => {
        const existingItem = acc.find(i => i.catchNumber === item.catchNumber);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            acc.push({ ...item });
        }
        return acc;
    }, []);

    console.log(combinedTableData);

    return (
        <div className="container-fluid" >
            <Row className="mb-  ">
                <Col lg={12} md={12} xs={12} className=''>
                    <Card className="shadow-sm ">
                        <Card.Header as="h3" className={`${customDark === 'dark-dark' ? `${customDark} text-white` : `${customDark} text-white`}  `}>
                            <Row className='d-flex align-items-center'>
                                <Col lg={6} md={4} xs={12} className=' d-lg-none d-md-none '>
                                    <div className="center-head d-flex justify-content-center">

                                        <span className='text-center fs-4 me-3'>{projectName}</span>
                                        <span className='text-center fs-4'>Lot - {selectedLot}</span>

                                    </div>
                                </Col>
                                <div className="d-flex justify-content-center d-lg-none d-md-none ">
                                    <hr className='w-100 center' />
                                </div>

                                {processName === 'preProQC' ? (
                                    <Col lg={3} md={4} xs={12} className='d-flex justify-content-center'>
                                        <Link to="/quantity-sheet-uploads" className={`${customMid} ${customDarkText} ${customLightBorder} border-3 p1 rounded d-flex align-items-center p-1 text-decoration-none shadow-lg`}>
                                            <span>
                                                Quantity
                                            </span>
                                            <span>
                                                <MdCloudUpload className='ms-2' />
                                            </span>
                                        </Link>
                                    </Col>
                                ) : (
                                    <Col lg={3} md={4} xs={12}>
                                        <div className={` align-items-center flex-column`}>
                                            <div className='text-center fs-5'>Previous Process </div>
                                            <div className={`p-1  fs-6 text-primary border ${customDarkBorder} rounded ms-1 d-flex justify-content-center align-items-center ${customDark === 'dark-dark' ? `${customBtn} text-white` : `${customLight} bg-light`}`} style={{ fontWeight: 900 }}>
                                                {previousProcess ? `${previousProcess.processName} - ${previousProcess.completionPercentage}%` : 'N/A'}
                                                <span className='ms-2'>
                                                    <FaRegHourglassHalf color='blue' size="20" />
                                                </span>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                <div className="d-flex justify-content-center d-lg-none d-md-none ">
                                    <hr className='w-100 center' />
                                </div>
                                <Col lg={6} md={4} xs={12} className='d-none d-lg-block d-md-block'>
                                    <div className="center-head ">

                                        <div className='text-center fs-4'>{projectName}</div>
                                        <div className='text-center fs-4'>Lot - {selectedLot}</div>

                                    </div>
                                </Col>
                                <Col lg={3} md={4} xs={12}>
                                    <div className={`align-items-center flex-column`}>
                                        <div className='text-center fs-5'>Current Process </div>
                                        <div className={`p-1  fs-6 text-primary border ${customDarkBorder} rounded ms-1 d-flex justify-content-center align-items-center ${customDark === 'dark-dark' ? `${customBtn} text-white` : `${customLight} bg-light text-danger`}`} style={{ fontWeight: 900 }}>{processName}
                                            <span className='ms-2'>
                                                <MdPending color='red' size="25" />
                                            </span>
                                        </div>
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
                        <marquee id="alert-marquee" behavior="scroll" direction="left" scrollamount="5" onMouseOver={(e) => e.target.stop()}
                            onMouseOut={(e) => e.target.start()}>
                            <div className="d-flex gap-4">

                                {tableData.map((record, index) => (
                                    <React.Fragment key={index}>
                                        {record.alerts && record.alerts.length > 0 && (
                                            <AlertBadge catchNo={record.catchNumber} alerts={record.alerts} onClick={() => handleCatchClick(record)} status="level1" />

                                        )}
                                    </React.Fragment>
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
            <Row className='mb-2'>

                <Col lg={12} md={12}>
                    <Row>
                        <Col lg={3} md={12} className="pe-0">
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
                                            {selectedLot === lot.lotNo && (
                                                <span className="text-primary">✓</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>
                        <Col lg={9} md={8} className="ps-0">
                            {tableData?.length > 0 && (

                                <ProjectDetailsTable tableData={combinedTableData} setTableData={setTableData} projectId={id} lotNo={selectedLot} featureData={featureData} hasFeaturePermission={hasFeaturePermission} processId={processId} projectLots={projectLots} />
                            )}
                        </Col>
                    </Row>

                </Col>

            </Row>
            <Row className='mb-4 d-flex justify-content-between'>
                <Col lg={8} md={12} className='mb-1'>
                    <Switch
                        checked={showBarChart}
                        onChange={handleToggleChange}
                    />
                    <span className={`ms-2 ${customDarkText}`}>{showBarChart ? 'Show Overall Completion Data' : 'Show Catch Data'}</span>
                </Col>
                {showBarChart ? (
                    <Col lg={12} md={12} sm={12} className='mt-1 d-fle justify-content-center'>
                        <StatusBarChart data={combinedTableData} catchNumbers={catchNumbers} />
                    </Col>
                ) : (
                    <Col lg={12} md={12} sm={12} className='mt-1 d-fle justify-content-center ' >
                        <StatusPieChart data={combinedTableData} />
                    </Col>
                )}
            </Row>
            <CatchDetailModal
                show={catchDetailModalShow}
                handleClose={() => setCatchDetailModalShow(false)}
                data={catchDetailModalData}
            >
                {/* modal content here */}
            </CatchDetailModal>
        </div>
    );
};

export default ProcessTable;