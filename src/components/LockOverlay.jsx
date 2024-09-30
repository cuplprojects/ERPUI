import React, { useState, useEffect, useRef } from 'react';
import { FaLock } from 'react-icons/fa';
import { Button, Form } from 'react-bootstrap';
import './../styles/lockOverlay.css';
import { toast, ToastContainer } from 'react-toastify';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
const LockOverlay = () => {

    //Theme Change Section
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const customDark = cssClasses[0];
    const customMid = cssClasses[1];
    const customLight = cssClasses[2];
    const customBtn = cssClasses[3];
    const customDarkText = cssClasses[4]
    const customLightText = cssClasses[5]

    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const timerRef = useRef(null);
    const [isLocked, setIsLocked] = useState(() => {
        const storedLockState = localStorage.getItem('isLocked');
        return storedLockState ? JSON.parse(storedLockState) : false;
    });
    useEffect(() => {
        localStorage.setItem('isLocked', JSON.stringify(isLocked));
    }, [isLocked]);
    const resetTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => setIsLocked(true), 12000000); //Set To 3 Hrs for dev period only
    };
    const handleLock = () => {
        setIsLocked(true);
    };
    const handleUnlock = () => {
        setShowModal(true);
    };
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };
    const handleSubmit = () => {
        // e.preventDefault();
        if (password === '123') {
            setIsLocked(false);
            setShowModal(false);
            setPassword('');
            resetTimer();
        } 
        else {
            // alert('Incorrect password')
            console.log("Incorrect Password")
        }
    };

    useEffect(() => {
        resetTimer();

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        const handleActivity = () => resetTimer();

        events.forEach((event) => window.addEventListener(event, handleActivity));

        return () => {
            events.forEach((event) => window.removeEventListener(event, handleActivity));
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    useEffect(()=>{
        if(password){
            handleSubmit();
        }
    },[password])

    return (
        <>
            <ToastContainer />
            {isLocked && (
                <div className="lock-overlay" style={{ zIndex: "9999999999999" }}>
                    {
                        showModal ? (

                            <Form onSubmit={handleSubmit} className={`rounded-circle  border p-2 pt-4 ${customDark}`}
                                style={{ height: "250px", width: "250px" }}>
                                <Form.Group controlId="formBasicPassword" className='d-flex flex-column justify-content-center align-items-center'>
                                <FaLock size={100} color="white" className={`${customLightText}`} style={{}}/>
                                    <span>
                                        <Form.Label className='text-light text-center mt-1'>Enter Your Unlock Key</Form.Label>
                                    </span>
                                    <span>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter Unlock Key"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            className='rounded-bottom-5'
                                            style={{ width: "200px" ,textAlign:"center"}}
                                        />
                                    </span>
                                </Form.Group>
                                <div className="d-flex justify-content-center">
                                    {/* <Button variant="primary" type="submit" className={` mt-2 rounded-bottom-5 ${customDarkText} ${customLight} border-light`}>
                                        Unlock
                                    </Button> */}
                                    {/* <Button variant="danger" onClick={() => setPassword('')} className="mt-3">
                                        Reset
                                    </Button> */}
                                </div>
                            </Form>
                        ) : (
                            <button className="unlock-button" onClick={handleUnlock}>
                                <FaLock size={100} color="white" />
                            </button>
                        )
                    }
                </div>
            )}
            <button className={`unlock-button manual-unlock-btn ${customBtn} border p-1 ms-1 rounded `} onClick={handleLock}>
                <FaLock size={30} color="white" />
            </button>
        </>
    );
};

export default LockOverlay;
