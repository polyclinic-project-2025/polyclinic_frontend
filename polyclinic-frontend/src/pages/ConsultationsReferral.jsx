// pages/ConsultationsReferral.jsx

import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  SquarePen,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Stethoscope,
  FileText,
  Pill,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { consultationReferralService } from "../services/consultationReferralService";
import {
  ProtectedComponent,
  usePermissions,
} from "../middleware/PermissionMiddleware";
import ModalConsultation from "../components/ModalConsultation";
import ModalMedicationReferral from "../components/ModalMedicationReferral";
import Pagination from "../components/Pagination";
import { formatDateMedium } from "../utils/dateUtils";

import medicationReferralService from "../services/medicationReferralService";
import medicationService from "../services/medicationService";

const Consultations = () => {
  const { can } = usePermissions();
  const [consultations, setConsultations] = useState([]);
  const [consultationMedications, setConsultationMedications] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModalConsultation, setShowModalConsultation] = useState(false);
  const [showModalMedication, setShowModalMedication] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedMedicationMode, setSelectedMedicationMode] = useState("create");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const data = await consultationReferralService.getAll();
      console.log("Consultas cargadas:", data);
      setConsultations(data);
      
      // Cargar medicamentos para cada consulta
      await loadAllMedications(data);
    } catch (err) {
      const errorMessage = err.message || "Error al cargar consultas";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadAllMedications = async (consultationsList) => {
    try {
      const medicationsMap = {};
      const allMedicationReferrals = await medicationReferralService.getAll();
      const allMedicationsInfo = await medicationService.getAll();
      
      consultationsList.forEach(consultation => {
        const consultId = consultation.consultationReferralId || consultation.id;
        const consultationMeds = allMedicationReferrals.filter(
          med => med.consultationReferralId === consultId
        );
        
        // Enriquecer con información completa del medicamento
        medicationsMap[consultId] = consultationMeds.map(medRef => {
          const medInfo = allMedicationsInfo.find(m => m.medicationId === medRef.medicationId);
          return {
            ...medRef,
            commercialName: medInfo?.commercialName || 'Desconocido',
            scientificName: medInfo?.scientificName || ''
          };
        });
      });
      
      setConsultationMedications(medicationsMap);
    } catch (err) {
      console.error('Error al cargar medicamentos:', err);
    }
  };

  const handleCreate = () => {
    if (!can("canCreateConsultations")) {
      setError("No tienes permisos para agregar consultas");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setModalMode("create");
    setSelectedConsultation(null);
    setShowModalConsultation(true);
    setError("");
  };

  const handleEdit = (consultation) => {
    if (!can("canEditConsultations")) {
      setError("No tienes permisos para editar consultas");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setModalMode("edit");
    setSelectedConsultation(consultation);
    setShowModalConsultation(true);
    setError("");
  };

  const handleAddMedication = (consultation) => {
    if (!can("canEditConsultations")) {
      setError("No tienes permisos para recetar medicamentos");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const consultId = consultation.consultationReferralId || consultation.id;
    const existingMeds = consultationMedications[consultId] || [];
    
    setSelectedConsultation(consultation);
    setSelectedMedicationMode(existingMeds.length > 0 ? 'edit' : 'create');
    setShowModalMedication(true);
    setError("");
  };

  const handleMedicationSuccess = () => {
    setSuccess("Medicamentos recetados exitosamente");
    setTimeout(() => setSuccess(""), 3000);
    loadConsultations();
  };

  // Función para alternar el estado expandido de una tarjeta
  const toggleExpandCard = (consultId) => {
    setExpandedCards(prev => ({
      ...prev,
      [consultId]: !prev[consultId]
    }));
  };

  // Filtra las consultas
  const filteredConsultations = consultations.filter((consult) => {
    const searchLower = searchTerm.toLowerCase();

    return (
      (consult.departmentName?.toLowerCase() || "").includes(searchLower) ||
      (consult.dateTimeCRem?.toLowerCase() || "").includes(searchLower) ||
      (consult.doctorFullName?.toLowerCase() || "").includes(searchLower) ||
      (consult.patientFullName?.toLowerCase() || "").includes(searchLower) ||
      (consult.diagnosis?.toLowerCase() || "").includes(searchLower)
    );
  });
  
  // Resetear a página 1 cuando cambie searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Calcular items para la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedConsultations = filteredConsultations.slice(startIndex, endIndex);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredConsultations.length / ITEMS_PER_PAGE);

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
            <Building2 className="text-cyan-600" />
            Consultas por Remisión Médica
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las consultas por remisión médica de los pacientes.
          </p>
        </div>

        <ProtectedComponent requiredPermission="canCreateConsultations">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Consulta
          </button>
        </ProtectedComponent>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar consultas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-8">
        Consultas
      </h2>

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

      {!can("canCreateConsultations") && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-800">
            Solo el doctor principal agrega o edita consultas.
          </p>
        </div>
      )}

      {/* Consultations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedConsultations.map((consultation) => {
          const consultId = consultation.consultationReferralId || consultation.id;
          const medications = consultationMedications[consultId] || [];
          const hasMedications = medications.length > 0;
          
          return (
            <div
              key={consultation.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {consultation.patientFullName || "Sin nombre"}
                    </h3>
                  </div>
                </div>
                
                {/* Botones de Acción */}
                <div className="flex gap-2">
                  <ProtectedComponent requiredPermission="canEditConsultations">
                    <button
                      onClick={() => handleAddMedication(consultation)}
                      className={`p-2 rounded-lg transition ${
                        hasMedications 
                          ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                      title={hasMedications ? `Editar Receta (${medications.length} medicamentos)` : "Recetar Medicamentos"}
                    >
                      <Pill className="w-4 h-4" />
                    </button>
                  </ProtectedComponent>

                  <ProtectedComponent requiredPermission="canEditConsultations">
                    <button
                      onClick={() => handleEdit(consultation)}
                      className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                      title="Editar"
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                  </ProtectedComponent>
                </div>
              </div>

              {/* Información de la consulta */}
              <div className="space-y-2">
                {hasMedications && (
                  <div className="mb-3">
                    <button
                      onClick={() => toggleExpandCard(consultId)}
                      className="w-full p-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <Pill className="w-4 h-4" />
                        <span className="font-medium">
                          {medications.length} medicamento{medications.length !== 1 ? 's' : ''} recetado{medications.length !== 1 ? 's' : ''}
                        </span>
                        {expandedCards[consultId] ? (
                          <ChevronDown className="w-4 h-4 ml-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </div>
                    </button>
                    
                    {/* Lista de medicamentos expandida */}
                    {expandedCards[consultId] && (
                      <div className="mt-2 space-y-2 pl-2">
                        {medications.map((med, index) => (
                          <div key={index} className="p-2 bg-white border border-green-100 rounded text-sm">
                            <div className="font-medium text-gray-800">{med.commercialName || med.medicationName || 'Medicamento'}</div>
                            <div className="text-gray-600">Cantidad: {med.quantity || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {consultation.departmentName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>{consultation.departmentName}</span>
                  </div>
                )}

                {consultation.doctorFullName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4" />
                    <span>Dr. {consultation.doctorFullName}</span>
                  </div>
                )}

                {consultation.dateTimeCRem && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDateMedium(consultation.dateTimeCRem)}
                    </span>
                  </div>
                )}

                {consultation.diagnosis && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mt-3 pt-3 border-t">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{consultation.diagnosis}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Paginación */}
      {filteredConsultations.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredConsultations.length}
        />
      )}

      {filteredConsultations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "No se encontraron consultas con ese criterio"
              : "No hay consultas registradas"}
          </p>
        </div>
      )}

      {/* Modal Create Consultation */}
      <ModalConsultation
        modalMode={modalMode}
        selected={selectedConsultation}
        loadConsultations={loadConsultations}
        isOpen={showModalConsultation}
        onClose={() => setShowModalConsultation(false)}
      />

      {/* Modal Medication Referral */}
      <ModalMedicationReferral
        show={showModalMedication}
        onClose={() => setShowModalMedication(false)}
        consultationId={selectedConsultation?.consultationReferralId || selectedConsultation?.id}
        onSuccess={handleMedicationSuccess}
        mode={selectedMedicationMode}
        existingMedications={
          selectedConsultation 
            ? consultationMedications[selectedConsultation.consultationReferralId || selectedConsultation.id] || []
            : []
        }
      />
    </div>
  );
};

export default Consultations;