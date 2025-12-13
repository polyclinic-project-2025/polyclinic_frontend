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
  }
};

export default analyticsService;
