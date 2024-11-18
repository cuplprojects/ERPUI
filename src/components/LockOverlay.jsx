import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaLock } from 'react-icons/fa';
import { Form } from 'react-bootstrap';
import './../styles/lockOverlay.css';
import { ToastContainer } from 'react-toastify';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';

const LockOverlay = () => {
    const { t } = useTranslation();
    const { getCssClasses } = useStore(themeStore);
    const [
        customDark,
        customMid, 
        customLight,
        customBtn,
        customDarkText,
        customLightText,
        customLightBorder,
        customDarkBorder,
        customThead
    ] = getCssClasses();

    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const timerRef = useRef(null);
    const inputRef = useRef(null);
    const [isLocked, setIsLocked] = useState(() => {
        return JSON.parse(localStorage.getItem('isLocked') || 'false');
    });

    useEffect(() => {
        localStorage.setItem('isLocked', JSON.stringify(isLocked));
    }, [isLocked]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        // Set timer for 2 minutes (120000 ms)
        timerRef.current = setTimeout(() => {
            setIsLocked(true);
            setShowModal(false);
        }, 300000);
    }, []);

    const handleLock = useCallback(() => {
        setIsLocked(true);
        setShowModal(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const handleUnlock = useCallback(() => {
        setShowModal(true);
        // Focus input after a short delay to ensure the input is rendered
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    }, []);

    const handleSubmit = useCallback(() => {
        if (password === '123') {
            setIsLocked(false);
            setShowModal(false);
            setPassword('');
            resetTimer();
        }
    }, [password, resetTimer]);

    useEffect(() => {
        resetTimer();
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        const handleActivity = () => {
            if (!isLocked) {
                resetTimer();
            }
        };
        events.forEach(event => window.addEventListener(event, handleActivity));
        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [resetTimer, isLocked]);

    useEffect(() => {
        if (password) handleSubmit();
    }, [password, handleSubmit]);

    return (
        <>
            <ToastContainer />
            {isLocked && (
                <div className="lock-overlay" style={{ zIndex: "9999999999999" }}>
                    {showModal ? (
                        <Form onSubmit={handleSubmit} className={`rounded-circle border p-2 pt-4 ${customDark}`}
                            style={{ height: "250px", width: "250px" }}>
                            <Form.Group controlId="formBasicPassword" className='d-flex flex-column justify-content-center align-items-center'>
                                <FaLock size={100} color="white" className={customLightText} />
                                <Form.Label className='text-light text-center mt-1'>{t('enterYourUnlockKey')}</Form.Label>
                                <Form.Control
                                    ref={inputRef}
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder={t('enterUnlockKey')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='rounded-bottom-5'
                                    style={{ width: "200px", textAlign: "center" }}
                                />
                            </Form.Group>
                        </Form>
                    ) : (
                        <button className="unlock-button" onClick={handleUnlock}>
                            <FaLock size={100} color="white" />
                        </button>
                    )}
                </div>
            )}
            <button className={`unlock-button manual-unlock-btn ${customBtn} border p-1 ms-1 rounded`} onClick={handleLock}>
                <FaLock size={30} color="white" />
            </button>
        </>
    );
};

export default LockOverlay;
