// components/PatientHistoryModal.jsx - CORREGIDO
import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Calendar,
  Building2,
  Stethoscope,
  FileText,
  Pill,
  Filter,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { consultationDerivationService } from '../services/consultationDerivationService';
import { consultationReferralService } from '../services/consultationReferralService';
import { referralService } from '../services/referralService';
import medicationDerivationService from '../services/medicationDerivationService';
import medicationReferralService from '../services/medicationReferralService';
import medicationService from '../services/medicationService';

const PatientHistoryModal = ({ isOpen, onClose, patientId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allConsultations, setAllConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [medicationMap, setMedicationMap] = useState({});
  const [allDepartments, setAllDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [mergeDepartments, setMergeDepartments] = useState(false);
  const [expandedConsultations, setExpandedConsultations] = useState({});

  // Función para normalizar IDs
  const normalizeId = (id) => {
    if (!id) return '';
    return id.toString().toLowerCase().replace(/[-\s]/g, '');
  };

  // Cargar historial cuando se abre el modal
  useEffect(() => {
    if (isOpen && patientId) {
      loadPatientHistory();
    } else {
      setAllConsultations([]);
      setFilteredConsultations([]);
      setSelectedDepartments([]);
      setMergeDepartments(false);
      setExpandedConsultations({});
    }
  }, [isOpen, patientId]);

  const loadPatientHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const normalizedPatientId = normalizeId(patientId);

      // 1. Cargar todas las consultas y remisiones
      const [allDerivationConsults, allReferralConsults, allReferrals] = await Promise.all([
        consultationDerivationService.getAll(),
        consultationReferralService.getAll(),
        referralService.getAll()
      ]);

      // 2. Crear mapa de referralId -> patientId
      const referralPatientMap = {};
      allReferrals.forEach(referral => {
        referralPatientMap[referral.referralId] = referral.patientId;
      });

      // 3. Filtrar derivaciones por paciente
      const patientDerivationConsults = allDerivationConsults.filter(
        consult => normalizeId(consult.patientId) === normalizedPatientId
      );
      
      // 4. Filtrar consultas por remisión
      const patientReferralConsults = allReferralConsults.filter(
        consult => {
          const referralPatientId = referralPatientMap[consult.referralId];
          return normalizeId(referralPatientId) === normalizedPatientId;
        }
      );

      // 5. Cargar todos los medicamentos
      const allMedications = await medicationService.getAll();
      const medicationMap = {};
      allMedications.forEach(med => {
        medicationMap[med.medicationId] = {
          commercialName: med.commercialName,
          scientificName: med.scientificName
        };
      });
      setMedicationMap(medicationMap);

      // 6. Preparar estructura de consultas (SIN RENOMBRAR department)
      const formattedDerivationConsults = patientDerivationConsults.map(consult => ({
        ...consult, // Mantiene departmentToName
        type: 'derivation',
        date: consult.dateTimeCDer,
        // departmentToName ya viene en consult
        doctor: consult.doctorName,
        diagnosis: consult.diagnosis,
        consultationId: consult.consultationDerivationId
      }));

      const formattedReferralConsults = patientReferralConsults.map(consult => ({
        ...consult, // Mantiene departmentName
        type: 'referral',
        date: consult.dateTimeCRem || consult.dateTimeCRe,
        // departmentName ya viene en consult
        doctor: consult.doctorFullName,
        diagnosis: consult.diagnosis,
        consultationId: consult.consultationReferralId
      }));

      // 7. Combinar y ordenar por fecha
      const allConsults = [...formattedDerivationConsults, ...formattedReferralConsults]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllConsultations(allConsults);
      setFilteredConsultations(allConsults);

      // 8. Extraer departamentos únicos (CORREGIDO)
      const departments = [...new Set(
        allConsults.map(c => c.departmentToName || c.departmentName).filter(Boolean)
      )];
      setAllDepartments(departments);

    } catch (err) {
      console.error('Error cargando historial:', err);
      setError('Error al cargar el historial del paciente');
    } finally {
      setLoading(false);
    }
  };

  // Cargar medicamentos para una consulta
  const loadMedicationsForConsultation = async (consultation) => {
    try {
      let medications = [];
      
      if (consultation.type === 'derivation') {
        const meds = await medicationDerivationService.getByConsultationId(consultation.consultationId);
        medications = meds.map(med => ({
          ...med,
          ...(medicationMap[med.medicationId] || {})
        }));
      } else if (consultation.type === 'referral') {
        const meds = await medicationReferralService.getByConsultationId(consultation.consultationId);
        medications = meds.map(med => ({
          ...med,
          ...(medicationMap[med.medicationId] || {})
        }));
      }

      return medications;
    } catch (err) {
      console.error('Error cargando medicamentos:', err);
      return [];
    }
  };

  // Alternar consulta expandida
  const toggleExpandConsultation = async (consultationId) => {
    setExpandedConsultations(prev => ({
      ...prev,
      [consultationId]: !prev[consultationId]
    }));
  };

  // Aplicar filtros (CORREGIDO)
  useEffect(() => {
    let filtered = [...allConsultations];

    // Filtrar por departamentos seleccionados (CORREGIDO)
    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(consult => {
        // Usar departmentToName para derivaciones, departmentName para remisiones
        const deptName = consult.departmentToName || consult.departmentName;
        return selectedDepartments.includes(deptName);
      });
    }

    // Fusionar departamentos si está activado (CORREGIDO)
    if (mergeDepartments && selectedDepartments.length > 1) {
      const mergedConsultations = {};
      
      filtered.forEach(consult => {
        const key = `${consult.date}-${consult.diagnosis}-${consult.doctor}`;
        const deptName = consult.departmentToName || consult.departmentName;
        
        if (!mergedConsultations[key]) {
          mergedConsultations[key] = {
            ...consult,
            mergedDepartments: [deptName]
          };
        } else {
          mergedConsultations[key].mergedDepartments.push(deptName);
        }
      });

      filtered = Object.values(mergedConsultations);
    }

    setFilteredConsultations(filtered);
  }, [allConsultations, selectedDepartments, mergeDepartments]);

  // Alternar selección de departamento
  const toggleDepartment = (department) => {
    setSelectedDepartments(prev => {
      if (prev.includes(department)) {
        return prev.filter(d => d !== department);
      } else {
        return [...prev, department];
      }
    });
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSelectedDepartments([]);
    setMergeDepartments(false);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Fecha inválida';
    }
  };

  // Formatear fecha corta
  const formatShortDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (err) {
      return 'Fecha inválida';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Historial Médico</h2>
                <p className="text-sm text-gray-600">Consultas y medicamentos recetados</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Filtrar por Departamento</h3>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={clearFilters} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition">
                  Limpiar filtros
                </button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={mergeDepartments} onChange={(e) => setMergeDepartments(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500" disabled={selectedDepartments.length < 2} />
                  <span className="text-sm text-gray-700">Fusionar departamentos seleccionados</span>
                </label>
              </div>
            </div>

            {allDepartments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allDepartments.map((dept, index) => (
                  <button key={index} onClick={() => toggleDepartment(dept)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${selectedDepartments.includes(dept) ? 'bg-cyan-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">{dept}</span>
                    {selectedDepartments.includes(dept) && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay departamentos disponibles</p>
            )}

            {(selectedDepartments.length > 0 || mergeDepartments) && (
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-sm text-cyan-800">
                  {selectedDepartments.length > 0 && <span>Departamentos seleccionados: {selectedDepartments.join(', ')}</span>}
                  {mergeDepartments && selectedDepartments.length > 1 && <span className="ml-2">• Fusionados</span>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mx-auto mb-4" />
                <p className="text-gray-600">Cargando historial médico...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{error}</p>
                <button onClick={loadPatientHistory} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">
                  Reintentar
                </button>
              </div>
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {selectedDepartments.length > 0 ? 'No hay consultas para los departamentos seleccionados' : 'No hay consultas registradas para este paciente'}
              </p>
              {selectedDepartments.length > 0 && <button onClick={clearFilters} className="mt-4 px-4 py-2 text-cyan-600 hover:text-cyan-700">Limpiar filtros</button>}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {filteredConsultations.length} consulta{filteredConsultations.length !== 1 ? 's' : ''} encontrada{filteredConsultations.length !== 1 ? 's' : ''}
                </p>
              </div>
              {filteredConsultations.map((consultation, index) => (
                <ConsultationCard key={`${consultation.consultationId}-${index}`} consultation={consultation} isExpanded={expandedConsultations[consultation.consultationId]} onToggleExpand={() => toggleExpandConsultation(consultation.consultationId)} loadMedications={loadMedicationsForConsultation} formatDate={formatDate} formatShortDate={formatShortDate} mergeDepartments={mergeDepartments} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Subcomponente para mostrar cada consulta (CORREGIDO)
const ConsultationCard = ({ consultation, isExpanded, onToggleExpand, loadMedications, formatDate, formatShortDate, mergeDepartments }) => {
  const [medications, setMedications] = useState([]);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [medicationsLoaded, setMedicationsLoaded] = useState(false);

  useEffect(() => {
    if (isExpanded && !medicationsLoaded) {
      loadConsultationMedications();
    }
  }, [isExpanded, medicationsLoaded]);

  const loadConsultationMedications = async () => {
    try {
      setLoadingMedications(true);
      const meds = await loadMedications(consultation);
      setMedications(meds);
      setMedicationsLoaded(true);
    } catch (err) {
      console.error('Error cargando medicamentos:', err);
    } finally {
      setLoadingMedications(false);
    }
  };

  const getTypeBadge = (type) => {
    if (type === 'derivation') {
      return { label: 'Derivación', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-200' };
    } else {
      return { label: 'Remisión', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-200' };
    }
  };

  const typeBadge = getTypeBadge(consultation.type);
  // Obtener nombre del departamento (CORREGIDO)
  const deptName = consultation.departmentToName || consultation.departmentName;
  // Obtener departamentos fusionados si aplica
  const mergedDepts = consultation.mergedDepartments;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={onToggleExpand} className="w-full p-4 text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeBadge.bgColor}`}>
              {consultation.type === 'derivation' ? <Stethoscope className={`w-4 h-4 ${typeBadge.textColor}`} /> : <FileText className={`w-4 h-4 ${typeBadge.textColor}`} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeBadge.bgColor} ${typeBadge.textColor}`}>{typeBadge.label}</span>
                <span className="text-sm text-gray-500">{formatShortDate(consultation.date)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">
                    {mergeDepartments && mergedDepts ? mergedDepts.join(', ') : deptName || 'Sin departamento'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{consultation.doctor || 'Sin doctor asignado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{consultation.diagnosis || 'Sin diagnóstico'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{formatDate(consultation.date)}</span>
            {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Medicamentos Recetados</h4>
            </div>
            {loadingMedications ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
              </div>
            ) : medications.length > 0 ? (
              <div className="space-y-2 pl-6">
                {medications.map((med, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{med.commercialName || 'Medicamento sin nombre'}</p>
                        {med.scientificName && <p className="text-xs text-gray-500 italic">{med.scientificName}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Cantidad: {med.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 pl-6">No se recetaron medicamentos</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Fecha y Hora</span>
              </div>
              <p className="text-sm text-gray-900">{formatDate(consultation.date)}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Departamento</span>
              </div>
              <p className="text-sm text-gray-900">{deptName || 'Sin departamento'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistoryModal;