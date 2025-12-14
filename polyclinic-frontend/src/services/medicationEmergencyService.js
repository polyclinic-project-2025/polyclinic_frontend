import api from './api';

export const medicationEmergencyService = {
  /**
   * Obtiene todas las medicaciones de emergencia con información del medicamento
   * @returns {Promise<Array>}
   */
  getAllWithMedication: async () => {
    try {
      const response = await api.get('/MedicationEmergency');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener medicaciones de emergencia';
      throw new Error(errorMessage);
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
      return response.data;
    } catch (error) {
      console.error('Error al obtener medicación de emergencia:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener medicación de emergencia';
      throw new Error(errorMessage);
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
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener medicaciones por atención de emergencia';
      throw new Error(errorMessage);
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
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener medicaciones por medicamento';
      throw new Error(errorMessage);
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
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || 'Error al obtener medicaciones por nombre del medicamento';
      throw new Error(errorMessage);
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
      return response.data;
    } catch (error) {
      console.error('Error al crear medicación de emergencia:', error);
      console.error('Respuesta del error:', error.response);
      const errorMessage = error.response?.data?.errorMessage || 'Error al crear medicación de emergencia';
      throw new Error(errorMessage);
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
      console.error('Error al actualizar medicación de emergencia:', error);
      const errorMessage = error.response?.data?.errorMessage || 'Error al actualizar medicación de emergencia';
      throw new Error(errorMessage);
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
      const errorMessage = error.response?.data?.errorMessage || 'Error al eliminar medicación de emergencia';
      throw new Error(errorMessage);
    }
  },
};