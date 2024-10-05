import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Navbar from './../components/Navbar';
import MainDashboard from './../pages/MainDashboard';
import { Routes, Route } from 'react-router-dom';
import Footer from '../components/Footer';
import Masters from './../pages/Masters';
import Features from './../pages/Features'
import PageNotFound from '../pages/PageNotFound';
import Profile from './../user/Profile'
import ChangePassword from './../user/ChangePassword'
import UserSettings from './../user/UserSettings'
import CustomUi from './../menus/CustomUi';
import LockOverlay from './../components/LockOverlay';
import ProcessTable from './../sub-Components/processTable';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import WavyDiv from './WavyDiv';
import QtySheetUpload from '../pages/QtySheetUpload';
import Message from '../pages/Message/Message';
const Userlayout = () => {
  
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
  return (
    <div className={`container-fluid p-0 vh-100  ${customLight}`}>
      <LockOverlay className="lock-button" />
      <CustomUi />
      <div className={`fixed-top w-100 ${customMid}`} style={{ zIndex: "1", height: "350px", borderRadius: "0% 0% 30% 30%" }}></div>
      <Row className="g-0 h-100">
        <Col xs={12} md={12} lg={12} className={`d-flex flex-column ${customLight}`}>
          <div className="top-nav sticky-to" style={{ zIndex: "9" }}>
            <Navbar />
          </div>
          <div className={`flex-grow-1 d-fle m-2 p-3 `} style={{ zIndex: "2" }}>
            <Routes>
              <Route path="/dashboard" element={<MainDashboard />} />
              <Route path="/master" element={<Masters />} />
              <Route path="/features" element={<Features />} />
              {/* --------------- User Menu Routes -------------- */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/quantity-sheet-uploads" element={<QtySheetUpload />} />
              <Route path="/project-details/:id" element={<ProcessTable />} />
              <Route path="/message" element={<Message />} />
              <Route path="/*" element={<PageNotFound />} />
            </Routes>
          </div>
          <div className={`${customDark==='dark-dark'?"d-none":""} fixed-bottom w-100 border ${customMid}`} style={{ zIndex: "1", height: "150px", borderRadius: "20%  ",borderStyle:"wavy" }}></div>
          <Footer className="sticky-bottom " style={{zIndex:"1"}}/>
        </Col>
      </Row>

    </div>
  );
};

export default Userlayout;
