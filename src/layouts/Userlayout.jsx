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
import QtySheetUpload from '../pages/QtySheetUpload';
import Message from '../pages/Message/Message';
import Labels from '../pages/Message/Labels';

import { hasPermission } from '../CustomHooks/Services/permissionUtils';
import CuDashboard from '../pages/CuDashboard';

import AddProjectProcess from '../pages/AddProjectProcess';

const Userlayout = () => {
  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];

  return (
    <div className={`container-fluid p-0 vh-100  ${customLight}`}>
      <LockOverlay className="lock-button" />
      <CustomUi />
      <div className={`fixed-top w-100 ${customMid}`} style={{ zIndex: "1", height: "350px", borderRadius: "0% 0% 30% 30%" }}></div>
      <Row className="g-0 h-100">
        <Col xs={12} md={12} lg={12} className={`d-flex flex-column ${customLight}`}>
          <div className="top-nav sticky-top" style={{ zIndex: "9" }}>
            <Navbar />
          </div>
          <div className={`flex-grow-1 d-fle m-2 p-3 `} style={{ zIndex: "3" }}>
            <Routes>
              {hasPermission('5') && <Route path="/cudashboard" element={<CuDashboard/>} />}
              {hasPermission('1') && <Route path="/dashboard" element={<MainDashboard />} />}
              {hasPermission('2') && <Route path="/master" element={<Masters />} />}
              {hasPermission('2.4') && <Route path="/AddProjectProcess/:projectId" element={<AddProjectProcess />} />}
              {hasPermission('2') && <Route path="/features" element={<Features />} />}

              {/* --------------- User Menu Routes -------------- */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/change-password" element={<ChangePassword />} />



              {(hasPermission('2.4') ) && <Route path="/quantity-sheet-uploads/:projectId" element={<QtySheetUpload />} />}
              {(hasPermission('2.4')) && <Route path="/project-details/:id" element={<ProcessTable />} />}
              {(hasPermission('3') ) && <Route path="/message" element={<Message />} />}
              {(hasPermission('3')) && <Route path="/labels" element={<Labels />} />}


              <Route path="/*" element={<PageNotFound />} />
            </Routes>
          </div>
          <div className={`${customDark === 'dark-dark' ? "d-none" : ""} fixed-bottom w-100 border ${customMid}`} style={{ zIndex: "1", height: "150px", borderRadius: "20%  ", borderStyle: "wavy" }}></div>
          <Footer className="sticky-bottom " style={{ zIndex: "1" }} />
        </Col>
      </Row>
    </div>
  );
};

export default Userlayout;
