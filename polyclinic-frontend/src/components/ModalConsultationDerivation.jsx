import { X, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { consultationDerivationService } from "../services/consultationDerivationService";
import Selector from "./Selector";
import CustomDatePicker from "./CustmonDatePicker";
import { departmentService } from "../services/departmentService";
import { derivationService, referralService } from "../services/derivationService";
import { employeeService } from "../services/employeeService.js";
import { departmentHeadService } from "../services/departmentHeadService";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";

const ModalConsultationDerivation = ({
  isOpen,
  onClose,
  loadConsultations,
  modalMode,
  selected = null,
}) => {
  const { user } = useAuth();
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
  const [loadingDepartment, setLoadingDepartment] = useState(false);

// Cargar datos cuando se abre en modo edición o creación
  useEffect(() => {
    const loadData = async () => {
      if (isOpen && modalMode === "edit" && selected) {
        setLoadingDepartment(true);
        const dateForPicker = new Date(selected.dateTimeCDer).toISOString();

        // Cargar datos de departamento y doctor para los selectores
        let departmentData = null;
        let doctorData = null;

        try {
          const departmentHeadId = selected.departmentHeadId;
          const head = await departmentHeadService.getById(departmentHeadId);
          const departmentId = head.departmentId;
          console.log(departmentId + " is departmentId");
          
          departmentData = 
          {
            departmentId: departmentId,
            name: selected.departmentName
          }

          const doctorId = selected.doctorId;
          const doctor = await employeeService.getById("doctor", doctorId);

          doctorData =
          {
            employeeId: doctorId,
            name: doctor.name
          }

        } catch (error) {
          console.error("Error cargando datos de edición:", error);
        } finally {
          setLoadingDepartment(false);
        }

        const editFormData = {
          patientId: selected.derivationId,
          patient: {
            id: selected.derivationId,
            derivationId: selected.derivationId,
            patientName: selected.patientName,
            name: selected.patientName
          },
          dateTime: dateForPicker,
          departmentId: departmentData?.departmentId || "",
          department: departmentData,
          doctorId: selected.doctorId,
          doctor: doctorData,
          diagnostic: selected.diagnosis,
        };
        console.log(editFormData.deparmentId + " editFormData");

        setFormData(editFormData);
      } else if (isOpen && modalMode === "create" && user?.id) {
        
        setLoadingDepartment(true);
        try {
          const profile = await userService.getProfile(user.id);
          console.log("profile: ", profile);
          
          
          if (profile?.profile?.departmentId) {
            const departmentId = profile.profile.departmentId;
            
            // Buscar el departamento completo
            const departments = await departmentService.getAll();
            const userDepartment = departments.find(d => d.departmentId === departmentId);
            
            if (userDepartment) {
              setFormData(prev => ({
                ...prev,
                departmentId: departmentId,
                department: userDepartment
              }));
            }
          }
        } catch (error) {
          console.error("Error cargando departamento del usuario:", error);
          // Si hay error, aún permitir crear la consulta sin departamento precargado
          setError("");
        } finally {
          setLoadingDepartment(false);
        }
      } else if (isOpen && modalMode === "create") {
        setFormData(initialData);
      }
    };

    loadData();
  }, [isOpen, modalMode, selected, user]);

  const handleClose = () => {
    setFormData(initialData);
    setError("");
    setSuccess("");
    onClose();
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
        
        if (!formData.patient?.derivationId && !formData.patientId) {
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
            derivationId: formData.patientId,
            doctorId: formData.doctorId,
            dateTimeCDer: new Date(formData.dateTime).toISOString(),
            departmentHeadId: departmentHeadId,
            diagnosis: formData.diagnostic.trim(),
        };
        console.log("dataToSend: ", dataToSend)

        if (modalMode === "create") {
            await consultationDerivationService.create(dataToSend);
            setSuccess("Consulta agregada exitosamente");
        } else if (selected != null) {
            await consultationDerivationService.update(selected.consultationDerivationId, dataToSend);
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
              service={derivationService}
              selected={formData.patient}
              onSelect={(patient) => {
                const updatedData = { 
                  ...formData, 
                  patient: patient,
                  patientId: patient?.derivationId,
                  patientDepartment : patient?.departmentToId
                };
                setFormData(updatedData);
              }}
              label="Paciente"
              placeholder="Selecciona un paciente"
              required={true}
              getItemId={(item) => item?.derivationId || item?.id}
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
              filterItems={(items) => {
                // Filtrar solo pacientes cuyo departmentTo coincida con el departamento seleccionado
                if (!formData.departmentId) return items;
                return items.filter(item => item.departmentToId === formData.departmentId);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento <span className="text-red-500">*</span>
              </label>
              {loadingDepartment ? (
                <div className="bg-cyan-50 rounded-lg border border-gray-300 px-4 py-3 w-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
                </div>
              ) : formData.department ? (
                <div className="bg-cyan-50 rounded-lg border border-cyan-300 px-4 py-3 w-full text-gray-700 font-medium">
                  {formData.department.name}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg border border-gray-300 px-4 py-3 w-full text-gray-400">
                  Cargando departamento...
                </div>
              )}
            </div>

            <Selector 
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
              getItemId={(item) => item?.employeeId}
              getDisplayText={(item) => item?.name || ''}
              getSearchableText={(item) => item?.name || ''}
              renderItem={(item, isSelected) => (
                <span className={isSelected ? 'font-semibold' : ''}>
                  {item.name}
                </span>
              )}
            />
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

export default ModalConsultationDerivation;