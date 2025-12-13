// services/departmentHeadService.js
import api from './api';

export const departmentHeadService = {
  /**
   * Obtiene todos los jefes de departamento
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const data = await api.get('/DepartmentHead');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener jefes de departamento');
    }
  },

  /**
   * Obtiene un jefe de departamento por ID
   * @param {string} id - GUID del jefe de departamento
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const data = await api.get(`/DepartmentHead/${id}`);
      return data;
    } catch (error) {
      console.error('Error al obtener jefe de departamento:', error);
      throw new Error(error.message || 'Error al obtener jefe de departamento');
    }
  },

  /**
   * Obtiene el jefe de departamento por ID de departamento
   * @param {string} departmentId - GUID del departamento
   * @returns {Promise<Object>}
   */
  getByDepartmentId: async (departmentId) => {
    try {
      const data = await api.get(`/DepartmentHead/by-department-id/${departmentId}`);
      return data;
    } catch (error) {
      console.error('Error al obtener jefe de departamento:', error);
      throw new Error(error.message || 'Error al obtener jefe de departamento');
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
      const data = await api.post('/DepartmentHead', {
        doctorId: doctorId
      }, {
        params: { departmentId } // Envía departmentId como query param
      });
      return data;
    } catch (error) {
      console.error('Error al asignar jefe de departamento:', error);
      throw new Error(error.message || 'Error al asignar jefe de departamento');
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
      throw new Error(error.message || 'Error al remover jefe de departamento');
    }
  },
};