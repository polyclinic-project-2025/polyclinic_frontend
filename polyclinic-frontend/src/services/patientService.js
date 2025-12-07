// services/patientService.js
import api from './api';

export const patientService = {

  /** Obtener todos los pacientes */
  getAll: async () => {
    try {
      const response = await api.get('/Patients');
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al obtener pacientes';
      throw new Error(msg);
    }
  },

  /** Obtener paciente por ID */
  getById: async (id) => {
    try {
      const response = await api.get(`/Patients/${id}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al obtener paciente';
      throw new Error(msg);
    }
  },

  /** Buscar por nombre */
  searchByName: async (name) => {
    try {
      const response = await api.get(`/Patients/search/name?name=${name}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar paciente por nombre';
      throw new Error(msg);
    }
  },

  /** Buscar por identificación */
  searchByIdentification: async (identification) => {
    try {
      const response = await api.get(`/Patients/search/identification?identification=${identification}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar paciente por identificación';
      throw new Error(msg);
    }
  },

  /** Buscar por edad */
  searchByAge: async (age) => {
    try {
      const response = await api.get(`/Patients/search/age?age=${age}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al buscar paciente por edad';
      throw new Error(msg);
    }
  },

  /** Crear paciente */
  create: async (data) => {
    try {
      const response = await api.post('/Patients', data);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al crear paciente';
      throw new Error(msg);
    }
  },

  /** Actualizar paciente */
  update: async (id, data) => {
    try {
      await api.put(`/Patients/${id}`, data);
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al actualizar paciente';
      throw new Error(msg);
    }
  },

  /** Eliminar paciente */
  delete: async (id) => {
    try {
      await api.delete(`/Patients/${id}`);
    } catch (error) {
      const msg = error.response?.data?.errorMessage || 'Error al eliminar paciente';
      throw new Error(msg);
    }
  },
};