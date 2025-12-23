import React, { useState, useEffect } from "react";
import {
  Activity,
  Plus,
  SquarePen,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Stethoscope,
  FileText,
  Pill,
  Trash2,
  ChevronRight,
  ChevronDown,  // Agregado
} from "lucide-react";
import { emergencyRoomCareService } from "../services/emergencyRoomCareService";
import { emergencyRoomService } from "../services/emergencyRoomService";
import { usePermissions } from "../middleware/PermissionMiddleware";
import ModalEmergencyCare from "../components/ModalEmergencyCare";
import ModalMedicationEmergency from "../components/ModalMedicationEmergency";
import { medicationEmergencyService } from "../services/medicationEmergencyService";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { formatDateForBackend, formatDateTimeMedium } from "../utils/dateUtils";

const EmergencyCare = () => {
  const { can } = usePermissions();
  const { user } = useAuth();
  const [cares, setCares] = useState([]);
  const [careMedications, setCareMedications] = useState({});
  const [expandedCards, setExpandedCards] = useState({}); // Nuevo estado para expandir/colapsar
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModalCare, setShowModalCare] = useState(false);
  const [showModalMedication, setShowModalMedication] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCare, setSelectedCare] = useState(null);
  const [selectedMedicationMode, setSelectedMedicationMode] = useState("create");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUserOnDuty, setIsUserOnDuty] = useState(false);
  const [checkingDuty, setCheckingDuty] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);

  useEffect(() => {
    loadCares();
    // Solo verificar guardia si el usuario NO es admin y es doctor
    if (!can("canCreateEmergencyGuards") && can("canCreateEmergencyCare")) {
      loadUserProfileAndCheckDuty();
    }
  }, []);

  const loadUserProfileAndCheckDuty = async () => {
    if (!user?.id) return;
    
    try {
      setCheckingDuty(true);
      
      // Obtener el perfil completo del usuario
      const profile = await userService.getProfile(user.id);
      console.log("Perfil del usuario:", profile);
      
      if (profile && profile.profile) {
        const userProfile = profile.profile;
        console.log("Información del perfil:", userProfile);
        
        if (userProfile.employeeId) {
          setDoctorInfo({
            employeeId: userProfile.employeeId,
            identification: userProfile.identification,
            name: userProfile.name || user.email
          });
          
          await checkIfUserIsOnDuty(userProfile);
        } else {
          console.log("No se encontró employeeId en el perfil");
          setIsUserOnDuty(false);
        }
      } else {
        console.log("No se pudo obtener el perfil del usuario");
        setIsUserOnDuty(false);
      }
    } catch (err) {
      console.error("Error cargando perfil del usuario:", err);
      await tryAlternativeMethod();
    } finally {
      setCheckingDuty(false);
    }
  };

  const tryAlternativeMethod = async () => {
    try {
      console.log("Intentando método alternativo...");
      const today = formatDateForBackend(new Date());
      const guards = await emergencyRoomService.getByDate(today);
      
      const userGuard = guards.find(guard => 
        guard.doctorEmail === user.email
      );
      
      if (userGuard) {
        setDoctorInfo({
          employeeId: userGuard.doctorId,
          identification: userGuard.doctorIdentification,
          name: userGuard.doctorName
        });
        setIsUserOnDuty(true);
        console.log("Doctor encontrado por email en guardias:", userGuard);
      } else {
        setIsUserOnDuty(false);
        console.log("No se encontró al doctor en las guardias de hoy");
      }
    } catch (err) {
      console.error("Error en método alternativo:", err);
      setIsUserOnDuty(false);
    }
  };

  const checkIfUserIsOnDuty = async (profile) => {
    if (!profile || !profile.employeeId) {
      console.log("No hay employeeId para verificar guardia");
      setIsUserOnDuty(false);
      return;
    }
    
    try {
      const today = formatDateForBackend(new Date());
      const guards = await emergencyRoomService.getByDate(today);
      
      console.log("Guardias de hoy:", guards);
      console.log("Perfil del doctor:", {
        employeeId: profile.employeeId,
        identification: profile.identification,
        name: profile.name
      });
      
      const isOnDuty = guards.some(guard => {
        if (guard.doctorId === profile.employeeId) {
          return true;
        }
        if (profile.identification && guard.doctorIdentification === profile.identification) {
          return true;
        }
        return false;
      });
      
      console.log("¿Está de guardia?:", isOnDuty);
      setIsUserOnDuty(isOnDuty);
    } catch (err) {
      console.error("Error verificando guardia:", err);
      setIsUserOnDuty(false);
    }
  };

  const loadCares = async () => {
    try {
      setLoading(true);
      const data = await emergencyRoomCareService.getAllWithDetails();
      setCares(data);
      await loadAllMedications(data);
    } catch (err) {
      const errorMessage = err.message || "Error al cargar atenciones";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadAllMedications = async (caresList) => {
    try {
      const medicationsMap = {};
      const allMedications = await medicationEmergencyService.getAllWithMedication();
      
      caresList.forEach(care => {
        const careId = care.emergencyRoomCareId || care.id;
        medicationsMap[careId] = allMedications.filter(
          med => med.emergencyRoomCareId === careId
        );
      });
      
      setCareMedications(medicationsMap);
    } catch (err) {
      console.error('Error al cargar medicamentos de emergencia:', err);
    }
  };

  // Función para alternar el estado expandido de una tarjeta
  const toggleExpandCard = (careId) => {
    setExpandedCards(prev => ({
      ...prev,
      [careId]: !prev[careId]
    }));
  };

  const handleCreate = () => {
    if (can("canCreateEmergencyGuards")) {
      setError("Los administradores no pueden crear atenciones de emergencia");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!can("canCreateEmergencyCare")) {
      setError("No tienes permisos para crear atenciones de emergencia");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (checkingDuty) {
      setError("Verificando si estás de guardia...");
      return;
    }

    if (!isUserOnDuty) {
      setError("Solo puedes crear atenciones cuando estás de guardia");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setModalMode("create");
    setSelectedCare(null);
    setShowModalCare(true);
    setError("");
  };

  const handleEdit = (care) => {
    const isCreator = doctorInfo && care.doctorId === doctorInfo.employeeId;
    
    console.log("Verificando edición:", {
      careDoctorId: care.doctorId,
      currentDoctorId: doctorInfo?.employeeId,
      isCreator: isCreator
    });
    
    if (can("canCreateEmergencyGuards")) {
      setError("Los administradores no pueden editar atenciones de emergencia");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!can("canEditEmergencyCare")) {
      setError("No tienes permisos para editar atenciones");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!doctorInfo) {
      setError("No se pudo verificar tu información de doctor");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!isCreator && !can("canEditEmergencyGuards")) {
      setError("Solo puedes editar las atenciones que has creado");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setModalMode("edit");
    setSelectedCare(care);
    setShowModalCare(true);
    setError("");
  };

  const handleDelete = async (care) => {
    const isCreator = doctorInfo && care.doctorId === doctorInfo.employeeId;
    
    if (can("canCreateEmergencyGuards")) {
      setError("Los administradores no pueden eliminar atenciones de emergencia");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!can("canDeleteEmergencyCare")) {
      setError("No tienes permisos para eliminar atenciones");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!doctorInfo) {
      setError("No se pudo verificar tu información de doctor");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!isCreator && !can("canDeleteEmergencyGuards")) {
      setError("Solo puedes eliminar las atenciones que has creado");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la atención del paciente ${care.patientName}?`)) {
      return;
    }

    try {
      await emergencyRoomCareService.delete(care.emergencyRoomCareId || care.id);
      setSuccess("Atención eliminada exitosamente");
      setTimeout(() => setSuccess(""), 3000);
      loadCares();
    } catch (err) {
      setError(err.message || "Error al eliminar atención");
    }
  };

  const handleAddMedication = (care) => {
    const isCreator = doctorInfo && care.doctorId === doctorInfo.employeeId;
    
    if (can("canCreateEmergencyGuards")) {
      setError("Los administradores no pueden recetar medicamentos en emergencia");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!can("canEditEmergencyCare")) {
      setError("No tienes permisos para recetar medicamentos");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!doctorInfo) {
      setError("No se pudo verificar tu información de doctor");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!isCreator && !can("canEditEmergencyGuards")) {
      setError("Solo puedes recetar medicamentos en las atenciones que has creado");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const careId = care.emergencyRoomCareId || care.id;
    const existingMeds = careMedications[careId] || [];
    
    setSelectedCare(care);
    setSelectedMedicationMode(existingMeds.length > 0 ? 'edit' : 'create');
    setShowModalMedication(true);
    setError("");
  };

  const handleMedicationSuccess = () => {
    setSuccess("Medicamentos recetados exitosamente");
    setTimeout(() => setSuccess(""), 3000);
    loadCares();
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      let data = [];

      // SOLO BÚSQUEDA GENERAL - BUSCAR EN TODO
      data = await emergencyRoomCareService.getAllWithDetails();
      
      // Aplicar filtro local con el término de búsqueda
      if (searchTerm) {
        data = data.filter(care =>
          (care.patientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (care.patientIdentification?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (care.doctorName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (care.doctorIdentification?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (care.diagnosis?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        );
      }

      setCares(data);
      await loadAllMedications(data);
    } catch (err) {
      setError(err.message || "Error en la búsqueda");
      setCares([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCares = cares.filter((care) => {
    // Filtro local para búsqueda en tiempo real
    if (searchTerm) {
      return (
        (care.patientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (care.patientIdentification?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (care.doctorName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (care.doctorIdentification?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (care.diagnosis?.toLowerCase() || "").includes(searchTerm.toLowerCase())
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

  const isAdmin = can("canCreateEmergencyGuards");
  const isDoctor = can("canCreateEmergencyCare");
  const canCreate = isDoctor && !isAdmin && isUserOnDuty;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="text-cyan-600" />
            Atenciones de Emergencia
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las atenciones médicas en el cuerpo de guardia.
          </p>
          
          {/* Estado del usuario */}
          {checkingDuty ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando estado de guardia...
            </div>
          ) : isAdmin ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              Modo vista: Solo puedes visualizar atenciones
            </div>
          ) : isDoctor && doctorInfo ? (
            isUserOnDuty ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Estás de guardia hoy - Puedes crear atenciones
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-sm text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                No estás de guardia hoy, solo puedes ver atenciones
              </div>
            )
          ) : isDoctor && !doctorInfo ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle className="w-4 h-4" />
              No se encontró información de doctor. Contacta al administrador.
            </div>
          ) : null}
        </div>

        {/* Botón Agregar Atención - SOLO para doctores de guardia */}
        {canCreate && (
          <button
            onClick={handleCreate}
            disabled={checkingDuty}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition shadow-lg ${
              checkingDuty
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-cyan-600 text-white hover:bg-cyan-700"
            }`}
          >
            <Plus className="w-5 h-5" />
            Agregar Atención
          </button>
        )}
      </div>

      {/* Search Bar - SOLO BARRA DE BÚSQUEDA Y BOTÓN */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar atenciones por paciente, doctor o diagnóstico..."
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

      {/* Cares Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCares.map((care) => {
          const careId = care.emergencyRoomCareId || care.id;
          const medications = careMedications[careId] || [];
          const hasMedications = medications.length > 0;
          const isCreator = doctorInfo && care.doctorId === doctorInfo.employeeId;
          const isAdmin = can("canCreateEmergencyGuards");
          
          return (
            <div
              key={care.emergencyRoomCareId || care.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {care.patientName || "Sin nombre"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      CI: {care.patientIdentification || "N/A"}
                    </p>
                  </div>
                </div>
                
                {/* Botones de Acción - NO mostrar para admin */}
                {!isAdmin && doctorInfo && (
                  <div className="flex gap-2">
                    {(isCreator || can("canEditEmergencyGuards")) && can("canEditEmergencyCare") && (
                      <button
                        onClick={() => handleAddMedication(care)}
                        className={`p-2 rounded-lg transition ${
                          hasMedications 
                            ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                            : 'text-purple-600 hover:bg-purple-50'
                        }`}
                        title={hasMedications ? `Editar Receta (${medications.length} medicamentos)` : "Recetar Medicamentos"}
                      >
                        <Pill className="w-4 h-4" />
                      </button>
                    )}

                    {(isCreator || can("canEditEmergencyGuards")) && can("canEditEmergencyCare") && (
                      <button
                        onClick={() => handleEdit(care)}
                        className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                        title="Editar"
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                    )}

                    {(isCreator || can("canDeleteEmergencyGuards")) && can("canDeleteEmergencyCare") && (
                      <button
                        onClick={() => handleDelete(care)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Información de la atención */}
              <div className="space-y-2">
                {hasMedications && (
                  <div className="mb-3">
                    <button
                      onClick={() => toggleExpandCard(careId)}
                      className="w-full p-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <Pill className="w-4 h-4" />
                        <span className="font-medium">
                          {medications.length} medicamento{medications.length !== 1 ? 's' : ''} recetado{medications.length !== 1 ? 's' : ''}
                        </span>
                        {expandedCards[careId] ? (
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </div>
                    </button>
                    
                    {/* Lista de medicamentos expandida */}
                    {expandedCards[careId] && (
                      <div className="mt-2 space-y-2 pl-2">
                        {medications.map((med, index) => (
                          <div key={index} className="p-2 bg-white border border-green-100 rounded text-sm">
                            <div className="font-medium text-gray-800">{med.commercialName || med.medicationName || 'Medicamento'}</div>
                            <div className="text-gray-600">Cantidad: {med.quantity || 'N/A'}</div>
                            {med.scientificName && (
                              <div className="text-gray-500 italic text-xs">{med.scientificName}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {care.doctorName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4" />
                    <div>
                      <span className="font-medium">Dr. {care.doctorName}</span>
                      {care.doctorIdentification && (
                        <span className="text-gray-500 ml-2">(CI: {care.doctorIdentification})</span>
                      )}
                    </div>
                  </div>
                )}

                {care.careDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDateTimeMedium(care.careDate)}
                    </span>
                  </div>
                )}

                {care.diagnosis && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mt-3 pt-3 border-t">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{care.diagnosis}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCares.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "No se encontraron atenciones con ese criterio"
              : "No hay atenciones registradas"}
          </p>
        </div>
      )}

      {/* Modal Create Care - SOLO para no-admin */}
      {!can("canCreateEmergencyGuards") && (
        <ModalEmergencyCare
          modalMode={modalMode}
          selected={selectedCare}
          isOpen={showModalCare}
          onClose={() => setShowModalCare(false)}
          onSuccess={() => {
            setSuccess(modalMode === "create" ? "Atención creada exitosamente" : "Atención actualizada exitosamente");
            setTimeout(() => setSuccess(""), 3000);
            loadCares();
            loadUserProfileAndCheckDuty();
          }}
          isUserOnDuty={isUserOnDuty}
        />
      )}

      {/* Modal Medication Emergency - SOLO para no-admin */}
      {!can("canCreateEmergencyGuards") && (
        <ModalMedicationEmergency
          show={showModalMedication}
          onClose={() => setShowModalMedication(false)}
          emergencyRoomCareId={selectedCare?.emergencyRoomCareId || selectedCare?.id}
          onSuccess={handleMedicationSuccess}
          mode={selectedMedicationMode}
          existingMedications={
            selectedCare 
              ? careMedications[selectedCare.emergencyRoomCareId || selectedCare.id] || []
              : []
          }
        />
      )}
    </div>
  );
};

export default EmergencyCare;