import { X, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { consultationReferralService } from "../services/consultationReferralService";
import Selector from "./Selector";
import CustomDatePicker from "./CustmonDatePicker";
import { departmentService } from "../services/departmentService";
import { referralService } from "../services/referralService";
import { departmentHeadService } from "../services/departmentHeadService";

const ModalConsultation = ({
  isOpen,
  onClose,
  loadConsultations,
  modalMode,
  selected = null,
}) => {
  const initialData = {
    patientId: "",
    dateTime: new Date(),
    departmentId: "",
    doctorId: "",
    diagnostic: "",
    patient: null,
    department: null,
    doctor: null,
  };

  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  // Cargar datos cuando se abre en modo edición
  useEffect(() => {
    const loadEditData = async () => {
      if (isOpen && modalMode === "edit" && selected) {
        const dateForPicker = new Date(selected.dateTimeCRem).toISOString();

        // Cargar datos de departamento y doctor para los selectores
        let departmentData = null;
        let doctorData = null;

        try {
          // Obtener el departamento del doctor
          if (selected.doctorId) {
            const departments = await departmentService.getAll();
            
            // Buscar el departamento que contiene a este doctor
            for (const dept of departments) {
              const doctors = await departmentService.getDoctors(dept.departmentId);
              const doctorFound = doctors.find(d => d.employeeId === selected.doctorId);
              
              if (doctorFound) {
                departmentData = {
                  id: dept.departmentId,
                  departmentId: dept.departmentId,
                  name: dept.name
                };
                doctorData = {
                  id: doctorFound.employeeId,
                  employeeId: doctorFound.employeeId,
                  name: doctorFound.name
                };
                break;
              }
            }
          }
        } catch (error) {
          console.error("Error cargando datos de edición:", error);
        }

        const editFormData = {
          patientId: selected.referralId,
          patient: {
            id: selected.referralId,
            referralId: selected.referralId,
            patientName: selected.patientFullName,
            name: selected.patientFullName
          },
          dateTime: dateForPicker,
          departmentId: departmentData?.departmentId || "",
          department: departmentData,
          doctorId: selected.doctorId,
          doctor: doctorData,
          diagnostic: selected.diagnosis,
        };
        
        setFormData(editFormData);
      } else if (isOpen && modalMode === "create") {
        setFormData(initialData);
      }
    };

    loadEditData();
  }, [isOpen, modalMode, selected]);

  const handleClose = () => {
    setFormData(initialData);
    setError("");
    setSuccess("");
    onClose();
  };

  // Manejar cambio de departamento y resetear doctor
  const handleDepartmentChange = (department) => {
    const updatedFormData = { 
      ...formData, 
      department: department,
      departmentId: department?.departmentId || "",
      doctor: null,
      doctorId: "" 
    };
    
    setFormData(updatedFormData);
  };

  const getDepartmentHeadId = async (departmentId) => {
    
    try {
        const departmentHeads = await departmentHeadService.getAll();
        const foundDepartmentHead = departmentHeads.find(head => 
        head.departmentId === formData.departmentId);
        var result = foundDepartmentHead.departmentHeadId;
        return result;    
      } catch (error) {
      
        return null;
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      
      if (!formData.patient?.referralId && !formData.patientId) {
        throw new Error("Debe seleccionar un paciente");
      }

      if (!formData.doctor?.employeeId && !formData.doctorId) {
        throw new Error("Debe seleccionar un doctor");
      }

      if (!formData.department?.departmentId && !formData.departmentId) {
        throw new Error("Debe seleccionar un departamento");
      }

      if (!formData.diagnostic || formData.diagnostic.trim() === "") {
        throw new Error("Debe ingresar un diagnóstico");
      }
      
      const departmentHeadId = await getDepartmentHeadId(formData.departmentId);

      if (!departmentHeadId) {
        throw new Error("No se pudo obtener el jefe de departamento");
      }

      const dataToSend = {
        referralId: formData.patientId,
        doctorId: formData.doctorId,
        dateTimeCRem: new Date(formData.dateTime).toISOString(),
        departmentHeadId: departmentHeadId,
        diagnosis: formData.diagnostic.trim(),
      };
      console.log("dataToSend: ", dataToSend)

      if (modalMode === "create") {
        await consultationReferralService.create(dataToSend);
        setSuccess("Consulta agregada exitosamente");
      } else if (selected != null) {
        await consultationReferralService.update(selected.consultationReferralId, dataToSend);
        setSuccess("Consulta actualizada exitosamente");
      }
      
      // Cerrar el modal inmediatamente y luego recargar
      setTimeout(() => {
        handleClose();
        loadConsultations();
      }, 800);
    } catch (err) {
      const errorMessage = err.message || "Error al guardar consulta";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {modalMode === "create" ? "Nueva Consulta" : "Editar Consulta"}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de la Consulta <span className="text-red-500">*</span>
              </label>
              <CustomDatePicker
                selected={formData.dateTime}
                onChange={(date) =>
                  setFormData({ ...formData, dateTime: date })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.diagnostic}
                onChange={(e) =>
                  setFormData({ ...formData, diagnostic: e.target.value })
                }
                className="bg-cyan-50 rounded-lg border border-gray-300 px-4 py-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <Selector
              service={referralService}
              selected={formData.patient}
              onSelect={(patient) => {
                const updatedData = { 
                  ...formData, 
                  patient: patient,
                  patientId: patient?.referralId
                };
                setFormData(updatedData);
              }}
              label="Paciente"
              placeholder="Selecciona un paciente"
              required={true}
              getItemId={(item) => item?.referralId || item?.id}
              getDisplayText={(item) => item?.patientName || item?.name || ''}
              getSearchableText={(item) => {
                const searchText = [
                  item?.patientName || '',
                  item?.patientIdentification || '',
                  item?.name || ''
                ].filter(Boolean).join(' ');
                return searchText;
              }}
              renderItem={(item, isSelected) => (
                <div className="flex flex-col">
                  <span className={isSelected ? 'font-semibold' : ''}>
                    {item.patientName || item.name}
                  </span>
                  {item.patientIdentification && (
                    <span className="text-xs text-gray-500">
                      CI: {item.patientIdentification}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Selector
              service={departmentService}
              selected={formData.department}
              onSelect={handleDepartmentChange}
              label="Departamento"
              placeholder="Selecciona un departamento"
              required={true}
              getItemId={(item) => item?.departmentId || item?.id}
              getDisplayText={(item) => item?.name || ''}
              getSearchableText={(item) => item?.name || ''}
              renderItem={(item, isSelected) => (
                <span className={isSelected ? 'font-semibold' : ''}>
                  {item.name}
                </span>
              )}
            />
            
            {formData.departmentId ? (
              <Selector
                key={formData.departmentId} 
                service={departmentService}
                method="getDoctors"
                methodParams={formData.departmentId}
                selected={formData.doctor}
                onSelect={(doctor) => {
                  const updatedData = { 
                    ...formData, 
                    doctor: doctor,
                    doctorId: doctor?.employeeId || ""
                  };
                  setFormData(updatedData);
                }}
                label="Doctor"
                placeholder="Selecciona un doctor"
                required={true}
                getItemId={(item) => item?.employeeId || item?.id}
                getDisplayText={(item) => item?.name || ''}
                getSearchableText={(item) => item?.name || ''}
                renderItem={(item, isSelected) => (
                  <span className={isSelected ? 'font-semibold' : ''}>
                    {item.name}
                  </span>
                )}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-400 flex items-center justify-center">
                  <span>Primero selecciona un departamento</span>
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

        <div className="flex gap-3 p-6 pt-4 bg-white border-t rounded-b-2xl">
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
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : modalMode === "create" ? (
              "Crear"
            ) : (
              "Actualizar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConsultation;