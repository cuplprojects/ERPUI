// validateLogin.js
import { toast } from 'react-toastify';

// Validation function for login form
export const validateLogin = (userId, password) => {
  let isValid = true;

  // Check if userId is empty
  if (!userId) {
    toast.error('User ID is required.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      style: { backgroundColor: '#ff4d4d', color: 'white' },
    });
    isValid = false;
  }

  // Check if password is empty
  if (!password) {
    toast.error('Password is required.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      style: { backgroundColor: '#ff4d4d', color: 'white' },
    });
    isValid = false;
  }

  // Check if password is of minimum length 8
  if (password && password.length < 8) {
    toast.error('Password must be at least 8 characters long.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      style: { backgroundColor: '#ff4d4d', color: 'white' },
    });
    isValid = false;
  }

  // Fetch stored users from local storage
 // const storedUsers = JSON.parse(localStorage.getItem('users'));

  // Validate user credentials against stored data
  const userExists = Object.values(storedUsers).some(
    (user) => user.userId === userId && user.password === password
  );

  if (isValid && !userExists) {
    toast.error('Invalid User ID or Password.', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      style: { backgroundColor: '#ff4d4d', color: 'white' },
    });
    isValid = false;
  }

  return isValid;
};
