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

  // Exportar solicitudes de almacén denegadas a PDF
  getDeniedWarehouseRequestsPdf: async (params) => {
    try {
      const result = await api.get('/Analytics/denied-warehouse-requests/pdf', {
        params: {
          status: params.status,
        },
      });

      // Decodificar Base64 y descargar
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Error al exportar solicitudes de almacén denegadas', error);
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

  // Exportar promedio mensual de atenciones por doctor a PDF
  getDoctorMonthlyAveragePdf: async (params) => {
    try {
      const result = await api.get('/Analytics/doctor-monthly-average/pdf', {
        params: {
          from: params.from,
          to: params.to,
        },
      });

      // Decodificar Base64 y descargar
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Error al exportar promedio mensual de atenciones', error);
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
  },

  // Exportar tasa de éxito de doctores a PDF
  getDoctorSuccessRatePdf: async (params) => {
    try {
      const result = await api.get('/Analytics/doctor-success-rate/pdf', {
        params: {
          frequency: params.frequency,
        },
      });

      // Decodificar Base64 y descargar
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Error al exportar tasa de éxito de doctores', error);
      throw error;
    }
  },

  // Obtener lista de pacientes registrados
  getPatientsList: async () => {
    try {
      const response = await api.get('/Analytics/patients-list');
      return response;
    } catch (error) {
      console.error('Error al obtener lista de pacientes:', error);
      throw error;
    }
  },
    // Exportar pacientes registrados a PDF
    exportPatientsListToPdf: async (params) => {
      try {
        const result = await api.get('/Analytics/patients-list/pdf');
  
        // Decodificar Base64 y descargar
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
  
        // Crear enlace de descarga
        const url = URL.createObjectURL(blob);
        return url;
      } catch (error) {
        console.error('Error al exportar promedio mensual de atenciones', error);
        throw error;
      }
    },
};

export default analyticsService;