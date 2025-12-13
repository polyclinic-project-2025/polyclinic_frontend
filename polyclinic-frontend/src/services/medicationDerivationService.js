// services/medicationDerivationService.js
import api from './api';

const medicationDerivationService = {
  // Get all medication derivations
  getAll: async () => {
    try {
      const response = await api.get('/MedicationDerivation');
      return response.data;
    } catch (error) {
      console.error('Error fetching medication derivations:', error);
      throw error;
    }
  },

  // Get medication derivation by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/MedicationDerivation/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medication derivation:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/MedicationDerivation', data);
      return response.data;
    } catch (error) {
      console.error('Error creating medication derivation:', error);
      
      // ✨ CAPTURAR ERROR 422 (Stock insuficiente)
      if (error.response?.status === 422) {
        const errorMessage = error.response.data?.error || 'Stock insuficiente';
        throw new Error(errorMessage);
      }
      
      // ✨ CAPTURAR ERROR 400 (Validación)
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Stock insuficiente';
        throw new Error(errorMessage);
      }
      
      // ✨ OTROS ERRORES
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.message || 'Error al crear derivación de medicamento');
    }
  },

  // UPDATE
  update: async (id, data) => {
    try {
      const response = await api.put(`/MedicationDerivation/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating medication derivation:', error);
      
      // ✨ CAPTURAR ERROR 422 (Stock insuficiente)
      if (error.response?.status === 422) {
        const errorMessage = error.response.data?.error || 'Stock insuficiente';
        throw new Error(errorMessage);
      }
      
      // ✨ CAPTURAR ERROR 400 (Validación)
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || 'Stock insuficiente';
        throw new Error(errorMessage);
      }
      
      // ✨ OTROS ERRORES
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error(error.message || 'Error al crear derivación de medicamento');
    }
  },

  // Delete medication derivation
  delete: async (id) => {
    try {
      const response = await api.delete(`/MedicationDerivation/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting medication derivation:', error);
      throw error;
    }
  },

  // Get derivations by consultation ID
  getByConsultationId: async (consultationId) => {
    try {
      const response = await api.get('/MedicationDerivation');
      const all = response.data;

      return all.filter(item =>
        item.consultationDerivationId === consultationId
      );
    } catch (error) {
      console.error('Error fetching medication derivations by consultation:', error);
      throw error;
    }
  }
};

export default medicationDerivationService;
