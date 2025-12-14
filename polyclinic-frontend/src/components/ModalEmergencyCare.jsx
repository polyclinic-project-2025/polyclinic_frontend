import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2, AlertCircle, Activity, Calendar, User, Clock } from "lucide-react";
import { emergencyRoomCareService } from "../services/emergencyRoomCareService";
import { emergencyRoomService } from "../services/emergencyRoomService";
import { patientService } from "../services/patientService";
import Selector from "./Selector";
import CustomDatePicker from "./CustmonDatePicker";
import { useAuth } from "../context/AuthContext";
import {
  getTodayDate,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  formatTimeOnly,
  isDateDifferentFromToday,
  formatDateShort
} from "../utils/dateUtils";

const ModalEmergencyCare = ({ 
  isOpen, 
  onClose, 
  modalMode, 
  selected, 
  onSuccess,
  isUserOnDuty 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: "",
    careDate: new Date(),
    emergencyRoomId: "",
    diagnosis: "",
    patient: null,
    emergencyRoom: null,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [loadingUserRoom, setLoadingUserRoom] = useState(false);
  const [userEmergencyRoom, setUserEmergencyRoom] = useState(null);
  const [formErrors, setFormErrors] = useState({
    careDate: false,
    diagnosis: false,
    patient: false
  });

  // Cargar la guardia del usuario
  const loadUserEmergencyRoom = useCallback(async () => {
    try {
      setLoadingUserRoom(true);
      const today = new Date().toISOString().split('T')[0];
      console.log("Buscando guardias para hoy:", today);
      
      const rooms = await emergencyRoomService.getByDate(today);
      console.log("Todas las guardias de hoy:", rooms);
      
      let foundRoom = null;
      
      if (rooms && rooms.length > 0) {
        foundRoom = rooms.find(room => {
          if (room.doctorId && user?.id && room.doctorId === user.id) {
            return true;
          }
          if (room.doctorEmail && user?.email && room.doctorEmail.toLowerCase() === user.email.toLowerCase()) {
            return true;
          }
          if (room.doctorName && user?.email) {
            const emailName = user.email.split('@')[0].toLowerCase();
            const doctorName = room.doctorName.toLowerCase();
            return doctorName.includes(emailName) || emailName.includes(doctorName);
          }
          return false;
        });
      }
      
      console.log("Guardia encontrada para el usuario:", foundRoom);
      
      if (foundRoom) {
        setUserEmergencyRoom(foundRoom);
        // Asignar automáticamente la guardia encontrada
        setFormData(prev => ({
          ...prev,
          emergencyRoomId: foundRoom.emergencyRoomId,
          emergencyRoom: foundRoom
        }));
      } else {
        setUserEmergencyRoom(null);
      }
      
    } catch (err) {
      console.error("Error cargando guardia del usuario:", err);
      setUserEmergencyRoom(null);
    } finally {
      setLoadingUserRoom(false);
    }
  }, [user]);

  useEffect(() => {
    console.log("Selected care data:", selected);
    
    if (isOpen) {
      // Cargar guardia del usuario en ambos modos
      loadUserEmergencyRoom();
      
      if (modalMode === "edit" && selected) {
        // Usar la fecha/hora existente al editar
        const dateForPicker = new Date(selected.careDate);
        
        setFormData({
          patientId: selected.patientId,
          patient: {
            patientId: selected.patientId,
            id: selected.patientId,
            name: selected.patientName,
            identification: selected.patientIdentification
          },
          careDate: dateForPicker, // Mantener la fecha/hora original
          emergencyRoomId: selected.emergencyRoomId,
          emergencyRoom: {
            emergencyRoomId: selected.emergencyRoomId,
            doctorName: selected.doctorName,
            guardDate: selected.careDate?.split('T')[0]
          },
          diagnosis: selected.diagnosis || "",
        });
      } else if (modalMode === "create") {
        // Al crear, usar la fecha/hora actual
        const now = new Date();
        setFormData({
          patientId: "",
          careDate: now, // Usar fecha/hora actual
          emergencyRoomId: "",
          diagnosis: "",
          patient: null,
          emergencyRoom: null,
        });
      }
      
      // Limpiar errores al abrir
      setFormErrors({
        careDate: false,
        diagnosis: false,
        patient: false
      });
    }
  }, [isOpen, modalMode, selected, loadUserEmergencyRoom]);

  const handleClose = () => {
    setFormData({
      patientId: "",
      careDate: new Date(),
      emergencyRoomId: "",
      diagnosis: "",
      patient: null,
      emergencyRoom: null,
    });
    setUserEmergencyRoom(null);
    setError("");
    setSuccess("");
    setFormErrors({
      careDate: false,
      diagnosis: false,
      patient: false
    });
    onClose();
  };

  // Manejar cambio de fecha
  const handleDateChange = (date) => {
    console.log("Fecha seleccionada:", date);
    
    if (!date) {
      setFormData({ ...formData, careDate: null });
      setFormErrors(prev => ({ ...prev, careDate: true }));
      setError("La fecha de atención es obligatoria");
      return;
    }

    // Verificar si la fecha es diferente de hoy
    if (isDateDifferentFromToday(date)) {
      setFormErrors(prev => ({ ...prev, careDate: true }));
      setError("La atención debe ser para el día de hoy");
    } else {
      setFormErrors(prev => ({ ...prev, careDate: false }));
      setError("");
    }

    // Preservar la hora actual cuando se cambia solo la fecha
    const currentTime = formData.careDate || new Date();
    const newDateWithCurrentTime = new Date(date);
    
    // Mantener la hora actual (para creación) o la hora existente (para edición)
    newDateWithCurrentTime.setHours(
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds(),
      currentTime.getMilliseconds()
    );
    
    setFormData({ ...formData, careDate: newDateWithCurrentTime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validar campos antes de enviar
    const errors = {
      careDate: !formData.careDate || isDateDifferentFromToday(formData.careDate),
      diagnosis: !formData.diagnosis || formData.diagnosis.trim() === "",
      patient: !formData.patientId && !formData.patient?.patientId
    };
    
    setFormErrors(errors);

    // Verificar si hay errores
    if (errors.careDate || errors.diagnosis || errors.patient) {
      const errorMessages = [];
      if (errors.careDate) errorMessages.push("La fecha debe ser el día de hoy");
      if (errors.diagnosis) errorMessages.push("El diagnóstico es obligatorio");
      if (errors.patient) errorMessages.push("Debe seleccionar un paciente");
      
      setError(`Por favor: ${errorMessages.join(", ")}`);
      setSubmitting(false);
      return;
    }

    // Validar guardia del usuario
    if (!userEmergencyRoom) {
      setError("No tiene una guardia asignada para hoy. Solo puede crear/editar atenciones cuando está de guardia.");
      setSubmitting(false);
      return;
    }

    try {
      const selectedPatientId = formData.patientId || formData.patient?.patientId;
      
      console.log("=== Datos del formulario ===");
      console.log("Paciente ID:", selectedPatientId);
      console.log("Guardia asignada:", userEmergencyRoom);
      console.log("Fecha de atención:", formData.careDate);
      console.log("Fecha ISO:", formData.careDate.toISOString());
      console.log("Hora exacta:", `${formData.careDate.getHours()}:${formData.careDate.getMinutes()}:${formData.careDate.getSeconds()}`);
      
      // Usar siempre la guardia del usuario
      const emergencyRoomIdToUse = userEmergencyRoom.emergencyRoomId;

      const dataToSend = {
        patientId: selectedPatientId,
        emergencyRoomId: emergencyRoomIdToUse,
        careDate: formData.careDate.toISOString(), // Enviar datetime completo con hora actual
        diagnosis: formData.diagnosis.trim(),
      };

      console.log("Enviando datos atención:", dataToSend);

      if (modalMode === "create") {
        const result = await emergencyRoomCareService.create(dataToSend);
        console.log("Respuesta creación atención:", result);
        setSuccess("Atención creada exitosamente");
      } else if (selected) {
        console.log("Actualizando atención ID:", selected.emergencyRoomCareId || selected.id);
        await emergencyRoomCareService.update(
          selected.emergencyRoomCareId || selected.id,
          dataToSend
        );
        setSuccess("Atención actualizada exitosamente");
      }

      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 800);
    } catch (err) {
      console.error("Error completo en handleSubmit:", err);
      const errorMessage = err.message || "Error al guardar atención";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const today = getTodayDate();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8" // my-8 para margen vertical
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === "create" ? "Nueva Atención" : "Editar Atención"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Fecha de hoy: {formatDateForDisplay(today)}
          </p>
        </div>

        {/* Contenido con scroll */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto"> {/* Altura máxima con scroll */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Atención <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <CustomDatePicker
                  selected={formData.careDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  minDate={today}
                  maxDate={today}
                  isClearable={true}
                  placeholderText="Seleccione la fecha"
                  filterDate={(date) => {
                    // Solo permitir fechas de hoy
                    const compareDate = new Date(date);
                    compareDate.setHours(0, 0, 0, 0);
                    return compareDate.getTime() === today.getTime();
                  }}
                  onKeyDown={(e) => {
                    // Permitir seleccionar todo el texto con Ctrl+A o Cmd+A
                    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                      e.target.select();
                    }
                    // Permitir borrar con Delete o Backspace
                    if (e.key === 'Delete' || e.key === 'Backspace') {
                      // El CustomDatePicker manejará la limpieza
                    }
                  }}
                />
                {formErrors.careDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {!formData.careDate 
                      ? "La fecha de atención es obligatoria" 
                      : "La atención debe ser para el día de hoy"}
                  </p>
                )}
                {formData.careDate && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Fecha seleccionada: {formatDateForDisplay(formData.careDate)}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Hora: {formatTimeOnly(formData.careDate)}
                    </p>
                    {isDateDifferentFromToday(formData.careDate) && (
                      <p className="text-xs text-red-600 font-medium">
                        ⚠️ La atención debe ser para hoy. Seleccione la fecha de hoy.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => {
                    setFormData({ ...formData, diagnosis: e.target.value });
                    setFormErrors(prev => ({ ...prev, diagnosis: false }));
                    setError("");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ingrese el diagnóstico"
                />
                {formErrors.diagnosis && (
                  <p className="mt-1 text-sm text-red-600">
                    El diagnóstico es obligatorio
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente <span className="text-red-500">*</span>
              </label>
              <Selector
                service={patientService}
                selected={formData.patient}
                onSelect={(patient) => {
                  console.log("Paciente seleccionado:", patient);
                  setFormData({ 
                    ...formData, 
                    patient: patient,
                    patientId: patient?.patientId || patient?.id || ""
                  });
                  setFormErrors(prev => ({ ...prev, patient: false }));
                  setError("");
                }}
                label="Seleccionar Paciente"
                placeholder="Busca y selecciona un paciente"
                required={true}
                getItemId={(item) => item?.patientId || item?.id}
                getDisplayText={(item) => item?.name || ''}
                getSearchableText={(item) => 
                  `${item.name || ''} ${item.identification || ''}`.trim()
                }
                renderItem={(item, isSelected) => (
                  <div className="flex flex-col">
                    <span className={isSelected ? 'font-semibold' : ''}>
                      {item.name}
                    </span>
                    {item.identification && (
                      <span className="text-xs text-gray-500">
                        CI: {item.identification}
                      </span>
                    )}
                  </div>
                )}
              />
              {formErrors.patient && (
                <p className="mt-1 text-sm text-red-600">
                  Por favor, seleccione un paciente
                </p>
              )}
            </div>

            {/* INFORMACIÓN DE GUARDIA - Para ambos modos (creación y edición) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Información de Guardia
              </label>
              
              {loadingUserRoom ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
                  <span className="ml-2 text-gray-600">Buscando tu guardia asignada...</span>
                </div>
              ) : userEmergencyRoom ? (
                <div className={`p-4 rounded-lg border ${
                  modalMode === "create" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      modalMode === "create" ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      <User className={`w-5 h-5 ${
                        modalMode === "create" ? "text-green-600" : "text-blue-600"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium mb-1 ${
                        modalMode === "create" ? "text-green-800" : "text-blue-800"
                      }`}>
                        {modalMode === "create" ? "Guardia Asignada para Hoy" : "Guardia Asignada (No editable)"}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className={`text-xs ${
                            modalMode === "create" ? "text-green-600" : "text-blue-600"
                          }`}>Doctor:</p>
                          <p className="font-medium text-gray-900">{userEmergencyRoom.doctorName}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${
                            modalMode === "create" ? "text-green-600" : "text-blue-600"
                          }`}>CI:</p>
                          <p className="font-medium text-gray-900">{userEmergencyRoom.doctorIdentification}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${
                            modalMode === "create" ? "text-green-600" : "text-blue-600"
                          }`}>Fecha:</p>
                          <p className="font-medium text-gray-900">
                            {formatDateShort(userEmergencyRoom.guardDate)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${
                            modalMode === "create" ? "text-green-600" : "text-blue-600"
                          }`}>ID Guardia:</p>
                          <p className="font-medium text-gray-900">{userEmergencyRoom.emergencyRoomId}</p>
                        </div>
                      </div>
                      <p className={`text-xs mt-2 ${
                        modalMode === "create" ? "text-green-600" : "text-blue-600"
                      }`}>
                        {modalMode === "create" 
                          ? "Esta guardia se asignará automáticamente a la atención." 
                          : "La guardia no se puede modificar en la edición."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800 mb-1">
                        No tienes guardia asignada
                      </h3>
                      <p className="text-sm text-red-700">
                        No se encontró una guardia asignada para ti en el día de hoy.
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Solo puedes crear/editar atenciones cuando tienes una guardia asignada.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer fijo */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || !userEmergencyRoom}
            className={`flex-1 px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
              submitting || !userEmergencyRoom
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-cyan-600 text-white hover:bg-cyan-700"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : modalMode === "create" ? (
              "Crear Atención"
            ) : (
              "Actualizar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEmergencyCare;