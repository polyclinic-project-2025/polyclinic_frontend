// services/patientService.js
import api from './api';

export const patientService = {

  /** Obtener todos los pacientes */
  getAll: async () => {
    try {
      const data = await api.get('/Patients');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener pacientes');
    }
  },

  /** Obtener paciente por ID */
  getById: async (id) => {
    try {
      const data = await api.get(`/Patients/${id}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener paciente');
    }
  },

  /** Buscar por nombre */
  searchByName: async (name) => {
    try {
      const data = await api.get(`/Patients/search/name?name=${name}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar paciente por nombre');
    }
  },

  /** Buscar por identificación */
  searchByIdentification: async (identification) => {
    try {
      const data = await api.get(`/Patients/search/identification?identification=${identification}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar paciente por identificación');
    }
  },

  /** Buscar por edad */
  searchByAge: async (age) => {
    try {
      const data = await api.get(`/Patients/search/age?age=${age}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar paciente por edad');
    }
  },

  /** Crear paciente */
  create: async (data) => {
    try {
      const result = await api.post('/Patients', data);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Error al crear paciente');
    }
  },

  /** Actualizar paciente */
  update: async (id, data) => {
    try {
      await api.put(`/Patients/${id}`, data);
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar paciente');
    }
  },

  /** Eliminar paciente */
  delete: async (id) => {
    try {
      await api.delete(`/Patients/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar paciente');
    }
  },

  /**
   * Exporta pacientes a PDF
   * @returns {Promise<string>} - URL de descarga del PDF
   */
  exportToPdf: async () => {
    try {
      const result = await api.get('/Patients/export');

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
      throw new Error(error.message || 'Error al exportar pacientes');
    }
  },
};