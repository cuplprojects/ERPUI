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

//===========================================================================================================

// import React from "react";
// import { Modal, Button as Btn, Form, Alert } from 'react-bootstrap';
// import { createDispatch } from "../CustomHooks/ApiServices/dispatchService";
// import themeStore from './../store/themeStore';
// import { useStore } from 'zustand';
// import { useTranslation } from 'react-i18next';
// import { IoClose } from "react-icons/io5";
// const DispatchFormModal = ({ show, handleClose, processId, projectId, lotNo, fetchDispatchData }) => {
//   const [formData, setFormData] = React.useState({
//     boxCount: '',
//     messengerName: '',
//     messengerMobile: '',
//     dispatchMode: '',
//     vehicleNumber: '',
//     driverName: '',
//     driverMobile: ''
//   });

//   const { t } = useTranslation();
//   const { getCssClasses } = useStore(themeStore);
//   const cssClasses = getCssClasses();
//   const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
//   const [errors, setErrors] = React.useState({});

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.boxCount) newErrors.boxCount = `${t("pleaseEnterNumberOfBoxes")}`;
//     if (!formData.messengerName) newErrors.messengerName = `${t("pleaseEnterMessengerName")}`;
//     if (!formData.messengerMobile || !/^[0-9]{10}$/.test(formData.messengerMobile)) {
//       newErrors.messengerMobile = `${t("pleaseEnterValid10DigitMobileNumber")}`;
//     }
//     if (!formData.dispatchMode) newErrors.dispatchMode = `${t("pleaseEnterModeOfDispatch")}`;
//     return newErrors;
//   };

//   const onFinish = async (e) => {
//     e.preventDefault();
//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       return;
//     }

//     const submitData = {
//       ...formData,
//       processId,
//       projectId,
//       lotNo,
//       status: false // Initialize dispatch with pending status
//     };

//     try {
//       await createDispatch(submitData);
//       setFormData({
//         boxCount: '',
//         messengerName: '',
//         messengerMobile: '',
//         dispatchMode: '',
//         vehicleNumber: '',
//         driverName: '',
//         driverMobile: ''
//       });
//       handleClose(true); // Pass success=true to trigger refetch and success message
//     } catch (error) {
//       Alert.error(t("failedToCreateDispatch"));
//     }
//   };

//   return (
//     <Modal
//       show={show}
//       onHide={() => {
//         setFormData({
//           boxCount: '',
//           messengerName: '',
//           messengerMobile: '',
//           dispatchMode: '',
//           vehicleNumber: '',
//           driverName: '',
//           driverMobile: ''
//         });
//         handleClose();
//       }}
//       centered
//     // className="border"
//     >
//       <Modal.Header className={`d-flex justify-content-between align-items-center ${customDark} ${customLightText} ${customDark === 'dark-dark' ? 'border border-bottom-0' : ''}`}>
//         <Modal.Title>{t('dispatchDetails')}</Modal.Title>
//         <Btn
//           variant="link" // Use 'link' variant for a cleaner look
//           className={customLightText} // Apply your custom class
//           onClick={() => handleClose(false)} // Close the modal
//         >
//           <IoClose size={30} />
//         </Btn>
//       </Modal.Header>
//       <Modal.Body class={`${customLight} p-2 ${customDark === 'dark-dark' ? 'border border-bottom-0' : ''}`}>
//         <Form onSubmit={onFinish}>
//           <Form.Group controlId="formBoxCount" className="">
//             <Form.Label className={`${customDarkText}`}>{t('numberOfBoxes')}</Form.Label>
//             <Form.Control
//               type="number"
//               name="boxCount"
//               value={formData.boxCount}
//               onChange={handleChange}
//               isInvalid={!!errors.boxCount}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.boxCount}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group controlId="formMessengerName" className="mt-2">
//             <Form.Label className={`${customDarkText}`}>{t('messengerName')}</Form.Label>
//             <Form.Control
//               type="text"
//               name="messengerName"
//               value={formData.messengerName}
//               onChange={handleChange}
//               isInvalid={!!errors.messengerName}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.messengerName}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group controlId="formMessengerMobile" className="mt-2">
//             <Form.Label className={`${customDarkText}`}>{t('messengerMobileNumber')}</Form.Label>
//             <Form.Control
//               type="text"
//               name="messengerMobile"
//               value={formData.messengerMobile}
//               onChange={handleChange}
//               isInvalid={!!errors.messengerMobile}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.messengerMobile}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group controlId="formDispatchMode" className="mt-2">
//             <Form.Label className={`${customDarkText}`}>{t('modeOfDispatch')}</Form.Label>
//             <Form.Control
//               type="text"
//               name="dispatch Mode"
//               value={formData.dispatchMode}
//               onChange={handleChange}
//               isInvalid={!!errors.dispatchMode}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.dispatchMode}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group controlId="formVehicleNumber" className="mt-2">
//             <Form.Label className={`${customDarkText}`}>{t('vehicleNumber')}</Form.Label>
//             <Form.Control
//               type="text"
//               name="vehicleNumber"
//               value={formData.vehicleNumber}
//               onChange={handleChange}
//             />
//           </Form.Group>

//           <Form.Group controlId="formDriverName" className="mt-2">
//             <Form.Label className={`${customDarkText}`}>{t('driverName')}</Form.Label>
//             <Form.Control
//               type="text"
//               name="driverName"
//               value={formData.driverName}
//               onChange={handleChange}
//             />
//           </Form.Group>

//           <Form.Group controlId="formDriverMobile" className="mt-2">
//             <Form.Label className={`${customDarkText}`}>{t('driverMobileNumber')}</Form.Label>
//             <Form.Control
//               type="text"
//               name="driverMobile"
//               value={formData.driverMobile}
//               onChange={handleChange}
//             />
//           </Form.Group>
//         </Form>
//       </Modal.Body> <Modal.Footer className={`d-flex justify-content-end align-items-center ${customDark} ${customLightText} ${customDark === 'dark-dark' ? 'border' : ''} `}>
//         <Btn type="submit" className={` ${customBtn} ${customDark === 'dark-dark' ? `border-white` : `border-0`} `}>
//           {t('submit')}
//         </Btn>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default DispatchFormModal;
