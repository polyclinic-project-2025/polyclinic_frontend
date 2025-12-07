// services/userService.js
import api from './api';

export const userService = {
  /**
   * Obtiene todos los usuarios
   * @returns {Promise<Array>}
   */
  getAll: async () => {
    try {
      const response = await api.get('/User');
      
      // El backend devuelve { isSuccess, value, errorMessage }
      if (response.data.isSuccess) {
        return response.data.value || [];
      } else {
        throw new Error(response.data.errorMessage || 'Error al obtener usuarios');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || error.message || 'Error al obtener usuarios';
      throw new Error(errorMessage);
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

      const response = await api.patch(`/User/${id}`, patchData);
      
      if (response.data.isSuccess) {
        return response.data.value;
      } else {
        throw new Error(response.data.errorMessage || 'Error al actualizar usuario');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || error.message || 'Error al actualizar usuario';
      throw new Error(errorMessage);
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
      const response = await api.delete(`/User/${id}`);      
      if (response.data.isSuccess) {
        return response.data.value;
      } else {
        throw new Error(response.data.errorMessage || 'Error al eliminar usuario');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || error.message || 'Error al eliminar usuario';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene el tipo de perfil vinculado a un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<string>} - "Doctor" | "Nurse" | "WarehouseManager" | "Patient"
   */
  getProfileType: async (id) => {
    try {
      const response = await api.get(`/User/${id}/profile/type`);
      
      if (response.data.profileType) {
        return response.data.profileType;
      } else {
        throw new Error('Error al obtener el tipo de perfil');
      }
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'Error al obtener el tipo de perfil';
      throw new Error(errorMessage);
    }
  },

  /**
   * Obtiene el perfil completo vinculado a un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} - UserProfileResponse con userId, profileType y profile
   */
  getProfile: async (id) => {
    try {
      const response = await api.get(`/User/${id}/profile`);
      console.log(response.data, " data is success ", response.data.isSuccess);
      
      if (response.data) {
        return response.data;
      } 
      else {
        throw new Error(response.data.errorMessage || 'Error al obtener el perfil');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errorMessage || error.message || 'Error al obtener el perfil';
      throw new Error(errorMessage);
    }
  },
};