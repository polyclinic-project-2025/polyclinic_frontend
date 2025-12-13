// services/stockDepartmentService.js
import api from './api';

const stockDepartmentService = {
  // CREATE - Crear nuevo stock department
  create: async (data) => {
    try {
      const response = await api.post('/StockDepartment', data);
      return response.data;
    } catch (error) {
      console.error('Error creating stock department:', error);
      throw error;
    }
  },

  // GET BY ID - Obtener stock department por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/StockDepartment/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock department by id:', error);
      throw error;
    }
  },

  // GET ALL - Obtener todos los stock departments
  getAll: async () => {
    try {
      const response = await api.get('/StockDepartment');
      return response.data;
    } catch (error) {
      console.error('Error fetching all stock departments:', error);
      throw error;
    }
  },

  // UPDATE - Actualizar stock department
  update: async (id, data) => {
    try {
      const response = await api.put(`/StockDepartment/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating stock department:', error);
      throw error;
    }
  },

  // DELETE - Eliminar stock department
  delete: async (id) => {
    try {
      const response = await api.delete(`/StockDepartment/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting stock department:', error);
      throw error;
    }
  },

  // GET STOCK BY DEPARTMENT - Obtener stock por departamento
  getStockByDepartment: async (departmentId) => {
    try {
      console.log('AAAAAAAAA',departmentId);
      const response = await api.get(`/StockDepartment/department/${departmentId}/stock`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock by department:', error);
      throw error;
    }
  },

  // GET LOW STOCK - Obtener stock bajo por departamento
  getLowStockByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/StockDepartment/department/${departmentId}/low-stock`);
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock by department:', error);
      throw error;
    }
  },

  // GET OVER STOCK - Obtener sobre stock por departamento
  getOverStockByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/StockDepartment/department/${departmentId}/over-stock`);
      return response.data;
    } catch (error) {
      console.error('Error fetching over stock by department:', error);
      throw error;
    }
  }
};

export default stockDepartmentService;