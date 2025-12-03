// services/consultationReferralService.js
import api from './api';

export const consultationReferralService = {
  /**
   * Obtiene todas las consultas
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/ConsultationReferral');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener consultas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene ultimas 10 coonsultas
   * @returns {Promise<Array>}
   */
  getLastTen: async () => {
    try {
      const response = await api.get('/ConsultationReferral/recent');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener consultas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene consultas en un rango de fechas
   * @returns {Promise<Array>}
   */
  inRange: async (start, end) => {
    try {
      const response = await api.get(`/ConsultationReferral/in-range?start=${start}&end=${end}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener consultas';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene una consulta por ID
   * @param {string} id - GUID de la consulta 
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/ConsultationReferral/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener consulta:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener consulta';
      throw new Error(errorMessage);
    }
  },

  /**
   * Agregar consulta
   * @param {Object} consultationData - {
  "referralId": "",
  "doctorId": "",
  "dateTimeCRe": "",
  "departmentHeadId": "",
  "diagnosis": ""
}
   * @returns {Promise<Object>}
   */
  create: async (consultationData) => {
    try { 
      const response = await api.post('/ConsultationReferral', consultationData);
      return response.data;
    } catch (error) {
      console.error('Error al crear consulta:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al crear consulta';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza una consulta 
   * @param {string} id - GUID de la consulta 
   * @param {Object} consultationData - {
  "referralId": "",
  "doctorId": "",
  "dateTimeCRe": "",
  "departmentHeadId": "",
  "diagnosis": ""
}
   * @returns {Promise<void>}
   */
  update: async (id, consultationData) => {
    try {
      await api.put(`/ConsultationReferral/${id}`, consultationData);
    } catch (error) {
      console.error('Error al actualizar consulta:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al actualizar consulta';
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina una consulta
   * @param {string} id - GUID de la consulta
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/ConsultationReferral/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al eliminar consulta';
      throw new Error(errorMessage);
    }
  },
};