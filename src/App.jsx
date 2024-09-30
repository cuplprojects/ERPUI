import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './user/Login';
import Setpassword from './user/Setpassword';
import Forgotpassword from './user/Forgotpassword';
import Userlayout from './layouts/Userlayout';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/customStyles.css';
import 'react-toastify/dist/ReactToastify.css';
// import { TouchProvider } from './menus/TouchContext';
// import 'tailwindcss/base';
// import 'tailwindcss/components';
// import 'tailwindcss/utilities';
import './index.css';


function App() {
  return (
    <>
      <Router className="">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/setpassword" element={<Setpassword />} />
            <Route path="/forgotpassword" element={<Forgotpassword />} />
            <Route path="/*" element={<Userlayout />} />
          </Routes>
      </Router>
    </>
  );
}

export default App;
