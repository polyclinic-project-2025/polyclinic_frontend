// services/departmentHeadService.js
import api from './api';

export const departmentHeadService = {
  /**
   * Obtiene todos los jefes de departamento
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/DepartmentHead');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener jefes de departamento';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene un jefe de departamento por ID
   * @param {string} id - GUID del jefe de departamento
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/DepartmentHead/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener jefe de departamento:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener jefe de departamento';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene el jefe de departamento por ID de departamento
   * @param {string} departmentId - GUID del departamento
   * @returns {Promise<Object>}
   */
  getByDepartmentId: async (departmentId) => {
    try {
      const response = await api.get(`/DepartmentHead/by-department-id/${departmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener jefe de departamento:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener jefe de departamento';
      throw new Error(errorMessage);
    }
  },

  /**
   * Asigna un doctor como jefe de departamento
   * @param {string} departmentId - GUID del departamento
   * @param {string} doctorId - GUID del doctor
   * @returns {Promise<Object>}
   */
  assign: async (departmentId, doctorId) => {
    try {
      const response = await api.post('/DepartmentHead', {
        doctorId: doctorId
      }, {
        params: { departmentId } // Envía departmentId como query param
      });
      return response.data;
    } catch (error) {
      console.error('Error al asignar jefe de departamento:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al asignar jefe de departamento';
      throw new Error(errorMessage);
    }
  },

  /**
   * Remueve un jefe de departamento
   * @param {string} id - GUID del jefe de departamento
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    try {
      await api.delete(`/DepartmentHead/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al remover jefe de departamento';
      throw new Error(errorMessage);
    }
  },
};