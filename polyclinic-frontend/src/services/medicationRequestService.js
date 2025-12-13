// services/medicationRequestService.js
import api from './api';

export const medicationRequestService = {
  /**
   * Obtiene todas las solicitudes de medicamentos
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/MedicationRequest');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener solicitudes de medicamentos';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene una solicitud de medicamento por ID
   * @param {string} id - GUID de la solicitud
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/MedicationRequest/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener solicitud de medicamento';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene medicamentos de una solicitud de almacén
   * @param {string} warehouseRequestId - GUID de la solicitud de almacén
   * @returns {Promise<Array>}
   */
  getByWarehouseRequest: async (warehouseRequestId) => {
    try {
      const response = await api.get(`/MedicationRequest/warehouse-request`, {
        params: { warehouseRequestId }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener medicamentos de la solicitud';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crea una nueva solicitud de medicamento
   * @param {Object} requestData - { quantity, warehouseRequestId, medicationId }
   * @returns {Promise<Object>}
   */
  create: async (requestData) => {
    try {
      const response = await api.post('/MedicationRequest', requestData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al crear solicitud de medicamento';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza una solicitud de medicamento
   * @param {string} id - GUID de la solicitud
   * @param {Object} updateData - { quantity }
   * @returns {Promise<void>}
   */
  update: async (id, updateData) => {
    try {
      await api.put(`/MedicationRequest/${id}`, updateData);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al actualizar solicitud de medicamento';
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina una solicitud de medicamento
   * @param {string} id - GUID de la solicitud
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/MedicationRequest/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al eliminar solicitud de medicamento';
      throw new Error(errorMessage);
    }
  },
};
