// services/departmentService.js
import api from './api';

export const departmentService = {
  /**
   * Obtiene todos los departamentos
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/Departments');
      return response.data;
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener departamentos'
      );
    }
  },

  /**
   * Obtiene un departamento por ID
   * @param {string} id - GUID del departamento
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/Departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener departamento:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener departamento'
      );
    }
  },

  /**
   * Crea un nuevo departamento
   * @param {Object} departmentData - { name, description }
   * @returns {Promise<Object>}
   */
  create: async (departmentData) => {
    try {
      const response = await api.post('/Departments', departmentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear departamento:', error);
      let errorMessage = 'Error al crear departamento';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).flat().join(', ');
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza un departamento existente
   * @param {string} id - GUID del departamento
   * @param {Object} departmentData - { name, description }
   * @returns {Promise<void>}
   */
  update: async (id, departmentData) => {
    try {
      await api.put(`/Departments/${id}`, departmentData);
    } catch (error) {
      console.error('Error al actualizar departamento:', error);
      let errorMessage = 'Error al actualizar departamento';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).flat().join(', ');
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina un departamento
   * @param {string} id - GUID del departamento
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/Departments/${id}`);
    } catch (error) {
      console.error('Error al eliminar departamento:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al eliminar departamento'
      );
    }
  },
};