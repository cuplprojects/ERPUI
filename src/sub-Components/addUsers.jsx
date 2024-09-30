import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Form, Input, Button, Row, Col, Select } from 'antd';
import { toast } from 'react-toastify'; // Toast for notifications
import 'react-toastify/dist/ReactToastify.css';
import { validateFormData } from './../scripts/addUsersValidations'; 

const { Option } = Select;

const AddUsers = () => {
  const [form] = Form.useForm();
    
  // Function to handle form submission
  const handleSubmit = (values) => {
    const { errors, success } = validateFormData(values); // Validate the form data

    // Clear previous notifications
    toast.dismiss();

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error)); // Display errors using toast
    } else {
      toast.success('User added successfully!');
      console.log(success); // Log success data
      // You can store the data or send it to a backend here
    }
  };

  // Function to handle form reset
  const handleReset = () => {
    form.resetFields();
  };

  // Function to handle mobile number input
  const handleMobileNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    form.setFieldsValue({ mobileNumber: value });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h4>Add Users</h4>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* First Row: First Name, Middle Name, Last Name */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="firstName"
              label="First Name :"
              rules={[{ required: true, message: 'First name is required' }]}
              style={{ fontSize: '16px' }}
            >
              <Input
                placeholder="Enter first name"
                style={{ height: '45px', fontSize: '16px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="middleName" label="Middle Name :" style={{ fontSize: '16px' }}>
              <Input
                placeholder="Enter middle name"
                style={{ height: '45px', fontSize: '16px' }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item name="lastName" label="Last Name :" style={{ fontSize: '16px' }}>
              <Input
                placeholder="Enter last name"
                style={{ height: '45px', fontSize: '16px' }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Second Row: Mobile Number and Email Address */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="mobileNumber"
              label="Mobile Number :"
              rules={[
                { required: true, message: 'Mobile number is required' },
                { pattern: /^[0-9]{10}$/, message: 'Mobile number must be 10 digits and contain only numbers' }
              ]}
              style={{ fontSize: '16px' }}
            >
              <Input
                placeholder="Enter mobile number"
                style={{ height: '45px', fontSize: '16px' }}
                onChange={handleMobileNumberChange} // Handle input change
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email Address :"
              rules={[
                { required: true, message: 'Email address is required' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              style={{ fontSize: '16px' }}
            >
              <Input
                placeholder="Enter email address"
                style={{ height: '45px', fontSize: '16px' }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Third Row: Role and Department */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="role"
              label="Role :"
              rules={[{ required: true, message: 'Role is required' }]}
              style={{ fontSize: '16px' }}
            >
              <Select style={{ height: '45px', fontSize: '16px' }} placeholder="Select a role">
                <Option value="admin">Admin</Option>
                <Option value="user">User</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="department"
              label="Department :"
              rules={[{ required: true, message: 'Department is required' }]}
              style={{ fontSize: '16px' }}
            >
              <Select style={{ height: '45px', fontSize: '16px' }} placeholder="Select a department">
                <Option value="hr">HR</Option>
                <Option value="development">Development</Option>
                <Option value="marketing">Marketing</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Add and Reset Buttons */}
        <div style={{ textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }} onClick={handleReset} className="fs-6">
            Reset
          </Button>
          <Button type="submit" className="custom-theme-dark-btn fs-6" htmlType="submit">
            Add
          </Button>
        </div>
      </Form>
      <ToastContainer />
    </div>
  );
};

export default AddUsers;
