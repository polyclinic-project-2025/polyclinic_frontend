import { X, AlertCircle, Loader2, MinusCircle } from "lucide-react"; // Importamos MinusCircle
import { useState, useCallback } from "react"; // Importamos useCallback
import { consultationReferralService } from "../services/consultationReferralService";
import Selector from "./Selector";
import CustomDatePicker from "./CustmonDatePicker";
import { patientService } from "../services/patientService";
import { departmentService } from "../services/departmentService";
// import { medicationReferralService } from "../services/medicationReferralService";
const medicationService = {
  search: async (query) => {
    // Simula una búsqueda
    const medicines = [
      { id: 1, name: "Ibuprofeno" },
      { id: 2, name: "Losartán" },
      { id: 3, name: "Amoxicilina" },
      { id: 4, name: "Paracetamol" },
    ];
    if (!query) return medicines;
    return medicines.filter((m) =>
      m.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Asume que la función de servicio real devuelve un objeto con 'name'
  getSelected: async (id) => {
    const medicines = await medicationService.search("");
    return medicines.find((m) => m.id === id);
  },
};

const ModalConsultation = ({
  isOpen,
  onClose,
  loadConsultations,
  modalMode,
  selected = null,
}) => {
  const initialData = {
    // Renombrado para claridad
    patient: "",
    dateTime: "",
    department: "",
    doctor: "",
    diagnostic: "",
    medication: [], // Inicializamos como array vacío
    description: "",
  };

  // Estado para el medicamento que se está añadiendo (fuera del formData)
  const [newMedication, setNewMedication] = useState({
    name: null,
    dosage: "",
    frequency: "",
  });

  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  // Handler para agregar un medicamento a la lista
  const handleAddMedication = useCallback(() => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      setFormData((prevData) => ({
        ...prevData,
        medication: [
          ...prevData.medication,
          {
            ...newMedication,
            name: newMedication.name.name || newMedication.name,
          }, // Asegurar que sea el nombre
        ],
      }));
      // Reinicia el estado de nuevo medicamento
      setNewMedication({ name: null, dosage: "", frequency: "" });
    } else {
      // Puedes agregar una alerta o mensaje de error si no están completos
      setError(
        "Debe completar todos los campos del medicamento (Nombre, Dosis, Frecuencia)"
      );
      setTimeout(() => setError(""), 3000);
    }
  }, [newMedication]);

  // Handler para eliminar un medicamento de la lista
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
      if (modalMode === "create") {
        await consultationReferralService.create(formData);
        setSuccess("Consulta agregada exitosamente");
      } else if (selected != null) {
        await consultationReferralService.update(selected.id, formData);
        setSuccess("Consulta actualizado exitosamente");
      }
      loadConsultations();
      // Después de guardar y cargar, limpiamos el estado
      // setFormData(initialData);
      onClose();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err.message || "Error al guardar consulta";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl ">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {modalMode === "create" ? "Nueva Consulta" : "Editar Consulta"}
            </h2>
            <button
              onClick={() => onClose()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {" "}
          {/* Aumentado el space-y para mejor separación */}
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
              service={patientService}
              selected={formData.patient}
              onSelect={(patient) => setFormData({ ...formData, patient })}
              label="Paciente"
              placeholder="Selecciona un paciente"
              required={true}
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
            />
            <Selector
              service={departmentService}
              method="getDoctors"
              selected={formData.doctor}
              onSelect={(doctor) => setFormData({ ...formData, doctor })}
              label="Doctor"
              placeholder="Selecciona un doctor"
              required={true}
            />
          </div>
          <div className="space-y-4 pt-4">
            {/* <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Receta Médica
            </h3> */}

            {/* INICIO - SECCIÓN DE MEDICAMENTOS COMENTADA TEMPORALMENTE
            
            <div className="flex items-end gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medicamento
                    </label>
                    <Selector
                        service={medicationReferralService}
                        selected={newMedication.name}
                        onSelect={(med) => setNewMedication({ ...newMedication, name: med })}
                        placeholder="Buscar medicamento"
                        required={false}
                    />
                </div>
                
                <div className="w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosis
                    </label>
                    <input
                        type="text"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                        className="bg-white rounded-lg border border-gray-300 px-4 py-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                        placeholder="Ej: 400mg"
                    />
                </div>
                
                <div className="w-1/4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frecuencia
                    </label>
                    <input
                        type="text"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                        className="bg-white rounded-lg border border-gray-300 px-4 py-3 w-full focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                        placeholder="Ej: Cada 8hs"
                    />
                </div>
                
                <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex-shrink-0 whitespace-nowrap"
                >
                    + Agregar
                </button>
            </div>

            {formData.medication.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Medicamento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                    Dosis
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                    Frecuencia
                                </th>
                                <th className="px-6 py-3 w-16">
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {formData.medication.map((med, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {med.name}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {med.dosage}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {med.frequency}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMedication(index)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                                            aria-label={`Eliminar ${med.name}`}
                                        >
                                            <MinusCircle className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            FIN - SECCIÓN DE MEDICAMENTOS COMENTADA TEMPORALMENTE
            */}
          </div>
          {/* ---------------------------------------------------- */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          {/* ... Botones Cancelar/Crear (sin cambios) ... */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose()}
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
