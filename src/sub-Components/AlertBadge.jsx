import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaCircleCheck } from "react-icons/fa6";
import { Row, Col } from 'react-bootstrap';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';

const AlertBadge = ({ catchNo, alerts, onClick, status }) => {

    //Theme Change Section
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const customDark = cssClasses[0];
    const customMid = cssClasses[1];
    const customLight = cssClasses[2];
    const customBtn = cssClasses[3];
    const customDarkText = cssClasses[4];
    const customLightText = cssClasses[5]
    const customLightBorder = cssClasses[6]
    const customDarkBorder = cssClasses[7]

    const [visible, setVisible] = useState(true);
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    const handleClose = (e) => {
        e.stopPropagation();
        setVisible(false);
    };

    if (!visible) return null;

    const getBadgeStyles = () => {
        switch (status) {
            case 'level1-':
                return 'bg-danger text-white';
            case 'level2-':
                return 'bg-warning text-dark';
            default:
                return 'bg-white text-dark';
            // return '';
        }
    };
    const tickStyle = {
        textDecoration: 'none' // Removes underline
    };
    return (
        <Row>
            <div
                className={`badge c-pointer d-flex align-items-center  p-2 me-2 ${getBadgeStyles()}`}
                onClick={onClick}
                style={{ width: "auto", background: "", border: "2px solid #FFD964" }}
            >
                <Col lg={10} md={10} xs={10}>
                    <span className={`fs-5 ${customDarkText}`}>
                        Catch : {catchNo}
                    </span>
                    <span className={`fs-5 ms-2 ${customDarkText}`}>
                        ({alerts})
                    </span>
                </Col>
                {activeUser && activeUser.userId === 'admin' && (
                    <Col lg={2} md={2} xs={2}>
                        <Button
                            variant="link"
                            className="ms- p-0"
                            onClick={handleClose}
                            style={{ color: "inherit" }}
                        >
                            <span className='bg-white rounded-circle p-1 d-flex justify-content-start  align-items-center ms-3'>
                                <FaCircleCheck size={25} color='green' />
                            </span>
                        </Button>
                    </Col>
                )}
            </div>
        </Row>
    );
};

export default AlertBadge;