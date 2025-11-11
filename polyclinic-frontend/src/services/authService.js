// services/authService.js
import api from './api';

export const authService = {
  /**
   * Registra un nuevo usuario
   */
  register: async (userData) => {
    try {
      console.log('authService.register - Enviando:', userData);
      const response = await api.post('/Auth/register', userData);
      console.log('authService.register - Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('authService.register - Error:', error);
      console.error('authService.register - Error response:', error.response?.data);
      
      let errorMessage = 'Error al registrar usuario';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).flat().join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Inicia sesión con credenciales
   */
  login: async (credentials) => {
    try {
      console.log('authService.login - Enviando:', { email: credentials.email, password: '***' });
      const response = await api.post('/Auth/login', credentials);
      console.log('authService.login - Respuesta exitosa:', response.data);
      return response.data;
    } catch (error) {
      console.error('authService.login - Error:', error);
      console.error('authService.login - Error response:', error.response);
      console.error('authService.login - Error data:', error.response?.data);
      
      let errorMessage = 'Credenciales inválidas';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).flat().join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('authService.login - Mensaje de error final:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Cierra sesión del usuario
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtiene el usuario actual del localStorage
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  },

  /**
   * Verifica si hay un token válido
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};