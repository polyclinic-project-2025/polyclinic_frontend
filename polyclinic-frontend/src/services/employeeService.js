// services/employeeService.js
import api from './api';

/**
 * Determina el endpoint según el tipo de empleado
 * @param {string} type - 'doctor' o 'nurse'
 * @returns {string} - Endpoint del API
 */
const getEndpoint = (type) => {
  const endpoints = {
    doctor: '/Doctor',
    nurse: '/Nurse'
  };
  return endpoints[type] || '/Doctor';
};

export const employeeService = {
  /**
   * Obtiene todos los empleados de un tipo específico
   * @param {string} type - 'doctor' o 'nurse'
   * @returns {Promise<Array>}
   */
  getAllByType: async (type) => {
    try {
      const endpoint = getEndpoint(type);
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 
        `Error al obtener ${type === 'doctor' ? 'doctores' : 'enfermeros'}`;
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene un empleado por ID
   * @param {string} type - 'doctor' o 'nurse'
   * @param {string} id - GUID del empleado
   * @returns {Promise<Object>}
   */
  getById: async (type, id) => {
    try {
      const endpoint = getEndpoint(type);
      const response = await api.get(`${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener empleado';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crea un nuevo empleado
   * @param {string} type - 'doctor' o 'nurse'
   * @param {Object} employeeData - Datos del empleado
   * @returns {Promise<Object>}
   */
  create: async (type, employeeData) => {
    try {
      const endpoint = getEndpoint(type);
      const response = await api.post(endpoint, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error al crear empleado:', error);
      const errorMessage = error.response?.data?.errorMessage || 
        `Error al crear ${type === 'doctor' ? 'doctor' : 'enfermero'}`;
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza un empleado existente
   * @param {string} type - 'doctor' o 'nurse'
   * @param {string} id - GUID del empleado
   * @param {Object} employeeData - Datos actualizados del empleado
   * @returns {Promise<void>}
   */
  update: async (type, id, employeeData) => {
    try {
      const endpoint = getEndpoint(type);
      await api.put(`${endpoint}/${id}`, employeeData);
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      const errorMessage = error.response?.data?.errorMessage || 
        `Error al actualizar ${type === 'doctor' ? 'doctor' : 'enfermero'}`;
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina un empleado
   * @param {string} type - 'doctor' o 'nurse'
   * @param {string} id - GUID del empleado
   * @returns {Promise<void>}
   */
  delete: async (type, id) => {
    try {
      const endpoint = getEndpoint(type);
      await api.delete(`${endpoint}/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 
        `Error al eliminar ${type === 'doctor' ? 'doctor' : 'enfermero'}`;
      throw new Error(errorMessage);
    }
  },
};