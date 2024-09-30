import React from 'react';
import './../styles/setpassword.css';
import svgImg from "./../assets/bgImages/Factory-pana.svg";
import Logo1 from "./../assets/Logos/CUPLLogoLogin.png";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Form, Input, Button } from 'antd';
import 'antd/dist/reset.css'; // Ensure Ant Design styles are included

const Setpassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    const changingPasswordToastId = toast.loading('Changing Password...', {
      position: "top-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      draggable: true,
      style: { backgroundColor: '#EDC568', color: 'white' },
    });

    setTimeout(() => {
      toast.update(changingPasswordToastId, {
        render: 'Password Changed',
        type: 'success',
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        draggable: true,
        icon: <i className="fas fa-check" style={{ color: 'white' }}></i>,
        style: { backgroundColor: '#28a745', color: 'white' },
      });

      setTimeout(() => {
        toast.loading('Logging in...', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          style: { backgroundColor: '#3362CC', color: 'white' },
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="login-container setp">
      <div className="image-section">
        <img src={svgImg} alt="Login Illustration" className="login-image" />
      </div>
      <div className="panel-section custom-theme-dark-bg">
        <img src={Logo1} alt="company-logo" className='comp-logo-1' />
        <div className="card login-card">
          <h3 className="login-title">Set New Password</h3>
          <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password placeholder="Current Password" style={{ height: 45 }} />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[{ required: true, message: 'Please input your new password!' }]}
            >
              <Input.Password placeholder="New Password" style={{ height: 45 }} />
            </Form.Item>
            <Form.Item
              name="confirmNewPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm New Password" style={{ height: 45 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ background: "#FF725E", borderColor: "#FF725E", color: "white" }} className="w-100">
                Set Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <ToastContainer className="responsive-toast" />
    </div>
  );
};

export default Setpassword;
