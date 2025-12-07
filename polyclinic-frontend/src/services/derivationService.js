// services/derivationService.js
import api from './api';

export const derivationService = {

  /** Obtener todas las derivaciones */
  getAll: async () => {
    try {
      const response = await api.get('/Derivation');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al obtener derivaciones';
      throw new Error(msg);
    }
  },

  /** Obtener derivación por ID */
  getById: async (id) => {
    try {
      const response = await api.get(`/Derivation/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al obtener derivación';
      throw new Error(msg);
    }
  },

  /** Buscar por dpto origen */
  searchByDepartmentFrom: async (name) => {
    try {
      const response = await api.get(`/Derivation/search/from?name=${name}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar derivaciones por dpto origen';
      throw new Error(msg);
    }
  },

  /** Buscar por dpto destino */
  searchByDepartmentTo: async (name) => {
    try {
      const response = await api.get(`/Derivation/search/to?name=${name}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar derivaciones por dpto destino';
      throw new Error(msg);
    }
  },

  /** Buscar por nombre de paciente */
  searchByPatientName: async (name) => {
    try {
      const response = await api.get(`/Derivation/search/patient?name=${name}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar derivaciones por paciente';
      throw new Error(msg);
    }
  },

  /** Buscar por identificación */
  searchByIdentification: async (identification) => {
    try {
      const response = await api.get(`/Derivation/search/identification?identification=${identification}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar por identificación';
      throw new Error(msg);
    }
  },

  /** Buscar por fecha */
  searchByDate: async (date) => {
    try {
      const response = await api.get(`/Derivation/search/date?date=${date}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar derivaciones por fecha';
      throw new Error(msg);
    }
  },

  /** Crear derivación */
  create: async (data) => {
    try {
      const response = await api.post('/Derivation', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al crear derivación';
      throw new Error(msg);
    }
  },

  /** Eliminar derivación */
  delete: async (id) => {
    try {
      await api.delete(`/Derivation/${id}`);
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al eliminar derivación';
      throw new Error(msg);
    }
  },
};