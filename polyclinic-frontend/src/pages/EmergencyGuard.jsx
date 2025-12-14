import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  SquarePen,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Clock,
  Trash2,
} from "lucide-react";
import { emergencyRoomService } from "../services/emergencyRoomService";
import { usePermissions } from "../middleware/PermissionMiddleware";
import ModalEmergencyGuard from "../components/ModalEmergencyGuard";
import { useAuth } from "../context/AuthContext";

const EmergencyGuard = () => {
  const { can } = usePermissions();
  const { user } = useAuth();
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadGuards();
  }, []);

  const loadGuards = async () => {
    try {
      setLoading(true);
      const data = await emergencyRoomService.getAllWithDoctor();
      console.log("Guardias cargadas (raw data):", data);
      
      if (data.length > 0) {
        const sample = data[0];
        console.log("Sample guard properties:", {
          emergencyRoomId: sample.emergencyRoomId,
          doctorId: sample.doctorId,
          doctorName: sample.doctorName,
          doctorIdentification: sample.doctorIdentification,
          guardDate: sample.guardDate
        });
      }
      
      setGuards(data);
    } catch (err) {
      const errorMessage = err.message || "Error al cargar guardias";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!can("canCreateEmergencyGuards")) {
      setError("No tienes permisos para agregar guardias");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setModalMode("create");
    setSelectedGuard(null);
    setShowModal(true);
    setError("");
  };

  const handleEdit = (guard) => {
    if (!can("canEditEmergencyGuards")) {
      setError("No tienes permisos para editar guardias");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setModalMode("edit");
    setSelectedGuard(guard);
    setShowModal(true);
    setError("");
  };

  const handleDelete = async (guard) => {
    if (!can("canDeleteEmergencyGuards")) {
      setError("No tienes permisos para eliminar guardias");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la guardia del Dr. ${guard.doctorName} del ${new Date(guard.guardDate).toLocaleDateString()}?`)) {
      return;
    }

    try {
      await emergencyRoomService.delete(guard.emergencyRoomId);
      setSuccess("Guardia eliminada exitosamente");
      setTimeout(() => setSuccess(""), 3000);
      loadGuards();
    } catch (err) {
      setError(err.message || "Error al eliminar guardia");
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let data = [];

      // SOLO BÚSQUEDA GENERAL - BUSCAR EN TODO
      data = await emergencyRoomService.getAllWithDoctor();
      
      // Aplicar filtro local con el término de búsqueda
      if (searchTerm) {
        data = data.filter(guard =>
          (guard.doctorName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (guard.doctorIdentification?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (guard.guardDate?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        );
      }

      setGuards(data);
    } catch (err) {
      setError(err.message || "Error en la búsqueda");
      setGuards([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuards = guards.filter((guard) => {
    // Filtro local adicional para búsqueda en tiempo real si se desea
    if (searchTerm) {
      return (
        (guard.doctorName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (guard.doctorIdentification?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (guard.guardDate?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="text-cyan-600" />
            Guardias de Emergencia
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los turnos de guardia de los doctores.
          </p>
        </div>

        {can("canCreateEmergencyGuards") && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Guardia
          </button>
        )}
      </div>

      {/* Search Bar - SOLO BARRA DE BÚSQUEDA Y BOTÓN */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar guardias por nombre, CI o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Buscar
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError("")} className="ml-auto">
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto">
            <X className="w-5 h-5 text-green-600" />
          </button>
        </div>
      )}

      {/* Guards Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Guardia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuards.map((guard) => (
                <tr key={guard.emergencyRoomId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {guard.doctorName || "Desconocido"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{guard.doctorIdentification || "N/A"}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {new Date(guard.guardDate).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {can("canEditEmergencyGuards") && (
                        <button
                          onClick={() => handleEdit(guard)}
                          className="text-cyan-600 hover:text-cyan-900 p-1"
                          title="Editar"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                      )}
                      {can("canDeleteEmergencyGuards") && (
                        <button
                          onClick={() => handleDelete(guard)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGuards.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? "No se encontraron guardias con ese criterio"
                : "No hay guardias registradas"}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ModalEmergencyGuard
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        modalMode={modalMode}
        selected={selectedGuard}
        onSuccess={() => {
          setSuccess(modalMode === "create" ? "Guardia creada exitosamente" : "Guardia actualizada exitosamente");
          setTimeout(() => setSuccess(""), 3000);
          loadGuards();
        }}
      />
    </div>
  );
};

export default EmergencyGuard;