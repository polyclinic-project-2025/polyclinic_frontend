// services/consultationDerivationService.js
import api from './api';

export const consultationDerivationService = {
  /**
   * Obtiene todas las derivaciones
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/ConsultationDerivation');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener derivaciones';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene una derivación por ID
   * @param {string} id - GUID de la derivación
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/ConsultationDerivation/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener derivación:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener derivación';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crea una derivación
   * @param {Object} data - DTO CreateConsultationDerivationDto
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const response = await api.post('/ConsultationDerivation', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear derivación:', error);
      console.error(error.response);
      const errorMessage = error.response?.data?.errorMessage || 'Error al crear derivación';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza una derivación
   * @param {string} id - GUID
   * @param {Object} data - DTO UpdateConsultationDerivationDto
   * @returns {Promise<void>}
   */
  update: async (id, data) => {
    try {
      await api.put(`/ConsultationDerivation/${id}`, data);
    } catch (error) {
      console.error('Error al actualizar derivación:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al actualizar derivación';
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina una derivación
   * @param {string} id - GUID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/ConsultationDerivation/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al eliminar derivación';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene derivaciones en un rango de fechas
   * @param {string} patientId
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Array>}
   */
  inRange: async (patientId, startDate, endDate) => {
    try {
      const response = await api.get('/ConsultationDerivation/date-range', {
        params: {
          patientId,
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener derivaciones por rango de fechas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene las últimas 10 derivaciones de un paciente
   * @param {string} patientId - GUID del paciente
   * @returns {Promise<Array>}
   */
  getLastTen: async (patientId) => {
    try {
      const response = await api.get(`/ConsultationDerivation/last-10/${patientId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener últimas derivaciones';
      throw new Error(errorMessage);
    }
  },
};

export default consultationDerivationService;
