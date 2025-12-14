import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Calendar } from "lucide-react";
import { emergencyRoomService } from "../services/emergencyRoomService";
import { employeeService } from "../services/employeeService";
import Selector from "./Selector";
import CustomDatePicker from "./CustmonDatePicker";
import { useAuth } from "../context/AuthContext";
import { 
  formatDateForBackend, 
  parseDateFromBackend,
  getTodayDate,
  isDateBeforeToday,
  formatDateForDisplay
} from "../utils/dateUtils";

const ModalEmergencyGuard = ({ isOpen, onClose, modalMode, selected, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    doctorId: "",
    guardDate: new Date(),
    doctor: null,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [formErrors, setFormErrors] = useState({
    doctor: false,
    guardDate: false
  });

  useEffect(() => {
    console.log("Selected guard data:", selected);
    
    if (isOpen && modalMode === "edit" && selected) {
      const dateForPicker = parseDateFromBackend(selected.guardDate);
      
      // Cargar datos completos del doctor para el selector
      const loadDoctorData = async () => {
        try {
          setLoadingDoctor(true);
          console.log("Cargando doctor con ID:", selected.doctorId);
          
          // Obtener el doctor completo del servicio
          const doctor = await employeeService.getById('doctor', selected.doctorId);
          console.log("Doctor cargado para edición:", doctor);
          
          setFormData({
            doctorId: selected.doctorId,
            guardDate: dateForPicker,
            doctor: {
              employeeId: doctor.employeeId,  // ← Usar employeeId del objeto doctor
              identification: doctor.identification,
              name: doctor.name,
              employmentStatus: doctor.employmentStatus,
              departmentId: doctor.departmentId
            },
          });
        } catch (err) {
          console.error("Error cargando doctor:", err);
          // Si falla, usar los datos básicos de la guardia
          setFormData({
            doctorId: selected.doctorId,
            guardDate: dateForPicker,
            doctor: {
              employeeId: selected.doctorId,  // Asumir que doctorId = employeeId
              name: selected.doctorName,
              identification: selected.doctorIdentification
            },
          });
        } finally {
          setLoadingDoctor(false);
        }
      };
      
      loadDoctorData();
    } else if (isOpen && modalMode === "create") {
      // En modo creación, establecer fecha inicial como hoy
      setFormData({
        doctorId: "",
        guardDate: getTodayDate(),
        doctor: null,
      });
      // Limpiar errores al abrir en modo creación
      setFormErrors({
        doctor: false,
        guardDate: false
      });
    }
  }, [isOpen, modalMode, selected]);

  const handleClose = () => {
    setFormData({
      doctorId: "",
      guardDate: new Date(),
      doctor: null,
    });
    setError("");
    setSuccess("");
    setFormErrors({
      doctor: false,
      guardDate: false
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validar campos antes de enviar
    const errors = {
      doctor: !formData.doctor?.employeeId && !formData.doctorId,
      guardDate: !formData.guardDate
    };
    
    setFormErrors(errors);

    // Verificar si hay errores de campos vacíos
    if (errors.doctor || errors.guardDate) {
      setError("Por favor, complete todos los campos obligatorios (*)");
      setSubmitting(false);
      return;
    }

    // Validar que la fecha no sea en el pasado
    if (isDateBeforeToday(formData.guardDate)) {
      setFormErrors(prev => ({ ...prev, guardDate: true }));
      setError("No puede asignar guardias en fechas pasadas");
      setSubmitting(false);
      return;
    }

    try {
      // DEBUG: Verificar qué tenemos en formData
      console.log("=== DEBUG handleSubmit ===");
      console.log("formData.doctorId:", formData.doctorId);
      console.log("formData.doctor:", formData.doctor);
      console.log("formData.doctor?.employeeId:", formData.doctor?.employeeId);
      console.log("formData.guardDate:", formData.guardDate);
      console.log("formData.guardDate tipo:", typeof formData.guardDate);
      console.log("¿Es fecha pasada?:", isDateBeforeToday(formData.guardDate));
      
      // IMPORTANTE: Usar employeeId del doctor, no doctorId del formulario
      const selectedDoctorId = formData.doctor?.employeeId || formData.doctorId;
      console.log("Doctor ID a enviar (employeeId):", selectedDoctorId);
      
      if (!selectedDoctorId) {
        console.error("ERROR: No hay employeeId seleccionado");
        throw new Error("Debe seleccionar un doctor");
      }

      // Validar que la fecha no sea nula
      if (!formData.guardDate) {
        throw new Error("La fecha de guardia es obligatoria");
      }

      // Validar que la fecha sea un objeto Date válido
      if (!(formData.guardDate instanceof Date) || isNaN(formData.guardDate.getTime())) {
        throw new Error("La fecha seleccionada no es válida");
      }

      // Validar que la fecha no sea en el pasado (segunda verificación)
      if (isDateBeforeToday(formData.guardDate)) {
        throw new Error("No puede asignar guardias en fechas pasadas");
      }

      const dataToSend = {
        doctorId: selectedDoctorId,  // ← Esto debe ser el employeeId del doctor
        guardDate: formatDateForBackend(formData.guardDate),
      };

      console.log("=== FECHA FINAL ===");
      console.log("guardDate objeto Date:", formData.guardDate);
      console.log("guardDate.getFullYear():", formData.guardDate.getFullYear());
      console.log("guardDate.getMonth():", formData.guardDate.getMonth());
      console.log("guardDate.getDate():", formData.guardDate.getDate());
      console.log("guardDate formateada:", dataToSend.guardDate);
      console.log("===================");
      console.log("Enviando datos guardia al backend:", dataToSend);

      if (modalMode === "create") {
        const result = await emergencyRoomService.create(dataToSend);
        console.log("Respuesta creación guardia:", result);
        setSuccess("Guardia creada exitosamente");
      } else if (selected) {
        console.log("Actualizando guardia ID:", selected.emergencyRoomId);
        await emergencyRoomService.update(selected.emergencyRoomId, dataToSend);
        setSuccess("Guardia actualizada exitosamente");
      }

      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 800);
    } catch (err) {
      console.error("Error completo en handleSubmit:", err);
      const errorMessage = err.message || "Error al guardar guardia";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (date) => {
    console.log("Fecha seleccionada original:", date);
    
    // Si la fecha es null, establecerla como null
    if (!date) {
      setFormData({ ...formData, guardDate: null });
      setFormErrors(prev => ({ ...prev, guardDate: false }));
      setError("");
      return;
    }

    // Crear una nueva fecha configurada al mediodía para evitar problemas de zona horaria
    const normalizedDate = new Date(date);
    normalizedDate.setHours(12, 0, 0, 0);
    
    console.log("Fecha normalizada:", normalizedDate);
    console.log("Fecha normalizada ISO:", normalizedDate.toISOString());
    console.log("Fecha formateada para backend:", formatDateForBackend(normalizedDate));

    // Verificar si la fecha es en el pasado
    if (isDateBeforeToday(normalizedDate)) {
      setFormErrors(prev => ({ ...prev, guardDate: true }));
      setError("No puede seleccionar fechas pasadas");
    } else {
      // Si la fecha es válida, limpiar errores
      setFormErrors(prev => ({ ...prev, guardDate: false }));
      setError("");
    }

    setFormData({ ...formData, guardDate: normalizedDate });
  };

  if (!isOpen) return null;

  const today = getTodayDate();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === "create" ? "Nueva Guardia" : "Editar Guardia"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor <span className="text-red-500">*</span>
            </label>
            {modalMode === "edit" && loadingDoctor ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
                <span className="ml-2 text-gray-600">Cargando datos del doctor...</span>
              </div>
            ) : (
              <>
                <Selector
                  service={employeeService}
                  method="getAllByType"
                  methodParams="doctor"
                  selected={formData.doctor}
                  onSelect={(doctor) => {
                    console.log("=== Doctor seleccionado del Selector ===");
                    console.log("Objeto doctor completo:", doctor);
                    console.log("doctor.employeeId:", doctor?.employeeId);
                    console.log("doctor.identification:", doctor?.identification);
                    console.log("doctor.name:", doctor?.name);
                    
                    // IMPORTANTE: Usar employeeId, no doctorId
                    setFormData({ 
                      ...formData, 
                      doctor: doctor,
                      doctorId: doctor?.employeeId || ""  // ← Guardar employeeId
                    });
                    
                    // Limpiar error de doctor al seleccionar uno
                    setFormErrors(prev => ({ ...prev, doctor: false }));
                    setError("");
                    
                    console.log("formData actualizado:", {
                      doctorId: doctor?.employeeId || "",
                      doctor: doctor
                    });
                  }}
                  label="Seleccionar Doctor"
                  placeholder="Busca y selecciona un doctor"
                  required={true}
                  getItemId={(item) => item?.employeeId}  // ← Usar employeeId como ID
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
                      {item.departmentId && (
                        <span className="text-xs text-gray-500">
                          Dept ID: {item.departmentId.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  )}
                />
                {formErrors.doctor && (
                  <p className="mt-1 text-sm text-red-600">
                    Por favor, seleccione un doctor
                  </p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Guardia <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <CustomDatePicker
                selected={formData.guardDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                minDate={today}
                isClearable={true}
                placeholderText="Seleccione una fecha"
                filterDate={(date) => {
                  // Filtrar fechas pasadas (ya lo hace minDate, pero por seguridad)
                  const compareDate = new Date(date);
                  compareDate.setHours(0, 0, 0, 0);
                  return compareDate >= today;
                }}
              />
              {formErrors.guardDate && (
                <p className="mt-1 text-sm text-red-600">
                  {formData.guardDate && isDateBeforeToday(formData.guardDate)
                    ? "No puede seleccionar fechas pasadas"
                    : "Por favor, seleccione una fecha de guardia"}
                </p>
              )}
              {formData.guardDate && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    Fecha seleccionada: {formatDateForDisplay(formData.guardDate)}
                  </p>
                  {isDateBeforeToday(formData.guardDate) && (
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ Esta fecha ya pasó. Seleccione una fecha futura.
                    </p>
                  )}
                </div>
              )}
            </div>
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

        <div className="flex gap-3 p-6 pt-4 border-t">
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
            className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={submitting || (modalMode === "edit" && loadingDoctor)}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : modalMode === "create" ? (
              "Crear Guardia"
            ) : (
              "Actualizar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEmergencyGuard;