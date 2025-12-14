import api from './api';

export const medicationEmergencyService = {
  /**
   * Obtiene todas las medicaciones de emergencia con información del medicamento
   * @returns {Promise<Array>}
   */
  getAllWithMedication: async () => {
    try {
      const response = await api.get('/MedicationEmergency');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener medicaciones');
    }
  },

  /**
   * Obtiene una medicación de emergencia por ID con información del medicamento
   * @param {string} id - GUID de la medicación de emergencia
   * @returns {Promise<Object>}
   */
  getByIdWithMedication: async (id) => {
    try {
      const response = await api.get(`/MedicationEmergency/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener medicacion');
    }
  },

  /**
   * Obtiene medicaciones por ID de atención de emergencia
   * @param {string} emergencyRoomCareId - GUID de la atención de emergencia
   * @returns {Promise<Array>}
   */
  getByEmergencyRoomCareId: async (emergencyRoomCareId) => {
    try {
      const response = await api.get(`/MedicationEmergency/by-emergency-room-care/${emergencyRoomCareId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener medicaciones');
    }
  },

  /**
   * Obtiene medicaciones por ID del medicamento
   * @param {string} medicationId - GUID del medicamento
   * @returns {Promise<Array>}
   */
  getByMedicationId: async (medicationId) => {
    try {
      const response = await api.get(`/MedicationEmergency/by-medication/${medicationId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener medicaciones');
    }
  },

  /**
   * Obtiene medicaciones por nombre del medicamento
   * @param {string} medicationName - Nombre del medicamento
   * @returns {Promise<Array>}
   */
  getByMedicationName: async (medicationName) => {
    try {
      const response = await api.get(`/MedicationEmergency/by-medication-name?medicationName=${medicationName}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener medicaciones');
    }
  },

  /**
   * Crea una nueva medicación de emergencia
   * @param {Object} medicationEmergencyData - {
  "quantity": 10,
  "emergencyRoomCareId": "guid",
  "medicationId": "guid"
}
   * @returns {Promise<Object>}
   */
  create: async (medicationEmergencyData) => {
    try {
      const response = await api.post('/MedicationEmergency', medicationEmergencyData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear medicacion');
    }
  },

  /**
   * Actualiza una medicación de emergencia
   * @param {string} id - GUID de la medicación de emergencia
   * @param {Object} medicationEmergencyData - {
  "quantity": 10,
  "emergencyRoomCareId": "guid",
  "medicationId": "guid"
}
   * @returns {Promise<void>}
   */
  update: async (id, medicationEmergencyData) => {
    try {
      await api.put(`/MedicationEmergency/${id}`, medicationEmergencyData);
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar medicacion');
    }
  },

  /**
   * Elimina una medicación de emergencia
   * @param {string} id - GUID de la medicación de emergencia
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      await api.delete(`/MedicationEmergency/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar medicacion');
    }
  },
};