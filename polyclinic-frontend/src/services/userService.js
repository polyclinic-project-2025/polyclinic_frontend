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
      console.log('📦 Respuesta completa del backend:', response.data);
      
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

      console.log('📤 Enviando PATCH:', patchData);
      const response = await api.patch(`/User/${id}`, patchData);
      console.log('📦 Respuesta de actualización:', response.data);
      
      if (response.data.isSuccess) {
        return response.data.value;
      } else {
        throw new Error(response.data.errorMessage || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error("❌ Error en userService.patchField:", error.response?.data);
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
      console.error("❌ Error en userService.patch:", error);
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
      console.log('📦 Respuesta de eliminación:', response.data);
      
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
};