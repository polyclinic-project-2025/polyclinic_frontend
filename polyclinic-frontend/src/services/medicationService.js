import api from './api';

const medicationService = {
  // Get all medications
  getAll: async () => {
    try {
      const response = await api.get('/Medication/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  },

  // Get medication by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/Medication/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medication:', error);
      throw error;
    }
  },

  // Create new medication
  create: async (medicationData) => {
    try {
      const response = await api.post('/Medication', {
        format: medicationData.format,
        commercialName: medicationData.commercialName,
        commercialCompany: medicationData.commercialCompany,
        expirationDate: medicationData.expirationDate,
        batchNumber: medicationData.batchNumber,
        scientificName: medicationData.scientificName,
        quantityWarehouse: medicationData.quantityWarehouse,
        quantityNurse: medicationData.quantityNurse,
        minQuantityWarehouse: medicationData.minQuantityWarehouse,
        minQuantityNurse: medicationData.minQuantityNurse,
        maxQuantityWarehouse: medicationData.maxQuantityWarehouse,
        maxQuantityNurse: medicationData.maxQuantityNurse
      });
      return response.data;
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  },

  // Update medication
  update: async (id, medicationData) => {
    try {
      const response = await api.put(`/Medication/${id}`, {
        format: medicationData.format,
        commercialName: medicationData.commercialName,
        commercialCompany: medicationData.commercialCompany,
        expirationDate: medicationData.expirationDate,
        batchNumber: medicationData.batchNumber,
        scientificName: medicationData.scientificName,
        quantityWarehouse: medicationData.quantityWarehouse,
        quantityNurse: medicationData.quantityNurse,
        minQuantityWarehouse: medicationData.minQuantityWarehouse,
        minQuantityNurse: medicationData.minQuantityNurse,
        maxQuantityWarehouse: medicationData.maxQuantityWarehouse,
        maxQuantityNurse: medicationData.maxQuantityNurse
      });
      return response.data;
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  },

  // Delete medication
  delete: async (id) => {
    try {
      const response = await api.delete(`/Medication/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  }
};

export default medicationService;
