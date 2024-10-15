import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  HashRouter,
} from "react-router-dom";
import "./App.css";
import Login from "./user/Login";
import Setpassword from "./user/Setpassword";
import Forgotpassword from "./user/Forgotpassword";
import Userlayout from "./layouts/Userlayout";
import "./styles/customStyles.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import useLanguageStore from "./store/languageStore";
import ErrorPage from "./pages/ErrorPage";
import "./styles/AgGrid.css"

function App() {
  const { initializeLanguage } = useLanguageStore();

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);
  return (
    <>
      <HashRouter className="">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/setpassword" element={<Setpassword />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/server-error" element={<ErrorPage />} />
          <Route path="/*" element={<Userlayout />} />
        </Routes>
      </HashRouter>
    </>
  );
}

export default App;
