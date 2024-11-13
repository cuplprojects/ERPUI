import React from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { createDispatch } from "../CustomHooks/ApiServices/dispatchService";

const DispatchFormModal = ({ show, handleClose, processId, projectId, lotNo, fetchDispatchData }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const submitData = {
      ...values,
      processId,
      projectId,
      lotNo,
      status: false // Initialize dispatch with pending status
    };

    try {
      await createDispatch(submitData);
      form.resetFields();
      handleClose(true); // Pass success=true to trigger refetch and success message
    } catch (error) {
      message.error("Failed to create dispatch");
    }
  };

  return (
    <Modal
      title="Dispatch Details"
      open={show}
      onCancel={() => {
        form.resetFields();
        handleClose();
      }}
      footer={[
        <Button 
          key="cancel" 
          onClick={() => {
            form.resetFields();
            handleClose();
          }}
        >
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Submit
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Number of Boxes"
          name="boxCount"
          rules={[{ required: true, message: "Please enter number of boxes" }]}
        >
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item
          label="Messenger Name"
          name="messengerName"
          rules={[{ required: true, message: "Please enter messenger name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Messenger Mobile Number"
          name="messengerMobile"
          rules={[
            { required: true, message: "Please enter messenger mobile number" },
            {
              pattern: /^[0-9]{10}$/,
              message: "Please enter valid 10 digit mobile number",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mode of Dispatch"
          name="dispatchMode"
          rules={[
            { required: true, message: "Please enter mode of dispatch" },
          ]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item label="Vehicle Number" name="vehicleNumber">
          <Input />
        </Form.Item>
        
        <Form.Item label="Driver Name" name="driverName">
          <Input />
        </Form.Item>

        <Form.Item
          label="Driver Mobile Number"
          name="driverMobile"
          rules={[
            {
              pattern: /^[0-9]{10}$/,
              message: "Please enter valid 10 digit mobile number",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DispatchFormModal;
