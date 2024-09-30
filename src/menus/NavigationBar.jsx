// import React from 'react';
// import { RiDashboard2Line } from "react-icons/ri";
// import { FaUsersCog } from "react-icons/fa";
// import { SiMastercard } from "react-icons/si";
// import { MdFeaturedPlayList } from "react-icons/md";
// import { Link } from 'react-router-dom';
// import { CgTemplate } from "react-icons/cg";
// import themeStore from './../store/themeStore';
// import { useStore } from 'zustand';
// const NavigationBar = ({ onLinkClick }) => {

//   //Theme Change Section
//   const { getCssClasses } = useStore(themeStore);
//   const cssClasses = getCssClasses();
//   const customDark = cssClasses[0];
//   const customMid = cssClasses[1];
//   const customLight = cssClasses[2];
//   const customBtn = cssClasses[3];
//   const customDarkText = cssClasses[4];


//   const activeUser = JSON.parse(localStorage.getItem('activeUser'));
//   console.log(activeUser)
//   const userId = activeUser && activeUser.userId;
//   console.log(userId + " this is user id")
//   return (
//     <div
//       className={`border-5 ${customDark} w-50`}
//       style={{
//         height: 'auto',
//         minHeight: '130%',
//         padding: '1rem',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         overflow: 'auto',
//       }}
//     >
//       <div
//         className="d-grid gap-4"
//         style={{
//           gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
//           width: '100%',
//           maxWidth: '700px',
//         }}
//       >
//         <Link to="/dashboard" className="text-center text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
//           <RiDashboard2Line style={{ width: "40%", height: "40%" }} />
//           <div>Dashboard</div>
//         </Link>
//         {/* <Link to="/user-management" className="text-center text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
//               <FaUsersCog style={{ width: "40%", height: "40%" }} />
//               <div>User Management</div>
//             </Link> */}
//         <Link to="/master" className="text-center text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
//           <SiMastercard style={{ width: "40%", height: "40%" }} />
//           <div>Master Management</div>
//         </Link>
//         <Link to="/features" className="text-center text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
//           <MdFeaturedPlayList style={{ width: "40%", height: "40%" }} />
//           <div>Features</div>
//         </Link>
//         <Link to="/ctp" className="text-center text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
//           <CgTemplate style={{ width: "40%", height: "40%" }} />
//           <div>CTP</div>
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default NavigationBar;

import React from 'react';
import { RiDashboard2Line } from "react-icons/ri";
import { SiMastercard } from "react-icons/si";
import { MdFeaturedPlayList } from "react-icons/md";
import { Link } from 'react-router-dom';
import { CgTemplate } from "react-icons/cg";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { Container, Row, Col } from 'react-bootstrap';

const NavigationBar = ({ onLinkClick }) => {
  // Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];

  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const userId = activeUser && activeUser.userId;

  return (
    <Container
      className={` ${customDark}`}
      style={{
        height: 'auto',
        minHeight: '130%',
        padding: '1rem',
      }}
    >
      <Row className="justify-content-center">
        <Col xs={6} sm={4} md={3} className="text-center mb-4">
          <Link to="/dashboard" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
            <RiDashboard2Line style={{ width: "40%", height: "40%" }} />
            <div>Dashboard</div>
          </Link>
        </Col>

        <Col xs={6} sm={4} md={3} className="text-center mb-4">
          <Link to="/master" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
            <SiMastercard style={{ width: "40%", height: "40%" }} />
            <div className='text-center'>Master Management</div>
          </Link>
        </Col>
        <Col xs={6} sm={4} md={3} className="text-center mb-4">
          <Link to="/features" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
            <MdFeaturedPlayList style={{ width: "40%", height: "40%" }} />
            <div>Features</div>
          </Link>
        </Col>
        <Col xs={6} sm={4} md={3} className="text-center mb-4">
          <Link to="/ctp" className="text-white text-decoration-none custom-zoom-btn" onClick={onLinkClick}>
            <CgTemplate style={{ width: "40%", height: "40%" }} />
            <div>CTP</div>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NavigationBar;
