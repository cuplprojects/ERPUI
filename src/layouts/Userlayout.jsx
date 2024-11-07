import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './../components/Navbar';
import MainDashboard from './../pages/MainDashboard';
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
import Reports from '../pages/Reports';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';
import CuDashboard from '../pages/CuDashboard';
import SecurityQuestions from '../pages/SecurityQuestions';

import AddProjectProcess from '../pages/AddProjectProcess';
import Test from '../pages/Test';
import ProtectedRoute from '../Security/ProtectedRoute';
import AssignTeams from '../pages/processPage/AssignTeam/AssignTeams';

const Userlayout = () => {
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

              <Route path="/" element={<Navigate to="/cudashboard" replace />} />
              <Route path="/cudashboard" element={<ProtectedRoute component={CuDashboard} permission="5"/>} />
              <Route path="/dashboard/:encryptedProjectId" element={<ProtectedRoute component={MainDashboard} permission="1"/>} />
              <Route path="/master" element={<ProtectedRoute component={Masters} permission="2"/>} />
              <Route path="/AddProjectProcess/:projectId" element={<ProtectedRoute component={AddProjectProcess} permission="2.4"/>} />
              <Route path="/features" element={<ProtectedRoute component={Features} permission="2"/>} />


              {/* --------------- User Menu Routes -------------- */}
              <Route path="/profile" element={<ProtectedRoute component={Profile} permission="3"/>} />
              <Route path="/settings" element={<ProtectedRoute component={UserSettings} permission="3"/>} />
              <Route path="/change-password" element={<ProtectedRoute component={ChangePassword} permission="3"/>} />

              <Route path="/test" element={<ProtectedRoute component={AssignTeams} permission="3"/>} />

              <Route path="/quantity-sheet-uploads/:encryptedProjectId" element={<ProtectedRoute component={QtySheetUpload} permission="2.4"/>} />
              <Route path="/project-details/:encryptedProjectId/:encryptedLotNo" element={<ProtectedRoute component={ProcessTable} permission="2.4"/>} />
              <Route path="/message" element={<ProtectedRoute component={Message} permission="3"/>} />
              <Route path="/labels" element={<ProtectedRoute component={Labels} permission="3"/>} />
              <Route path="/reports" element={<ProtectedRoute component={Reports} permission="3"/>} />

              <Route path="/*" element={<Navigate to="/404" replace />} />
              <Route path="/404" element={<ProtectedRoute component={PageNotFound} permission="*" />} />
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
