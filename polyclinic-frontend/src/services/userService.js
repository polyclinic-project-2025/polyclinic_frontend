// services/userService.js
import api from './api';

export const userService = {
  /**
   * Obtiene todos los usuarios
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const data = await api.get('/User');
      return data || [];
    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuarios');
    }
  },

  /**
   * Actualiza un campo específico del usuario usando PATCH
   * @param {string} id - ID del usuario
   * @param {string} property - "Email" | "PhoneNumber" | "Roles"
   * @param {string} value - Nuevo valor (para Email y PhoneNumber)
   * @param {string} operation - "replace" | "add" | "remove"
   * @param {Array<string>} roles - Array de roles (solo para Roles)
   * @returns {Promise<void>}
   */
  patchField: async (id, property, value = null, operation = "replace", roles = null) => {
    try {
      const patchData = {
        property,
        operation,
      };

      if (property === "Roles" && roles) {
        patchData.roles = roles;
      } else if (value !== null) {
        patchData.value = value;
      }

      const data = await api.patch(`/User/${id}`, patchData);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar usuario');
    }
  },

  /**
   * Actualiza múltiples campos de un usuario (versión legacy para compatibilidad)
   * @param {string} id - ID del usuario
   * @param {Object} userData - { email, phoneNumber, roles }
   * @returns {Promise<void>}
   */
  patch: async (id, userData) => {
    try {
      // Si es el formato antiguo con property/value/operation, usar directamente
      if (userData.property) {
        return await userService.patchField(
          id,
          userData.property,
          userData.value,
          userData.operation,
          userData.roles
        );
      }

      // Si no, actualizar campo por campo
      const results = [];

      if (userData.email) {
        const result = await userService.patchField(id, "Email", userData.email, "replace");
        results.push(result);
      }

      if (userData.phoneNumber !== undefined) {
        const result = await userService.patchField(id, "PhoneNumber", userData.phoneNumber, "replace");
        results.push(result);
      }

      if (userData.roles && Array.isArray(userData.roles)) {
        const result = await userService.patchField(id, "Roles", null, "replace", userData.roles);
        results.push(result);
      }

      return results[results.length - 1]; // Retornar el último resultado
    } catch (error) {
      throw error;
    }
  },

  /**
   * Elimina un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    try {
      const data = await api.delete(`/User/${id}`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar usuario');
    }
  },

  /**
   * Obtiene el tipo de perfil vinculado a un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<string>} - "Doctor" | "Nurse" | "WarehouseManager" | "Patient"
   */
  getProfileType: async (id) => {
    try {
      const data = await api.get(`/User/${id}/profile/type`);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener el tipo de perfil');
    }
  },

  /**
   * Obtiene el perfil completo vinculado a un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} - UserProfileResponse con userId, profileType y profile
   */
  getProfile: async (id) => {
    try {
      const data = await api.get(`/User/${id}/profile`);
      console.log(data, " data from profile ");
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener el perfil');
    }
  },

  /**
   * Exporta usuarios a PDF
   * @returns {Promise<string>} - URL de descarga del PDF
   */
  exportToPdf: async () => {
    try {
      const result = await api.get('/User/export');

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
      throw new Error(error.message || 'Error al exportar usuarios');
    }
  },
};