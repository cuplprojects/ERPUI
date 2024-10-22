import React, { useState, useEffect } from 'react';

import { useLocation, useParams } from 'react-router-dom';
import { Card, Spinner, Row, Col } from 'react-bootstrap'; // Import Bootstrap components
import ProjectDetailsTable from './projectDetailTable'; // Import the new component
import dummyData from "../store/dd.json";

import StatusPieChart from "./StatusPieChart";
import StatusBarChart from "./StatusBarChart";
import "./../styles/processTable.css";
import { Switch } from 'antd';
import CatchProgressBar from './catchProgressBar';
import AlertBadge from "./AlertBadge";
import CatchDetailModal from '../menus/CatchDetailModal';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';
import { MdPending } from "react-icons/md";
import { Link } from 'react-router-dom';

import { MdCloudUpload } from "react-icons/md";//upload icon
import { FaRegHourglassHalf } from "react-icons/fa6";//pre process running
import API from '../CustomHooks/MasterApiHooks/api';


const ProcessTable = () => {
    const { getCssClasses } = useStore(themeStore);
    const [
      customDark,
      customMid, 
      customLight,
      customBtn,
      customDarkText,
      customLightText,
      customLightBorder,
      customDarkBorder
    ] = getCssClasses();

    const location = useLocation();

    const { id, lotNo } = useParams();

    const [tableData, setTableData] = useState([]);
    const [showBarChart, setShowBarChart] = useState(true);
    const [catchDetailModalShow, setCatchDetailModalShow] = useState(false);
    const [catchDetailModalData, setCatchDetailModalData] = useState(null);
    const [previousProcessPercentage, setPreviousProcessPercentage] = useState(90);

    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        const fetchQuantitySheet = async () => {
            try {
                const response = await API.get(`/QuantitySheet?ProjectId=${id}&lotNo=${lotNo}`);
                const quantitySheetData = response.data;
                console.log('API response:', quantitySheetData);
                
                if (Array.isArray(quantitySheetData) && quantitySheetData.length > 0) {
                    const formDataGet = quantitySheetData.map((item) => ({
                        srNo: item?.quantitySheetId || "",
                        catchNumber: item?.catchNo,
                        paper: item?.paper || "undefined",
                        course: item?.course,
                        subject: item?.subject,
                        outerEnvelope: item?.outerEnvelope,
                        innerEnvelope: item?.innerEnvelope,
                        lotNo:item?.lotNo,
                        quantity: item?.quantity,
                        percentageCatch: item?.percentageCatch,
                        projectId:item?.projectId,
                        isOverridden: item?.isOverridden,
                        processId: item?.processId || [],
                        status: item?.status ||  "Pending",//to be fetched later from backend
                        alerts: "",//to be fetched later from backend
                        interimQuantity: "0",//to be fetched later from backend
                        remarks: "",//to be fetched later from backend
                        previousProcessStats: "",//to be fetched later from backend
                    }));
                    console.log('Formatted data:', formDataGet);
                    setTableData(formDataGet); // Set the table data only here
                } else {
                    console.error("API response is not an array or is empty");
                    setTableData([]); // Set to empty only if there's no data
                }
            } catch (error) {
                console.error("Error fetching quantity sheet data:", error);
                setTableData([]); // Set to empty on error
            }
        };

        fetchQuantitySheet();
    }, [id, lotNo]);
      
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await API.get(`/Project/${id}`);
                const projectData = response.data;
                console.log(projectData)
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

    // Render a loading state while fetching the project data
    if (!projectName) {

        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading project details...</span>
            </div>
        );
    }

    const handleCatchClick = (record) => {
        console.log('handleCatchClick called', record);
        setCatchDetailModalShow(true);
        setCatchDetailModalData(record);
    };

    const handleLotClick = (lot) => {
        setSelectedLot(lot === selectedLot ? null : lot);
    };

    const catchNumbers = tableData.map((item) => item.catchNumber).sort((a, b) => a - b);

    // console.log(tableData);

    let activeUser, activeUserProcess, currentIndex, currentProcess, previousProcess;



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
                                        <span className='text-center fs-4'>Lot - {lotNo}</span>

                                    </div>
                                </Col>
                                <div className="d-flex justify-content-center d-lg-none d-md-none ">
                                    <hr className='w-100 center' />
                                </div>

                                {activeUserProcess === 'preProQC' ? (
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
                                                {previousProcess} - {previousProcessPercentage}%
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
                                        <div className='text-center fs-4'>Lot - {lotNo}</div>

                                    </div>
                                </Col>
                                <Col lg={3} md={4} xs={12}>
                                    <div className={`align-items-center flex-column`}>
                                        <div className='text-center fs-5'>Current Process </div>
                                        <div className={`p-1  fs-6 text-primary border ${customDarkBorder} rounded ms-1 d-flex justify-content-center align-items-center ${customDark === 'dark-dark' ? `${customBtn} text-white` : `${customLight} bg-light text-danger`}`} style={{ fontWeight: 900 }}>{currentProcess}
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
                    <CatchProgressBar data={filteredTableData} />
                </Col>
            </Row>
            <Row className='mb-2'>

                <Col lg={12} md={12} >
                    {tableData.length > 0 && (
                        <ProjectDetailsTable tableData={tableData} setTableData={setTableData} projectId={id} lotNo={lotNo} />
                        
                    )}
                </Col>
                <Col lg={2} md={0} ></Col>

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
                        <StatusBarChart data={filteredTableData} catchNumbers={catchNumbers} />
                    </Col>
                ) : (
                    <Col lg={12} md={12} sm={12} className='mt-1 d-fle justify-content-center ' >
                        <StatusPieChart data={filteredTableData} />
                    </Col>
                )}
            </Row>
            <CatchDetailModal
                show={catchDetailModalShow}
                handleClose={() => setCatchDetailModalShow(false)}
                data={catchDetailModalData}
            >
            </CatchDetailModal>
        </div>
    );
};

export default ProcessTable;