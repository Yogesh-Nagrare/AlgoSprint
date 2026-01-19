import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000', // Replace with your backend API URL(yaja pe backend host hoga)
  withCredentials: true, // tell browser to allow to attach cookies in requests to backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;