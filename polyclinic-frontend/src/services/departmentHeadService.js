// services/departmentHeadService.js
import api from './api';

export const departmentHedService = {
  /**
   * Obtiene todas las consultas
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/DepartmentHead');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener jefes de departamento';
      throw new Error(errorMessage);
    }
  },
};