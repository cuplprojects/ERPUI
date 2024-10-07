/**
 * messageService: Handles message-related operations
 * Created by Shivom on 2023-10-05
 * Updated on 2023-10-06
 * 
 * This service uses the custom API instance for making requests
 */

import API from '../MasterApiHooks/api';

export const fetchMessages = async () => {
  try {
    const response = await API.get('/Messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const updateMessage = async (message) => {
  try {
    const response = await API.put(`/messages/${message.messageId}`, message);
    return response.data;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

export const addMessage = async (message) => {
  try {
    const response = await API.post('/messages', message);
    return response.data;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const getMessageByLangAndType = async (lang, id) => {
  try {
    const response = await API.get(`/Messages/messagebyId/${id}?lang=${lang}`);
    return {
      messageId: response.data.messageId,
      title: response.data.title,
      description: response.data.description
    };
  } catch (error) {
    console.error('Error fetching message by language and type:', error);
    return console.log({lang, type});
  }
};


const getDefaultMessage = (lang, type) => {
  const messages = {
    en: {
      success: "Operation completed successfully",
      error: "An error occurred",
      info: "Information message",
      default: "Default message"
    },
    hi: {
      success: "कार्य सफलतापूर्वक पूरा हुआ",
      error: "एक त्रुटि उत्पन्न हुई",
      info: "सूचना संदेश",
      default: "डिफ़ॉल्ट संदेश"
    }
  };

  return { description: messages[lang]?.[type] || messages[lang]?.default || messages.en.default };
};
