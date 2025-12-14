// services/analyticsService.js
import api from './api';

const analyticsService = {
  // Obtener las últimas 10 consultas unificadas
  getLast10: async (patientId) => {
    try {
      const data = await api.get(`/Analytics/last10/${patientId}`);
      return data;
    } catch (error) {
      console.error('Error fetching last 10 analytics consultations:', error);
      throw error;
    }
  },

  // Obtener consultas unificadas por rango de fechas
  getByDateRange: async (params) => {
    try {
      const data = await api.get('/Analytics/range', {
        params: {
          patientId: params.patientId,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      });

      return data;
    } catch (error) {
      console.error('Error fetching analytics consultations by range:', error);
      throw error;
    }
  },

  // Obtener consumo mensual de un medicamento
  getMedicationConsumption: async (params) => {
    try {
      const response = await api.get('/Analytics/medication-consumption', {
        params: {
          medicationId: params.medicationId,
          month: params.month,
          year: params.year,
        },
      });

      // El backend devuelve: { success: true, data: {...}, message: "..." }
      // El data contiene el MedicationConsumptionReadModel
      return response;
    } catch (error) {
      console.error('Error fetching medication consumption:', error);
      throw error;
    }
  }
};

export default analyticsService;