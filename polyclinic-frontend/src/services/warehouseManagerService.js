// services/warehouseManagerService.js
import api from './api';

export const warehouseManagerService = {
  /**
   * Obtiene todos los jefes de almacén
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/WarehouseManager');
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener jefes de almacén';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene un jefe de almacén por ID
   * @param {string} id - GUID del jefe de almacén
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/WarehouseManager/${id}`);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener jefe de almacén';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene el jefe de almacén actual
   * @returns {Promise<Object>}
   */
  getCurrent: async () => {
    try {
      const response = await api.get('/WarehouseManager/manager');
      console.log('response manager: ', response);
      console.log('response manager: ', response);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener jefe de almacén actual';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crea/asigna un nuevo jefe de almacén
   * @param {Object} managerData - { identification, name, employmentStatus }
   * @returns {Promise<Object>}
   */
  create: async (managerData) => {
    try {
      const response = await api.post('/WarehouseManager', managerData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al asignar jefe de almacén';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza un jefe de almacén
   * @param {string} id - GUID del jefe de almacén
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<void>}
   */
  update: async (id, updateData) => {
    try {
      await api.put(`/WarehouseManager/${id}`, updateData);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al actualizar jefe de almacén';
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina un jefe de almacén
   * @param {string} id - GUID del jefe de almacén
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/WarehouseManager/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al eliminar jefe de almacén';
      throw new Error(errorMessage);
    }
  },
};
