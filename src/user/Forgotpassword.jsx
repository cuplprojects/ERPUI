import React from 'react';
import './../styles/setpassword.css';
import brain from "./../assets/bgImages/brain.svg";
import Logo1 from "./../assets/Logos/CUPLLogoSetPass.png";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Forgotpassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); 
    toast.success('Password reset email sent!', {
      onClose: () => navigate('/'), // Navigate when the toast closes
      autoClose: 3000, // Optional: Adjust this to control the duration of the toast
    });
  };

  const handleLogin = () => {
    toast.loading('Processing...', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      style: { backgroundColor: '#3362CC', color: 'white' },
    });
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <div className="login-container setp">
      <div className="image-section d-flex align-items-center">
        <img src={brain} alt="Forgot Password Illustration" className="login-image mt-5" />
      </div>
      <div className="panel-section">
        <img src={Logo1} alt="Company Logo" className='comp-logo-1' />
        <div className="card login-card">
          <h3 className="login-title">Forgot Password</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" placeholder="Enter Email" required />
            </div>
            <div className="d-flex justify-content-between">
              <button type="submit" className="btn lext-light w-100 m-1" style={{ background: "#FF725E", color: "white" }}>
                Submit
              </button>
              <button type="button" className="btn lext-light w-100 m-1 custom-theme-dark-btn" onClick={handleLogin}>
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer className="responsive-toast" />
    </div>
  );
};

export default Forgotpassword;
