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

  // Create medication derivation
  create: async (data) => {
    try {
      const response = await api.post('/MedicationDerivation', {
        quantity: data.quantity,
        consultationDerivationId: data.consultationDerivationId,
        medicationId: data.medicationId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating medication derivation:', error);
      throw error;
    }
  },

  // Update medication derivation
  update: async (id, data) => {
    try {
      const response = await api.put(`/MedicationDerivation/${id}`, {
        quantity: data.quantity,
        consultationDerivationId: data.consultationDerivationId,
        medicationId: data.medicationId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating medication derivation:', error);
      throw error;
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
