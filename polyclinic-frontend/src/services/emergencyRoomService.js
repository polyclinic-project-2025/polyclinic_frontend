import api from './api';

export const emergencyRoomService = {
  /**
   * Obtiene todas las salas de emergencia con información del doctor
   * @returns {Promise<Array>}
   */
  getAllWithDoctor: async () => {
    try {
      const response = await api.get('/EmergencyRoom');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener salas de emergencia';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene una sala de emergencia por ID con información del doctor
   * @param {string} id - GUID de la sala de emergencia
   * @returns {Promise<Object>}
   */
  getByIdWithDoctor: async (id) => {
    try {
      const response = await api.get(`/EmergencyRoom/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener sala de emergencia:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener sala de emergencia';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene salas de emergencia por fecha
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>}
   */
  getByDate: async (date) => {
    try {
      const response = await api.get(`/EmergencyRoom/by-date?date=${date}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener salas por fecha';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene salas de emergencia por identificación del doctor
   * @param {string} doctorIdentification - Identificación del doctor
   * @returns {Promise<Array>}
   */
  getByDoctorIdentification: async (doctorIdentification) => {
    try {
      const response = await api.get(`/EmergencyRoom/by-doctor-identification?doctorIdentification=${doctorIdentification}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener salas por identificación del doctor';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene salas de emergencia por nombre del doctor
   * @param {string} doctorName - Nombre del doctor
   * @returns {Promise<Array>}
   */
  getByDoctorName: async (doctorName) => {
    try {
      const response = await api.get(`/EmergencyRoom/by-doctor-name?doctorName=${doctorName}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener salas por nombre del doctor';
      throw new Error(errorMessage);
    }
  },

  /**
   * Crea una nueva sala de emergencia
   * @param {Object} emergencyRoomData - {
  "doctorId": "guid",
  "guardDate": "2024-01-15"
}
   * @returns {Promise<Object>}
   */
  create: async (emergencyRoomData) => {
    try {
      // Convertir fecha a formato DateOnly si es necesario
      const formattedData = {
        ...emergencyRoomData,
        guardDate: emergencyRoomData.guardDate.split('T')[0] // Asegurar formato YYYY-MM-DD
      };
      
      const response = await api.post('/EmergencyRoom', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error al crear sala de emergencia:', error);
      console.error('Respuesta del error:', error.response);
      const errorMessage = error.response?.data?.errorMessage || 'Error al crear sala de emergencia';
      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza una sala de emergencia
   * @param {string} id - GUID de la sala de emergencia
   * @param {Object} emergencyRoomData - {
  "doctorId": "guid",
  "guardDate": "2024-01-15"
}
   * @returns {Promise<void>}
   */
  update: async (id, emergencyRoomData) => {
    try {
      // Convertir fecha a formato DateOnly si es necesario
      const formattedData = { ...emergencyRoomData };
      if (formattedData.guardDate) {
        formattedData.guardDate = formattedData.guardDate.split('T')[0];
      }
      
      await api.put(`/EmergencyRoom/${id}`, formattedData);
    } catch (error) {
      console.error('Error al actualizar sala de emergencia:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al actualizar sala de emergencia';
      throw new Error(errorMessage);
    }
  },

  /**
   * Elimina una sala de emergencia
   * @param {string} id - GUID de la sala de emergencia
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/EmergencyRoom/${id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al eliminar sala de emergencia';
      throw new Error(errorMessage);
    }
  },
};