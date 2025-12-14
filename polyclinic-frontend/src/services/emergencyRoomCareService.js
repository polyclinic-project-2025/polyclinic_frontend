import api from './api';

export const emergencyRoomCareService = {
  /**
   * Obtiene todas las atenciones de emergencia con detalles
   * @returns {Promise<Array>}
   */
  getAllWithDetails: async () => {
    try {
      const response = await api.get('/EmergencyRoomCare');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener atenciones');
    }
  },

  /**
   * Obtiene una atención de emergencia por ID con detalles
   * @param {string} id - GUID de la atención de emergencia
   * @returns {Promise<Object>}
   */
  getByIdWithDetails: async (id) => {
    try {
      const response = await api.get(`/EmergencyRoomCare/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener atencion');
    }
  },

  /**
   * Obtiene atenciones por fecha
   * @param {string} date - Fecha en formato ISO (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  getByDate: async (date) => {
    try {
      const response = await api.get(`/EmergencyRoomCare/by-date?date=${date}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener atenciones');
    }
  },

  /**
   * Obtiene atenciones por nombre del doctor
   * @param {string} doctorName - Nombre del doctor
   * @returns {Promise<Array>}
   */
  getByDoctorName: async (doctorName) => {
    try {
      const response = await api.get(`/EmergencyRoomCare/by-doctor-name?doctorName=${doctorName}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener atenciones');
    }
  },

  /**
   * Obtiene atenciones por identificación del doctor
   * @param {string} doctorIdentification - Identificación del doctor
   * @returns {Promise<Array>}
   */
  getByDoctorIdentification: async (doctorIdentification) => {
    try {
      const response = await api.get(`/EmergencyRoomCare/by-doctor-identification?doctorIdentification=${doctorIdentification}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener atenciones');
    }
  },

  /**
   * Obtiene atenciones por nombre del paciente
   * @param {string} patientName - Nombre del paciente
   * @returns {Promise<Array>}
   */
  getByPatientName: async (patientName) => {
    try {
      const response = await api.get(`/EmergencyRoomCare/by-patient-name?patientName=${patientName}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener atenciones');
    }
  },

  /**
   * Obtiene atenciones por identificación del paciente
   * @param {string} patientIdentification - Identificación del paciente
   * @returns {Promise<Array>}
   */
  getByPatientIdentification: async (patientIdentification) => {
    try {
      const response = await api.get(`/EmergencyRoomCare/by-patient-identification?patientIdentification=${patientIdentification}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener atenciones');
    }
  },

  /**
   * Crea una nueva atención de emergencia
   * @param {Object} emergencyRoomCareData - {
  "diagnosis": "string",
  "emergencyRoomId": "guid",
  "careDate": "2024-01-15T10:30:00",
  "patientId": "guid"
}
   * @returns {Promise<Object>}
   */
  create: async (emergencyRoomCareData) => {
    try {
      const response = await api.post('/EmergencyRoomCare', emergencyRoomCareData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear atencion');
    }
  },

  /**
   * Actualiza una atención de emergencia
   * @param {string} id - GUID de la atención de emergencia
   * @param {Object} emergencyRoomCareData - {
  "diagnosis": "string",
  "emergencyRoomId": "guid",
  "careDate": "2024-01-15T10:30:00",
  "patientId": "guid"
}
   * @returns {Promise<void>}
   */
  update: async (id, emergencyRoomCareData) => {
    try {
      await api.put(`/EmergencyRoomCare/${id}`, emergencyRoomCareData);
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar atencion');
    }
  },

  /**
   * Elimina una atención de emergencia
   * @param {string} id - GUID de la atención de emergencia
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/EmergencyRoomCare/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar guardia');
    }
  },
};