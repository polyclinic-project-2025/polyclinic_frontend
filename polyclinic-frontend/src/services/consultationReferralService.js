// services/consultationReferralService.js
import api from './api';

export const consultationReferralService = {
  /**
   * Obtiene todas las consultas
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const data = await api.get('/ConsultationReferral');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener consultas');
    }
  },

  /**
   * Obtiene ultimas 10 coonsultas
   * @returns {Promise<Array>}
   */
  getLastTen: async () => {
    try {
      const data = await api.get('/ConsultationReferral/recent');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener consultas');
    }
  },

  /**
   * Obtiene consultas en un rango de fechas
   * @returns {Promise<Array>}
   */
  inRange: async (start, end) => {
    try {
      const data = await api.get(`/ConsultationReferral/in-range?start=${start}&end=${end}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener consultas');
    }
  },

  /**
   * Obtiene una consulta por ID
   * @param {string} id - GUID de la consulta 
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const data = await api.get(`/ConsultationReferral/${id}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener consulta');
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
      const result = await api.post('/ConsultationReferral', consultationData);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Error al crear consulta');
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
      throw new Error(error.message || 'Error al actualizar consulta');
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
      throw new Error(error.message || 'Error al eliminar consulta');
    }
  },

  /**
   * Exporta consultas a PDF
   * @returns {Promise<string>} - URL de descarga del PDF
   */
  exportToPdf: async () => {
    try {
      const result = await api.get('/ConsultationReferral/export');

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
      throw new Error(error.message || 'Error al exportar consultas');
    }
  },
};