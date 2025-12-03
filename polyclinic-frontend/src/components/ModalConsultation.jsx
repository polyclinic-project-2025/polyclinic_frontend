import { X, AlertCircle, Loader2, MinusCircle } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { consultationReferralService } from "../services/consultationReferralService";
import Selector from "./Selector";
import CustomDatePicker from "./CustmonDatePicker";
import { patientService } from "../services/patientService";
import { departmentService } from "../services/departmentService";
import { referralService } from "../services/referralService";

const ModalConsultation = ({
  isOpen,
  onClose,
  loadConsultations,
  modalMode,
  selected = null,
}) => {
  const initialData = {
    patientId: "",
    dateTime: "",
    departmentId: "",
    doctorId: "",
    diagnostic: "",
    medication: [],
    patient: null,
    department: null,
    doctor: null,
  };

  const [newMedication, setNewMedication] = useState({
    name: null,
    dosage: "",
    frequency: "",
  });

  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  // Cargar datos cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && modalMode === "edit" && selected) {
      const dateForPicker = selected.dateTimeCRem 
        ? new Date(selected.dateTimeCRem) 
        : "";

      setFormData({
        patientId: selected.patientId || selected.referralId || "",
        patient: { 
          id: selected.patientId || selected.referralId,
          patientName: selected.patientFullName || selected.patientName,
          name: selected.patientFullName || selected.patientName
        },
        dateTime: dateForPicker,
        departmentId: selected.departmentId || "",
        department: { 
          id: selected.departmentId, 
          name: selected.departmentName 
        },
        doctorId: selected.doctorId || "",
        doctor: { 
          id: selected.doctorId, 
          name: selected.doctorFullName 
        },
        diagnostic: selected.diagnosis || "",
        medication: selected.medication || [],
      });
    } else if (isOpen && modalMode === "create") {
      setFormData(initialData);
    }
  }, [isOpen, modalMode, selected]);

  const handleClose = () => {
    setFormData(initialData);
    setNewMedication({ name: null, dosage: "", frequency: "" });
    setError("");
    setSuccess("");
    onClose();
  };

  const handleAddMedication = useCallback(() => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      setFormData((prevData) => ({
        ...prevData,
        medication: [
          ...prevData.medication,
          {
            ...newMedication,
            name: newMedication.name.name || newMedication.name,
          },
        ],
      }));

      setNewMedication({ name: null, dosage: "", frequency: "" });
    } else {
      setError(
        "Debe completar todos los campos del medicamento (Nombre, Dosis, Frecuencia)"
      );
      setTimeout(() => setError(""), 3000);
    }
  }, [newMedication]);

  const handleRemoveMedication = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      medication: prevData.medication.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const dataToSend = {
        referralId: formData.patient?.id || formData.patient?.referralId || formData.patientId,
        doctorId: formData.doctor?.id || formData.doctorId,
        dateTimeCRem: formData.dateTime 
          ? new Date(formData.dateTime).toISOString() 
          : new Date().toISOString(),
        departmentHeadId: formData.department?.id || formData.departmentId,
        diagnosis: formData.diagnostic,
      };

      console.log("Datos a enviar:", dataToSend);

      if (modalMode === "create") {
        await consultationReferralService.create(dataToSend);
        setSuccess("Consulta agregada exitosamente");
      } else if (selected != null) {
        await consultationReferralService.update(selected.id, dataToSend);
        setSuccess("Consulta actualizada exitosamente");
      }
      
      loadConsultations();
      setTimeout(() => {
        handleClose();
      }, 1500);
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-2xl sticky top-0 z-10">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de la Consulta
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
                Diagnóstico
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
              onSelect={(patient) => setFormData({ ...formData, patient })}
              label="Paciente"
              placeholder="Selecciona un paciente"
              required={true}
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
              onSelect={(department) =>
                setFormData({ ...formData, department })
              }
              label="Departamento"
              placeholder="Selecciona un departamento"
              required={true}
              getDisplayText={(item) => item?.name || ''}
              getSearchableText={(item) => item?.name || ''}
              renderItem={(item, isSelected) => (
                <span className={isSelected ? 'font-semibold' : ''}>
                  {item.name}
                </span>
              )}
            />
            <Selector
              service={departmentService}
              method="getDoctors"
              selected={formData.doctor}
              onSelect={(doctor) => setFormData({ ...formData, doctor })}
              label="Doctor"
              placeholder="Selecciona un doctor"
              required={true}
              getDisplayText={(item) => item?.name || ''}
              getSearchableText={(item) => item?.name || ''}
              renderItem={(item, isSelected) => (
                <span className={isSelected ? 'font-semibold' : ''}>
                  {item.name}
                </span>
              )}
            />
          </div>

          <div className="space-y-4 pt-4">
            {/* Sección de medicamentos comentada */}
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

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4 border-t mt-6">
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
        </form>
      </div>
    </div>
  );
};

export default ModalConsultation;