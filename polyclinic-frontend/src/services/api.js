// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:5267/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    console.log('Haciendo petición a:', config.baseURL + config.url);
    console.log('Datos enviados:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token agregado a la petición ' + config.headers + 'con url ' + config.url);
    }
    return config;
  },
  (error) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globalmente
api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.status, response.data);
    // Unwrap standardized envelope: { success, data, message, errorCode }
    const envelope = response?.data;
    if (envelope && typeof envelope === 'object' && 'success' in envelope) {
      if (envelope.success) {
        return envelope.data;
      }
      const err = new Error(envelope.message || 'Error en respuesta');
      err.code = envelope.errorCode;
      err.response = response;
      return Promise.reject(err);
    }
    // Fallback: return raw data if not enveloped
    return response.data;
  },
  (error) => {
    console.error('Error en la respuesta:', error.response?.status);
    console.error('Datos del error:', error.response?.data);
    console.error('Error completo:', error);

    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Normalize error shape when backend sends envelope
    const envelope = error.response?.data;
    if (envelope && typeof envelope === 'object' && 'success' in envelope) {
      const err = new Error(envelope.message || 'Error en la operación');
      err.code = envelope.errorCode;
      err.status = error.response?.status;
      err.response = error.response;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

export default api;