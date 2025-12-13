// services/stockDepartmentService.js
import api from './api';

const stockDepartmentService = {
  // CREATE - Crear nuevo stock department
  create: async (data) => {
    try {
      const result = await api.post('/StockDepartment', data);
      return result;
    } catch (error) {
      console.error('Error creating stock department:', error);
      throw error;
    }
  },

  // GET BY ID - Obtener stock department por ID
  getById: async (id) => {
    try {
      const data = await api.get(`/StockDepartment/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching stock department by id:', error);
      throw error;
    }
  },

  // GET ALL - Obtener todos los stock departments
  getAll: async () => {
    try {
      const data = await api.get('/StockDepartment');
      return data;
    } catch (error) {
      console.error('Error fetching all stock departments:', error);
      throw error;
    }
  },

  // UPDATE - Actualizar stock department
  update: async (id, data) => {
    try {
      const result = await api.put(`/StockDepartment/${id}`, data);
      return result;
    } catch (error) {
      console.error('Error updating stock department:', error);
      throw error;
    }
  },

  // DELETE - Eliminar stock department
  delete: async (id) => {
    try {
      const data = await api.delete(`/StockDepartment/${id}`);
      return data;
    } catch (error) {
      console.error('Error deleting stock department:', error);
      throw error;
    }
  },

  // GET STOCK BY DEPARTMENT - Obtener stock por departamento
  getStockByDepartment: async (departmentId) => {
    try {
      const data = await api.get(`/StockDepartment/department/${departmentId}/stock`);
      return data;
    } catch (error) {
      console.error('Error fetching stock by department:', error);
      throw error;
    }
  },

  // GET LOW STOCK - Obtener stock bajo por departamento
  getLowStockByDepartment: async (departmentId) => {
    try {
      const data = await api.get(`/StockDepartment/department/${departmentId}/low-stock`);
      return data;
    } catch (error) {
      console.error('Error fetching low stock by department:', error);
      throw error;
    }
  },

  // GET OVER STOCK - Obtener sobre stock por departamento
  getOverStockByDepartment: async (departmentId) => {
    try {
      const data = await api.get(`/StockDepartment/department/${departmentId}/over-stock`);
      return data;
    } catch (error) {
      console.error('Error fetching over stock by department:', error);
      throw error;
    }
  }
};

export default stockDepartmentService;