import api from './api';

export const emergencyRoomService = {
  /**
   * Obtiene todas las salas de emergencia con información del doctor
   * @returns {Promise<Array>}
   */
  getAllWithDoctor: async () => {
    try {
      const response = await api.get('/EmergencyRoom');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener guardias');
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
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener guardia');
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
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener guardias');
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
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener guardias');
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
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener guardias');
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
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear guardia');
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
      throw new Error(error.message || 'Error al actualizar guardia');
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
      throw new Error(error.message || 'Error al eliminar guardia');
    }
  },
};