/**
 * Message Component: Handles message management operations
 * Created by Shivom on 2023-10-05
 * 
 * This component uses the messageService for API requests
 */

import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { Table, Input, Pagination, message } from "antd";
import themeStore from "./../../store/themeStore";
import { useStore } from "zustand";
// import { fetchMessages, updateMessage, addMessage, getMessageByLangAndType } from "../../CustomHooks/ApiServices/messageService";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    L1Title: "",
    L1Desc: "",
    L2Title: "",
    L2Desc: "",
  });
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [showEditForm, setShowEditForm] = useState(false);
  const isDeveloper = true;
  const [language, setLanguage] = useState('en');

  // Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5];

  const languageText = {
    messageManagement: ['Message Management', 'संदेश प्रबंधन'],
    messageType: ['Message Type', 'संदेश प्रकार'],
    selectType: ['Select Type', 'प्रकार चुनें'],
    success: ['Success', 'सफलता'],
    error: ['Error', 'त्रुटि'],
    info: ['Info', 'जानकारी'],
    l1Title: ['L1 Title', 'L1 शीर्षक'],
    l1Description: ['L1 Description', 'L1 विवरण'],
    l2Title: ['L2 Title (Hindi)', 'L2 शीर्षक (हिंदी)'],
    l2Description: ['L2 Description (Hindi)', 'L2 विवरण (हिंदी)'],
    updateMessage: ['Update Message', 'संदेश अपडेट करें'],
    addMessage: ['Add Message', 'संदेश जोड़ें'],
    cancel: ['Cancel', 'रद्द करें'],
    searchMessages: ['Search messages', 'संदेश खोजें'],
    id: ['ID', 'आईडी'],
    type: ['Type', 'प्रकार'],
    actions: ['Actions', 'कार्रवाई'],
    edit: ['Edit', 'संपादित करें'],
  };

  const getText = (key) => languageText[key][language === 'en' ? 0 : 1];

  useEffect(() => {
    // Fetch messages from API or database
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    // Simulated API call
    const mockMessages = [
      {
        id: 1,
        type: "success",
        L1Title: "Success",
        L1Desc: "Operation completed successfully",
        L2Title: "सफलता",
        L2Desc: "कार्य सफलतापूर्वक पूरा हुआ",
      },
      {
        id: 2,
        type: "error",
        L1Title: "Error",
        L1Desc: "An error occurred",
        L2Title: "त्रुटि",
        L2Desc: "एक त्रुटि हुई",
      },
      {
        id: 3,
        type: "info",
        L1Title: "Information",
        L1Desc: "Here's some information",
        L2Title: "जानकारी",
        L2Desc: "यहाँ कुछ जानकारी है",
      },
    ];
    setMessages(mockMessages);
    // try {
    //   const data = await fetchMessages();
    //   setMessages(data);
    // } catch (error) {
    //   console.error('Error fetching messages:', error);
    // }
  };

  const columns = [
    {
      title: getText('id'),
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      width: 80,
      align: "center",
    },
    {
      title: getText('type'),
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: getText('l1Title'),
      dataIndex: "L1Title",
      key: "L1Title",
      sorter: (a, b) => a.L1Title.localeCompare(b.L1Title),
    },
    {
      title: getText('l1Description'),
      dataIndex: "L1Desc",
      key: "L1Desc",
      sorter: (a, b) => a.L1Desc.localeCompare(b.L1Desc),
    },
    {
      title: getText('l2Title'),
      dataIndex: "L2Title",
      key: "L2Title",
      sorter: (a, b) => a.L2Title.localeCompare(b.L2Title),
    },
    {
      title: getText('l2Description'),
      dataIndex: "L2Desc",
      key: "L2Desc",
      sorter: (a, b) => a.L2Desc.localeCompare(b.L2Desc),
    },
    {
      title: getText('actions'),
      key: "actions",
      render: (_, record) => (
        <Button variant="primary" onClick={() => handleEdit(record)}>
          {getText('edit')}
        </Button>
      ),
      align: "center",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update existing message
        // Simulated API call
        const updatedMessages = messages.map((msg) =>
          msg.id === formData.id ? formData : msg
        );
        setMessages(updatedMessages);
        // await updateMessage(formData);
        const successMessage = getMessageByLangAndType('L1', 'success');
        message.success(successMessage ? successMessage.description : "Message updated successfully");
      } else if (isDeveloper) {
        // Add new message (only for developers)
        // Simulated API call
        const newMessage = {
          ...formData,
          id: messages.length + 1,
        };
        setMessages([...messages, newMessage]);
        // await addMessage(formData);
        const successMessage = getMessageByLangAndType('L1', 'success');
        message.success(successMessage ? successMessage.description : "Message added successfully");
      }
      setFormData({
        type: "",
        L1Title: "",
        L1Desc: "",
        L2Title: "",
        L2Desc: "",
      });
      setShowEditForm(false);
    } catch (error) {
      const errorMessage = getMessageByLangAndType('L1', 'error');
      message.error(errorMessage ? errorMessage.description : "An error occurred while saving the message");
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    if (!isDeveloper) {
      setShowEditForm(true);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const filteredMessages = messages.filter((message) =>
    Object.values(message).some((val) =>
      val.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Function to get message based on language and type
  const getMessageByLangAndType = (language, type) => {
    const message = messages.find((msg) => msg.type === type);
    if (!message) return null;
    
    if (language === 'L1') {
      return { title: message.L1Title, description: message.L1Desc };
    } else if (language === 'L2') {
      return { title: message.L2Title, description: message.L2Desc };
    }
    return null;
  };

  return (
    <div className={`container ${customLight} rounded py-2`}>
      <h2 className={`text-center mt-2 ${customDarkText}`}>
        {getText('messageManagement')}
      </h2>
      <div className="row justify-content-center ">
        <div className="col-12 col-md-12 px-4">
          {(isDeveloper || showEditForm) && (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="type">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('messageType')}
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">{getText('selectType')}</option>
                      <option value="success">{getText('success')}</option>
                      <option value="error">{getText('error')}</option>
                      <option value="info">{getText('info')}</option>
                    </Form.Control>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="L1Title">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('l1Title')}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="L1Title"
                      value={formData.L1Title}
                      onChange={handleInputChange}
                      required
                      placeholder={getText('l1Title')}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="L1Desc">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('l1Description')}
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="L1Desc"
                      value={formData.L1Desc}
                      onChange={handleInputChange}
                      required
                      placeholder={getText('l1Description')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="L2Title">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('l2Title')}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="L2Title"
                      value={formData.L2Title}
                      onChange={handleInputChange}
                      required
                      placeholder={getText('l2Title')}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="L2Desc">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('l2Description')}
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="L2Desc"
                      value={formData.L2Desc}
                      onChange={handleInputChange}
                      required
                      placeholder={getText('l2Description')}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-center">
                <Button variant="primary" type="submit" className="me-2">
                  {formData.id ? getText('updateMessage') : getText('addMessage')}
                </Button>
                {!isDeveloper && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowEditForm(false);
                    }}
                    className="ms-2"
                  >
                    {getText('cancel')}
                  </Button>
                )}
              </div>
            </Form>
          )}
          <div className="mt-4">
            <div className="d-flex justify-content-end mb-3">
              <Input.Search
                placeholder={getText('searchMessages')}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            <Table
              columns={columns}
              dataSource={paginatedMessages}
              rowKey="id"
              pagination={false}
              scroll={{ x: true }}
              bordered
            />
            <div className="d-flex justify-content-end mt-3">
              <Pagination
                current={currentPage}
                total={filteredMessages.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
