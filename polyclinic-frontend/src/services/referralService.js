// services/referralService.js
import api from './api';

export const referralService = {

  /** Obtener todos los remitidos */
  getAll: async () => {
    try {
      const response = await api.get('/Referral');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al obtener remitidos';
      throw new Error(msg);
    }
  },

  /** Obtener remitido por ID */
  getById: async (id) => {
    try {
      const response = await api.get(`/Referral/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al obtener remitido';
      throw new Error(msg);
    }
  },

  /** Buscar por puesto externo */
  searchByPuestoExterno: async (name) => {
    try {
      const response = await api.get(`/Referral/search/from?name=${name}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar remitidos por puesto externo';
      throw new Error(msg);
    }
  },

  /** Buscar por departamento destino */
  searchByDepartmentTo: async (name) => {
    try {
      const response = await api.get(`/Referral/search/to?name=${name}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar remitidos por dpto destino';
      throw new Error(msg);
    }
  },

  /** Buscar por nombre de paciente */
  searchByPatientName: async (name) => {
    try {
      const response = await api.get(`/Referral/search/patient?name=${name}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar remitidos por paciente';
      throw new Error(msg);
    }
  },

  /** Buscar por identificación */
  searchByIdentification: async (identification) => {
    try {
      const response = await api.get(`/Referral/search/identification?identification=${identification}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar remitidos por identificación';
      throw new Error(msg);
    }
  },

  /** Buscar por fecha */
  searchByDate: async (date) => {
    try {
      const response = await api.get(`/Referral/search/date?date=${date}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar remitidos por fecha';
      throw new Error(msg);
    }
  },

  /** Crear remitido */
  create: async (data) => {
    try {
      const response = await api.post('/Referral', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al crear remitido';
      throw new Error(msg);
    }
  },

  /** Eliminar remitido */
  delete: async (id) => {
    try {
      await api.delete(`/Referral/${id}`);
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al eliminar remitido';
      throw new Error(msg);
    }
  },
};