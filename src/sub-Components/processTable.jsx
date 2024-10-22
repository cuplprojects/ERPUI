import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Spinner, Row, Col, ListGroup } from 'react-bootstrap';
import ProjectDetailsTable from './projectDetailTable';
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
import { MdCloudUpload } from "react-icons/md";
import { FaRegHourglassHalf } from "react-icons/fa6";
import axios from 'axios';

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
    const { project } = location.state || {};
    const [tableData, setTableData] = useState([]);
    const [showBarChart, setShowBarChart] = useState(true);
    const [catchDetailModalShow, setCatchDetailModalShow] = useState(false);
    const [catchDetailModalData, setCatchDetailModalData] = useState(null);
    const [previousProcessPercentage, setPreviousProcessPercentage] = useState(90);
    const [selectedLot, setSelectedLot] = useState(null);
    const [filteredTableData, setFilteredTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://localhost:7212/api/QuantitySheet?ProjectId=${project.id}&lotNo=${project.lotNumber}`);
                setTableData(response.data);
                setFilteredTableData(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        if (project && project.id && project.lotNumber) {
            fetchData();
        }
    }, [project]);

    useEffect(() => {
        if (selectedLot) {
            setFilteredTableData(tableData.filter(item => item.catchNumber === selectedLot));
        } else {
            setFilteredTableData(tableData);
        }
    }, [selectedLot, tableData]);

    
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
        console.log('handleCatchClick called', record);
        setCatchDetailModalShow(true);
        setCatchDetailModalData(record);
    };

    const handleLotClick = (lot) => {
        setSelectedLot(lot === selectedLot ? null : lot);
    };

    const catchNumbers = tableData.map((item) => item.catchNumber).sort((a, b) => a - b);

    const processList = [
        { admin: "HQ" },
        { mss: "MSS" },
        { dtp: "DTP" },
        { prooReading: "Proo Reading" },
        { prodTrans: "Production Transfer" },
        { preProQC: "QC" },
        { ctp: "CTP" },
        { printing: "Printing" },
        { cutting: "Cutting" },
        { mixing: "Mixing" },
        { numbering: "Numbering" },
        { envelope: "Envelope" },
        { filling: "Filling" },
        { finalQC: "Final QC" },
        { bundling: "Bundling" },
        { dispatch: "Dispatch" }
    ];
    let activeUser, activeUserProcess, currentIndex, currentProcess, previousProcess;

    try {
        activeUser = JSON.parse(localStorage.getItem('activeUser'));
        if (activeUser && activeUser.userId) {
            activeUserProcess = activeUser.userId;
            currentIndex = processList.findIndex(obj => Object.keys(obj)[0] === activeUserProcess);
            if (currentIndex !== -1) {
                currentProcess = processList[currentIndex][activeUserProcess];
                if (currentIndex > 0) {
                    const previousProcessKey = Object.keys(processList[currentIndex - 1])[0];
                    previousProcess = processList[currentIndex - 1][previousProcessKey];
                }
            }
        }
    } catch (error) {
        console.error('Error parsing activeUser from localStorage:', error);
    }

    return (
        <div className="container-fluid" >
            <Row className="mb-  ">
                <Col lg={12} md={12} xs={12} className=''>
                    <Card className="shadow-sm ">
                        <Card.Header as="h3" className={`${customDark === 'dark-dark' ? `${customDark} text-white` : `${customDark} text-white`}  `}>
                            <Row className='d-flex align-items-center'>
                                <Col lg={6} md={4} xs={12} className=' d-lg-none d-md-none '>
                                    <div className="center-head d-flex justify-content-center">
                                        <span className='text-center fs-4 me-3'>{project.label}</span>
                                        <span className='text-center fs-4'>Lot - {selectedLot || project.lotNumber}</span>
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
                                        <div className='text-center fs-4'>{project.label} </div>
                                        <div className='text-center fs-4'>Lot - {selectedLot || project.lotNumber}</div>
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
                                {filteredTableData.map((record, index) => (
                                    <>
                                        {record.alerts && record.alerts.length > 0 && (
                                            <AlertBadge key={index} catchNo={record.catchNumber} alerts={record.alerts} onClick={() => handleCatchClick(record)} status="level1" />
                                        )}
                                    </>
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
                <Col lg={4} md={12}>
                    <h4 className={`${customDark} text-white p-2`}>Project Lots</h4>
                    <div className="d-flex flex-column align-items-center" style={{ width: '100%' }}>
                        {tableData.map((item, index) => (
                            <div
                                key={index}
                                className={`mb-2 p-3 rounded-3 ${customLight} ${customDarkText} ${selectedLot === item.catchNumber ? 'border border-primary shadow-lg' : 'border'}`}
                                onClick={() => handleLotClick(item.catchNumber)}
                                style={{ 
                                    cursor: 'pointer', 
                                    transition: 'all 0.3s',
                                    transform: selectedLot === item.catchNumber ? 'scale(1.05)' : 'scale(1)',
                                    width: '35%',
                                    backgroundColor: selectedLot === item.catchNumber ? '#e6f7ff' : 'inherit'
                                }}
                            >
                                <h5 className={`mb-0 ${selectedLot === item.catchNumber ? 'fw-bold text-primary' : ''}`}>Lot {item.catchNumber}</h5>
                            </div>
                        ))}
                    </div>
                </Col>
                <Col lg={8} md={12}>
                    <ProjectDetailsTable tableData={selectedLot ? filteredTableData : tableData} setTableData={setTableData} selectedLot={selectedLot} />
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