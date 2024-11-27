import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './../components/Navbar';
import MainDashboard from './../pages/MainDashboard';
import Footer from '../components/Footer';
import Masters from './../pages/Masters';
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
import Labels from '../pages/Message/Message';
import Reports from '../pages/Reports';
import CuDashboard from '../pages/CuDashboard';
import AddProjectProcess from '../pages/ProjectMaster/Tabs/AddProjectProcess';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

const Userlayout = () => {
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];

  const renderProtectedRoute = (permission, Component) => {
    return hasPermission(permission) ? <Component /> : <Navigate to="/login" replace />;
  };

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
              <Route path="/cudashboard" element={renderProtectedRoute("5", CuDashboard)} />
              <Route path="/dashboard/:encryptedProjectId" element={renderProtectedRoute("1", MainDashboard)} />
              <Route path="/master" element={renderProtectedRoute("2", Masters)} />
              <Route path="/AddProjectProcess/:projectId" element={renderProtectedRoute("2.4", AddProjectProcess)} />

              {/* --------------- User Menu Routes -------------- */}
              <Route path="/profile" element={renderProtectedRoute("3", Profile)} />
              <Route path="/settings" element={renderProtectedRoute("3", UserSettings)} />
              <Route path="/change-password" element={renderProtectedRoute("3", ChangePassword)} />

              <Route path="/quantity-sheet-uploads/:encryptedProjectId" element={renderProtectedRoute("2.4", QtySheetUpload)} />
              <Route path="/project-details/:encryptedProjectId/:encryptedLotNo" element={<ProcessTable />} />
              <Route path="/labels" element={renderProtectedRoute("3", Labels)} />
              <Route path="/reports" element={renderProtectedRoute("3", Reports)} />

              <Route path="/*" element={<Navigate to="/404" replace />} />
              <Route path="/404" element={<PageNotFound />} />
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
