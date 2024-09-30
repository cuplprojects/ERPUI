import React from 'react';
import './../styles/Login.css';
import BlueTheme from './../assets/bgImages/Factory.svg';
import PurpleTheme from './../assets/bgImages/FactoryPurple.png';
import DefaultTheme from './../assets/bgImages/FactoryDefault.png';
import GreenTheme from './../assets/bgImages/FactoryGreen.png';
import RedTheme from './../assets/bgImages/FactoryRed.png';
import DarkTheme from './../assets/bgImages/FactoryDark.png';
import BrownTheme from './../assets/bgImages/FactoryBrown.png';
import PinkTheme from './../assets/bgImages/FactoryPink.png';
import LightTheme from './../assets/bgImages/FactoryLight.png';
import Logo1 from './../assets/Logos/CUPLLogoTheme.png';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import 'react-toastify/dist/ReactToastify.css';
import { validateLogin } from './../scripts/loginValidations.js';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';

const Login = () => {

  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];

  //hard coded users
  const users = {
    user1: { userId: 'admin', password: '12345678' },
    user2: { userId: 'mss', password: '12345678' },
    user3: { userId: 'dtp', password: '12345678' },
    user4: { userId: 'prooReading', password: '12345678' },
    user5: { userId: 'prodTrans', password: '12345678' },
    user6: { userId: 'preProQC', password: '12345678' },
    user7: { userId: 'ctp', password: '12345678' },
    user8: { userId: 'printing', password: '12345678' },
    user9: { userId: 'cutting', password: '12345678' },
    user10: { userId: 'mixing', password: '12345678' },
    user11: { userId: 'numbering', password: '12345678' },
    user12: { userId: 'envelope', password: '12345678' },
    user13: { userId: 'filling', password: '12345678' },
    user14: { userId: 'finalQC', password: '12345678' },
    user15: { userId: 'bundling', password: '12345678' },
    user16: { userId: 'dispatch', password: '12345678' },
  };

  localStorage.setItem('users', JSON.stringify(users));

  const navigate = useNavigate();

  const handleSubmit = (values) => {
    const { userId, password } = values;

    // Validate input fields
    const isValid = validateLogin(userId, password);
    if (!isValid) return;

    const activeUser = { userId, password };
    localStorage.setItem('activeUser', JSON.stringify(activeUser));
    localStorage.removeItem('users');

    // Show loading toast and navigate
    toast.loading('Processing...', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      style: { backgroundColor: '#3362CC', color: 'white' },
    });

    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleForgotPassword = () => {
    toast.loading('Processing...', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      style: { backgroundColor: '#3362CC', color: 'white' },
    });

    setTimeout(() => {
      navigate('/forgotpassword');
    }, 2000);
  };

  return (
    <div className="login-container">
      <div className="image-section">
        {/* Images Based on Theme */}
        {customDark === "purple-dark" ? (<img src={PurpleTheme} alt="Purple Theme" className='login-image' />)
        : customDark === "blue-dark" ? (<img src={BlueTheme} alt="Blue Theme" className='login-image' />):
          customDark === "green-dark" ? (<img src={GreenTheme} alt="Green Theme" className='login-image' />):
          customDark === "red-dark" ? (<img src={RedTheme} alt="Red Theme" className='login-image' />):
          customDark === "dark-dark" ? (<img src={DarkTheme} alt="Dark Theme" className='login-image' />):
          customDark === "light-dark" ? (<img src={LightTheme} alt="Light Theme" className='login-image' />):
          customDark === "pink-dark" ? (<img src={PinkTheme} alt="Pink Theme" className='login-image' />):
          customDark === "brown-dark" ? (<img src={BrownTheme} alt="Brown Theme" className='login-image' />):
          (<img src={DefaultTheme} alt="Default Theme" className='login-image' />)}
      </div>
      <div className={`panel-section custom-theme-dark-bg ${customDark}`}>
        <img src={Logo1} alt="company-logo" className="comp-logo-1" />
        <div className="card login-card">
          <h3 className={`login-title custom-theme-dark-text ${customDarkText}`}>Login | ApexERP</h3>
          {/* <h3 className="login-title custom-theme-dark-text"> <AnimatedText/> </h3> */}
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            className="login-form"
          >
            <Form.Item
              className={`fw-bold  ${customDarkText}`}
              label={<span>User Id <span style={{ color: 'red' }}>*</span></span>}
              name="userId"
              rules={[{ message: 'Please input your User Id!' }]}
            >
              <Input
                placeholder="User Id"
                style={{ height: '45px' }}  // Adjusted height for User Id input
              />
            </Form.Item>

            <Form.Item
              label={<span>Password <span style={{ color: 'red' }}>*</span></span>}
              name="password"
              rules={[{ message: 'Please input your Password!' }]}
              className={`fw-bold  ${customDarkText}`}
            >
              <Input.Password
                placeholder="Password"
                style={{ height: '45px' }}  // Adjusted height for Password input
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <div className="d-flex justify-content-between">
              <Button
                className={`w-50 m-1 ${customBtn}`}
                onClick={handleForgotPassword}
              >
                Forgot Password
              </Button>
              <Button htmlType="submit" className={`w-50 m-1 ${customBtn}`}>
                Login
              </Button>
            </div>
          </Form>
        </div>
        <ToastContainer className="responsive-toast" />
      </div>
    </div>
  );
};

export default Login;
