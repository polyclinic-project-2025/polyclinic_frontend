// services/consultationDerivationService.js
import api from './api';

export const consultationDerivationService = {
  /**
   * Obtiene todas las derivaciones
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const data = await api.get('/ConsultationDerivation');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener derivaciones');
    }
  },

  /**
   * Obtiene una derivación por ID
   * @param {string} id - GUID de la derivación
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const data = await api.get(`/ConsultationDerivation/${id}`);
      return data;
    } catch (error) {
      console.error('Error al obtener derivación:', error);
      throw new Error(error.message || 'Error al obtener derivación');
    }
  },

  /**
   * Crea una derivación
   * @param {Object} data - DTO CreateConsultationDerivationDto
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    try {
      const result = await api.post('/ConsultationDerivation', data);
      return result;
    } catch (error) {
      console.error('Error al crear derivación:', error);
      throw new Error(error.message || 'Error al crear derivación');
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
      throw new Error(error.message || 'Error al actualizar derivación');
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
      throw new Error(error.message || 'Error al eliminar derivación');
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
      const data = await api.get('/ConsultationDerivation/date-range', {
        params: {
          patientId,
          startDate,
          endDate
        }
      });
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener derivaciones por rango de fechas');
    }
  },

  /**
   * Obtiene las últimas 10 derivaciones de un paciente
   * @param {string} patientId - GUID del paciente
   * @returns {Promise<Array>}
   */
  getLastTen: async (patientId) => {
    try {
      const data = await api.get(`/ConsultationDerivation/last-10/${patientId}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener últimas derivaciones');
    }
  },
};

export default consultationDerivationService;
