// services/warehouseRequestService.js
import api from './api';

export const warehouseRequestService = {
  /**
   * Obtiene todas las solicitudes de almacén
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/WarehouseRequest');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener solicitudes';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene una solicitud por ID
   * @param {string} id - GUID de la solicitud
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/WarehouseRequest/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener solicitud';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene solicitudes por estado
   * @param {string} status - Estado de la solicitud ("1", "2", "0", "-1", "-2")
   * @returns {Promise<Array>}
   */
  getByStatus: async (status) => {
    try {
      const response = await api.get(`/WarehouseRequest/status`, { params: { status } });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener solicitudes por estado';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene solicitudes por departamento
   * @param {string} departmentId - GUID del departamento
   * @returns {Promise<Array>}
   */
  getByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/WarehouseRequest/department`, { params: { id: departmentId } });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener solicitudes del departamento';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene solicitudes por estado y departamento
   * @param {string} status - Estado de la solicitud
   * @param {string} departmentId - GUID del departamento
   * @returns {Promise<Array>}
   */
  getByStatusAndDepartment: async (status, departmentId) => {
    try {
      const response = await api.get(`/WarehouseRequest/status-and-department`, {
        params: { status, departmentId }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener solicitudes filtradas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crea una nueva solicitud de almacén
   * @param {Object} requestData - { departmentId }
   * @returns {Promise<Object>}
   */
  create: async (requestData) => {
    try {
      const response = await api.post('/WarehouseRequest', requestData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al crear solicitud';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza el estado de una solicitud
   * @param {string} id - GUID de la solicitud
   * @param {Object} updateData - { status }
   * @returns {Promise<void>}
   */
  update: async (id, updateData) => {
    try {
      await api.put(`/WarehouseRequest/${id}`, updateData);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al actualizar solicitud';
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina una solicitud
   * @param {string} id - GUID de la solicitud
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/WarehouseRequest/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al eliminar solicitud';
      throw new Error(errorMessage);
    }
  },
};
