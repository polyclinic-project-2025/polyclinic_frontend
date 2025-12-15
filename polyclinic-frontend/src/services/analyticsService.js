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
  },

  // Obtener solicitudes de almacén denegadas
  getDeniedWarehouseRequests: async () => {
    try {
      const response = await api.get('/Analytics/denied-warehouse-requests', {
        params: {
          status: "-2",
        },
      });
      return response;
    } catch (error) {
      console.error('Error al obtener solicitudes de almacén denegadas', error);
      throw error;
    }
  },

  // Obtener promedio mensual de atenciones por doctor
  getDoctorMonthlyAverage: async (params) => {
    try {
      const response = await api.get('/Analytics/doctor-monthly-average', {
        params: {
          from: params.from,
          to: params.to,
        },
      });
      return response;
    } catch (error) {
      console.error('Error al obtener promedio de atenciones', error);
      throw error;
    }
  },

  // Obtener tasa de éxito de doctores
  getDoctorSuccessRate: async (params) => {
    try {
      const response = await api.get('/Analytics/doctor-success-rate', {
        params: {
          frequency: params.frequency,
        },
      });
      return response;
    } catch (error) {
      console.error('Error al obtener tasas de éxito de doctores', error);
      throw error;
    }
  }
};

export default analyticsService;