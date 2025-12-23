// services/departmentService.js
import api from './api';

export const departmentService = {
  /**
   * Obtiene todos los departamentos
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const data = await api.get('/Departments');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener departamentos');
    }
  },

  /**
   * Obtiene un departamento por ID
   * @param {string} id - GUID del departamento
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    try {
      const data = await api.get(`/Departments/${id}`);
      return data;
    } catch (error) {
      console.error('Error al obtener departamento:', error);
      throw new Error(error.message || 'Error al obtener departamento');
    }
  },

  /**
   * Obtiene todos los doctores de un departamento
   * @param {string} departmentId - GUID del departamento
   * @returns {Promise<Array>}
   */
  getDoctorsByDepartment: async (departmentId) => {
    try {
      const data = await api.get(`/Departments/${departmentId}/doctors`);
      return data;
    } catch (error) {
      console.error('Error al obtener doctores del departamento:', error);
      throw new Error(error.message || 'Error al obtener doctores del departamento');
    }
  },

  /**
   * Crea un nuevo departamento
   * @param {Object} departmentData - { name }
   * @returns {Promise<Object>}
   */
  create: async (departmentData) => {
    try {
      const data = await api.post('/Departments', departmentData);
      return data;
    } catch (error) {
      console.error('Error al crear departamento:', error);
      throw new Error(error.message || 'Error al crear departamento');
    }
  },

  /**
   * Actualiza un departamento existente
   * @param {string} id - GUID del departamento
   * @param {Object} departmentData - { name }
   * @returns {Promise<void>}
   */
  update: async (id, departmentData) => {
    try {
      await api.put(`/Departments/${id}`, departmentData);
    } catch (error) {
      console.error('Error al actualizar departamento:', error);
      throw new Error(error.message || 'Error al actualizar departamento');
    }
  },

  /**
   * Elimina un departamento
   * @param {string} id - GUID del departamento
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/Departments/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar departamento');
    }
  },

  /**
   * Exporta departamentos a PDF
   * @returns {Promise<string>} - URL de descarga del PDF
   */
  exportToPdf: async () => {
    try {
      const result = await api.get('/Departments/export');

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
      throw new Error(error.message || 'Error al exportar departamentos');
    }
  },
};