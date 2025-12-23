// services/referralService.js
import api from './api';

export const referralService = {

  /** Obtener todos los remitidos */
  getAll: async () => {
    try {
      const data = await api.get('/Referral');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener remitidos');
    }
  },

  /** Obtener remitido por ID */
  getById: async (id) => {
    try {
      const data = await api.get(`/Referral/${id}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener remitido');
    }
  },

  /** Buscar por puesto externo */
  searchByPuestoExterno: async (name) => {
    try {
      const data = await api.get(`/Referral/search/from?name=${name}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar remitidos por puesto externo');
    }
  },

  /** Buscar por departamento destino */
  searchByDepartmentTo: async (name) => {
    try {
      const data = await api.get(`/Referral/search/to?name=${name}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar remitidos por dpto destino');
    }
  },

  /** Buscar por nombre de paciente */
  searchByPatientName: async (name) => {
    try {
      const data = await api.get(`/Referral/search/patient?name=${name}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar remitidos por paciente');
    }
  },

  /** Buscar por identificación */
  searchByIdentification: async (identification) => {
    try {
      const data = await api.get(`/Referral/search/identification?identification=${identification}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar remitidos por identificación');
    }
  },

  /** Buscar por fecha */
  searchByDate: async (date) => {
    try {
      const data = await api.get(`/Referral/search/date?date=${date}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar remitidos por fecha');
    }
  },

  /** Crear remitido */
  create: async (data) => {
    try {
      const result = await api.post('/Referral', data);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Error al crear remitido');
    }
  },

  /** Eliminar remitido */
  delete: async (id) => {
    try {
      await api.delete(`/Referral/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar remitido');
    }
  },
};