// services/unifiedConsultationService.js
import api from './api';

const unifiedConsultationService = {
  // Obtener las últimas 10 consultas (derivaciones + remisiones)
  getLast10: async (patientId) => {
    try {
      const response = await api.get(`/UnifiedConsultation/last10/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener consultas :', error);
      throw error;
    }
  },

  // Obtener consultas por rango de fechas
  getByDateRange: async (params) => {
    try {
      const response = await api.get('/UnifiedConsultation/range', {
        params: {
          patientId: params.patientId,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener consultas:', error);
      throw error;
    }
  }
};

export default unifiedConsultationService;
