import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { getMessageByLangAndType } from '../ApiServices/messageService';

const useAlertMessage = (messageId, type) => {
  const [show, setShow] = useState(false);
  const [messageData, setMessageData] = useState(null);
  const lang = 'L1';

  useEffect(() => {
    const fetchMessage = async () => {
      if (messageId && type) {
        try {
          const data = await getMessageByLangAndType(lang, messageId, type);
          setMessageData(data);
          setShow(true);
        } catch (error) {
          console.error('Error in AlertMessage:', error);
          setMessageData({
            title: 'Error',
            description: 'An error occurred while displaying the alert.'
          });
          setShow(true);
        }
      }
    };

    fetchMessage();
  }, [messageId, type]);

  const AlertComponent = () => {
    if (!show || !messageData) return null;

    return (
      <Alert variant={type.toLowerCase()} key={messageData.messageId} dismissible>
        <span className='fw-bold'>{messageData.title}: </span>
        <span className='fw-light'>{messageData.description}</span>
      </Alert>
    );
  };

  return AlertComponent;
};

export default useAlertMessage;