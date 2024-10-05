/**
 * messageService: Handles message-related operations
 * Created by Shivom on 2023-10-05
 * 
 * This service uses the custom API instance for making requests
 */

import API from '../MasterApiHooks/api';

export const fetchMessages = async () => {
  try {
    const response = await API.get('/api/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const updateMessage = async (message) => {
  try {
    const response = await API.put(`/api/messages/${message.id}`, message);
    return response.data;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

export const addMessage = async (message) => {
  try {
    const response = await API.post('/api/messages', message);
    return response.data;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const getMessageByLangAndType = async (lang, type) => {
  try {
    const response = await API.get(`/api/messages?lang=${lang}&type=${type}`);
    return response.data || getDefaultMessage(type);
  } catch (error) {
    console.error('Error fetching message by language and type:', error);
    return getDefaultMessage(type);
  }
};

const getDefaultMessage = (type) => {
  switch (type) {
    case 'success':
      return { description: "Operation completed successfully" };
    case 'error':
      return { description: "An error occurred" };
    case 'info':
      return { description: "Information message" };
    default:
      return { description: "Default message" };
  }
};
