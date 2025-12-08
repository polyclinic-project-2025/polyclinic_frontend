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
      console.log('📅 [consultationReferralService.create] dateTimeCRe enviado:', consultationData.dateTimeCRe);
      console.log('📋 [consultationReferralService.create] Datos completos:', consultationData);
      const response = await api.post('/ConsultationReferral', consultationData);
      return response.data;
    } catch (error) {
      console.error('Error al crear consulta:', error);
      console.error(error.response);
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

  /**
   * Exporta consultas a PDF
   * @returns {Promise<string>} - URL de descarga del PDF
   */
  exportToPdf: async () => {
    try {
      const response = await api.get('/ConsultationReferral/export');
      const result = response.data;

      // Decodificar Base64 y descargar
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al exportar consultas';
      throw new Error(errorMessage);
    }
  },
};