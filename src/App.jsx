import React from 'react';
import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import './App.css';
import Login from './user/Login';
import Setpassword from './user/Setpassword';
import Forgotpassword from './user/Forgotpassword';
import Userlayout from './layouts/Userlayout';
import './styles/customStyles.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';


function App() {
  return (
    <>
      <HashRouter className="">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/setpassword" element={<Setpassword />} />
            <Route path="/forgotpassword" element={<Forgotpassword />} />
            <Route path="/*" element={<Userlayout />} />
          </Routes>
      </HashRouter >
    </>
  );
}

export default App;
