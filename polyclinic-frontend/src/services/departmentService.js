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
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener departamentos';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene todos los doctores de un departamento
   * @returns {Promise<Array>}
   */
  getDoctors: async (id) => {
    try {
      const response = await api.get(`/Departments/${id}/doctors`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener doctores';
      throw new Error(errorMessage);
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
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener departamento';
      throw new Error(errorMessage);
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
      const errorMessage = error.response?.data?.errorMessage || 'Error al crear departamento';
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
      const errorMessage = error.response?.data?.errorMessage || 'Error al actualizar departamento';
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
      const errorMessage = error.response?.data?.errorMessage || 'Error al eliminar departamento';
      throw new Error(errorMessage);
    }
  },
};