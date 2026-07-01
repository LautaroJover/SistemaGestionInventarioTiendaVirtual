// Instancia de Axios con la URL base del backend
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // gracias al proxy de Vite apunta a http://localhost:4000/api
  headers: { 'Content-Type': 'application/json' }
});

export default api;
