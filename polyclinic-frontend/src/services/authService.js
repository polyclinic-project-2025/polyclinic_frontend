// services/authService.js
import api from './api';

export const authService = {
  /**
   * Registra un nuevo usuario
   */
  register: async (userData) => {
    try {
      console.log('authService.register - Enviando:', userData);
      const data = await api.post('/Auth/register', userData);
      console.log('authService.register - Respuesta:', data);
      return data;
    } catch (error) {
      console.error('authService.register - Error:', error);
      console.error('authService.register - Error response:', error.response?.data);
      throw new Error(error.message || 'Error al registrar usuario');
    }
  },

  /**
   * Inicia sesión con credenciales
   */
  login: async (credentials) => {
    try {
      console.log('authService.login - Enviando:', { email: credentials.email, password: '***' });
      const data = await api.post('/Auth/login', credentials);
      console.log('authService.login - Respuesta exitosa:', data);
      return data;
    } catch (error) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      console.error("error service", errorMessage);
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