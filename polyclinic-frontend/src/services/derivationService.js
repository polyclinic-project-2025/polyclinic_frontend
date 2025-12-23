// services/derivationService.js
import api from './api';

export const derivationService = {

  /** Obtener todas las derivaciones */
  getAll: async () => {
    try {
      const data = await api.get('/Derivation');
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener derivaciones');
    }
  },

  /** Obtener derivación por ID */
  getById: async (id) => {
    try {
      const data = await api.get(`/Derivation/${id}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener derivación');
    }
  },

  /** Buscar por dpto origen */
  searchByDepartmentFrom: async (name) => {
    try {
      const data = await api.get(`/Derivation/search/from?name=${name}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar derivaciones por dpto origen');
    }
  },

  /** Buscar por dpto destino */
  searchByDepartmentTo: async (name) => {
    try {
      const data = await api.get(`/Derivation/search/to?name=${name}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar derivaciones por dpto destino');
    }
  },

  /** Buscar por nombre de paciente */
  searchByPatientName: async (name) => {
    try {
      const data = await api.get(`/Derivation/search/patient?name=${name}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar derivaciones por paciente');
    }
  },

  /** Buscar por identificación */
  searchByIdentification: async (identification) => {
    try {
      const data = await api.get(`/Derivation/search/identification?identification=${identification}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar por identificación');
    }
  },

  /** Buscar por fecha */
  searchByDate: async (date) => {
    try {
      const data = await api.get(`/Derivation/search/date?date=${date}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al buscar derivaciones por fecha');
    }
  },

  /** Crear derivación */
  create: async (data) => {
    try {
      const result = await api.post('/Derivation', data);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Error al crear derivación');
    }
  },

  /** Eliminar derivación */
  delete: async (id) => {
    try {
      await api.delete(`/Derivation/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar derivación');
    }
  },
};