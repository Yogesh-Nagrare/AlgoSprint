import axios from 'axios';
console.log("ENV:", import.meta.env);

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // Replace with your backend API URL(yaja pe backend host hoga)
  withCredentials: true, // tell browser to allow to attach cookies in requests to backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;