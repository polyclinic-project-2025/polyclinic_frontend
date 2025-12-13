import api from './api';

const medicationReferralService = {
  // Get all medication referrals
  getAll: async () => {
    try {
      const response = await api.get('/MedicationReferral');
      return response.data;
    } catch (error) {
      console.error('Error fetching medication referrals:', error);
      throw error;
    }
  },

  // Get medication referral by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/MedicationReferral/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medication referral:', error);
      throw error;
    }
  },

  // Create new medication referral
  create: async (medicationReferralData) => {
    try {
      const response = await api.post('/MedicationReferral', {
        quantity: medicationReferralData.quantity,
        consultationReferralId: medicationReferralData.consultationReferralId,
        medicationId: medicationReferralData.medicationId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating medication referral:', error);
      throw error;
    }
  },

  // Update medication referral
  update: async (id, medicationReferralData) => {
    try {
      const response = await api.put(`/MedicationReferral/${id}`, {
        quantity: medicationReferralData.quantity,
        consultationReferralId: medicationReferralData.consultationReferralId,
        medicationId: medicationReferralData.medicationId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating medication referral:', error);
      throw error;
    }
  },

  // Delete medication referral
  delete: async (id) => {
    try {
      const response = await api.delete(`/MedicationReferral/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting medication referral:', error);
      throw error;
    }
  },

  // Get medications by consultation ID
  getByConsultationId: async (consultationId) => {
    try {
      const response = await api.get('/MedicationReferral');
      const allMedications = response.data;
      // Filtrar por consultationReferralId
      return allMedications.filter(med => 
        med.consultationReferralId === consultationId
      );
    } catch (error) {
      console.error('Error fetching medications by consultation:', error);
      throw error;
    }
  }
};

export default medicationReferralService;
