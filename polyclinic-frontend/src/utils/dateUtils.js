/**
 * dateUtils.js
 * 
 * Utilidades centralizadas para el manejo de fechas en el proyecto.
 * Resuelve problemas de zona horaria entre frontend y backend.
 * 
 * IMPORTANTE: Siempre use estas funciones en lugar de manipular fechas manualmente.
 * 
 * Categorías de funciones:
 * 
 * 1. BACKEND (DateOnly):
 *    - formatDateForBackend() - Enviar fechas al backend
 *    - parseDateFromBackend() - Recibir fechas del backend
 * 
 * 2. UTILIDADES:
 *    - getTodayDate() - Obtener fecha de hoy sin problemas de zona horaria
 *    - isDateBeforeToday() - Validar fechas pasadas
 *    - isDateDifferentFromToday() - Comparar con hoy
 *    - isSameDay() - Comparar dos fechas
 * 
 * 3. VISUALIZACIÓN:
 *    - formatDateForDisplay() - Formato largo: "sábado, 14 de diciembre de 2024"
 *    - formatDateShort() - Formato corto: "14/12/2024"
 *    - formatDateMedium() - Formato medio: "14/12/2024"
 *    - formatDateTimeForDisplay() - Formato con hora corto: "sáb, 14 dic 2024, 10:30"
 *    - formatDateTimeMedium() - Formato con hora medio: "14/12/2024, 10:30"
 *    - formatTimeOnly() - Solo hora: "10:30"
 */

/**
 * Formatea una fecha de JavaScript a formato YYYY-MM-DD para DateOnly del backend
 * sin problemas de zona horaria.
 * 
 * @param {Date} date - La fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForBackend = (date) => {
  if (!date) return null;
  
  // Validar que sea una fecha válida
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatDateForBackend: fecha inválida', date);
    return null;
  }

  // Usar getFullYear, getMonth y getDate para obtener la fecha local
  // sin conversión de zona horaria
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha en formato YYYY-MM-DD a un objeto Date local
 * sin problemas de zona horaria.
 * 
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {Date} Objeto Date configurado a las 12:00 hora local
 */
export const parseDateFromBackend = (dateString) => {
  if (!dateString) return null;
  
  // Crear fecha local sin conversión de zona horaria
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Crear fecha a las 12:00 hora local para evitar problemas de zona horaria
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  
  return date;
};

/**
 * Obtiene la fecha de hoy sin hora (solo fecha) configurada al mediodía
 * 
 * @returns {Date} Fecha de hoy a las 12:00 hora local
 */
export const getTodayDate = () => {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today;
};

/**
 * Compara si una fecha es anterior a hoy (ignorando la hora)
 * 
 * @param {Date} date - La fecha a comparar
 * @returns {boolean} true si la fecha es anterior a hoy
 */
export const isDateBeforeToday = (date) => {
  if (!date) return false;
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return compareDate < today;
};

/**
 * Formatea una fecha para mostrar en formato legible en español
 * Ejemplo: "sábado, 14 de diciembre de 2024"
 * 
 * @param {Date} date - La fecha a formatear
 * @returns {string} Fecha formateada en español
 */
export const formatDateForDisplay = (date) => {
  if (!date) return "";  
  // Si es un string en formato YYYY-MM-DD (DateOnly del backend), parsearlo correctamente
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parsedDate = parseDateFromBackend(date);
    return parsedDate.toLocaleDateString("es-ES", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
    return date.toLocaleDateString("es-ES", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatea una fecha y hora para mostrar en formato legible corto en español
 * Ejemplo: "sáb, 14 dic 2024, 10:30"
 * 
 * @param {Date} date - La fecha a formatear
 * @returns {string} Fecha y hora formateada en español
 */
export const formatDateTimeForDisplay = (date) => {
  if (!date) return "";
  return date.toLocaleString("es-ES", {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY)
 * Ejemplo: "14/12/2024"
 * 
 * @param {Date|string} date - La fecha a formatear
 * @returns {string} Fecha en formato DD/MM/YYYY
 */
export const formatDateShort = (date) => {
  if (!date) return "";
  
  // Si es un string en formato YYYY-MM-DD (DateOnly del backend), parsearlo correctamente
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parsedDate = parseDateFromBackend(date);
    return parsedDate.toLocaleDateString('es-ES');
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES');
};

/**
 * Formatea una fecha en formato medio con día, mes y año
 * Ejemplo: "14/12/2024"
 * 
 * @param {Date|string} date - La fecha a formatear
 * @returns {string} Fecha formateada como DD/MM/YYYY
 */
export const formatDateMedium = (date) => {
  if (!date) return "";
  
  // Si es un string en formato YYYY-MM-DD (DateOnly del backend), parsearlo correctamente
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parsedDate = parseDateFromBackend(date);
    return parsedDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formatea una fecha y hora completa en formato medio
 * Ejemplo: "14/12/2024, 10:30"
 * 
 * @param {Date|string} date - La fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTimeMedium = (date) => {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea solo la hora de una fecha
 * Ejemplo: "10:30"
 * 
 * @param {Date|string} date - La fecha de la cual extraer la hora
 * @returns {string} Hora formateada en formato 24h
 */
export const formatTimeOnly = (date) => {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Compara si dos fechas son del mismo día (ignorando hora)
 * 
 * @param {Date} date1 - Primera fecha
 * @param {Date} date2 - Segunda fecha
 * @returns {boolean} true si son del mismo día
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Compara si una fecha es diferente de hoy (ignorando hora)
 * 
 * @param {Date} date - La fecha a comparar
 * @returns {boolean} true si la fecha es diferente de hoy
 */
export const isDateDifferentFromToday = (date) => {
  if (!date) return true;
  return !isSameDay(date, new Date());
};
