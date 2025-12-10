// components/RecentConsultationsWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { Stethoscope, Clock, FileText, Loader2, AlertCircle, Calendar, User, Search, ChevronDown, Building2, X, Pill } from "lucide-react";

const RecentConsultationsWidget = ({ service }) => {
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [error, setError] = useState("");
  
  // Estados para el buscador
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Cargar todos los pacientes desde el servicio de pacientes
  useEffect(() => {
    const loadAllPatients = async () => {
      try {
        setLoadingPatients(true);
        setError("");
        
        const { patientService } = await import('../services/patientService');
        
        if (!patientService || !patientService.getAll) {
          throw new Error("Servicio de pacientes no disponible");
        }
        
        const data = await patientService.getAll();
        
        if (!Array.isArray(data)) {
          console.error("La respuesta no es un array:", data);
          throw new Error("Formato de datos inválido");
        }
        
        const patients = data.map(patient => ({
          id: patient.patientId,
          name: patient.name
        }));
        
        if (patients.length === 0) {
          console.warn("No hay pacientes en el sistema");
        }
        
        setAllPatients(patients);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
        setError("Error al cargar la lista de pacientes");
      } finally {
        setLoadingPatients(false);
      }
    };

    loadAllPatients();
  }, []);

  // Filtrar pacientes basados en el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allPatients.filter(patient =>
      patient.name && patient.name.toLowerCase().includes(searchLower)
    );

    setFilteredPatients(filtered);
  }, [searchTerm, allPatients]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar últimas consultas cuando se selecciona un paciente
  useEffect(() => {
    const loadRecentConsultations = async () => {
      if (!selectedPatient) {
        setRecentConsultations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        console.log("Cargando consultas para paciente:", selectedPatient.id);
        
        const data = await service.getLast10(selectedPatient.id);
        console.log("Consultas obtenidas:", data);
        
        setRecentConsultations(data);
      } catch (err) {
        console.error("Error detallado:", err);
        const errorMessage = err.message || "Error al cargar las últimas consultas";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadRecentConsultations();
  }, [selectedPatient, service]);

  const handleSelectPatient = (patient) => {
    console.log("Paciente seleccionado:", patient);
    setSelectedPatient(patient);
    setSearchTerm(patient.name);
    setShowDropdown(false);
    setFilteredPatients([]);
  };

  const handleClearSelection = () => {
    setSelectedPatient(null);
    setSearchTerm("");
    setRecentConsultations([]);
    setError("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3 border-b pb-3 mb-3">
        <Clock className="w-6 h-6 text-cyan-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Últimas 10 Consultas del Paciente
        </h2>
      </div>

      {/* Mostrar error de carga de pacientes */}
      {error && !selectedPatient && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-yellow-600 flex-shrink-0 w-4 h-4" />
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {/* Buscador de Pacientes */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar Paciente
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Escribe el nombre del paciente..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) {
                setSelectedPatient(null);
              }
            }}
            onFocus={() => {
              if (searchTerm && filteredPatients.length > 0) {
                setShowDropdown(true);
              }
            }}
            disabled={loadingPatients}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100"
          />
          {loadingPatients && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-cyan-600" />
          )}
          {selectedPatient && !loadingPatients && (
            <button
              onClick={handleClearSelection}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {!selectedPatient && searchTerm && !loadingPatients && (
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          )}
        </div>

        {/* Dropdown de Resultados */}
        {showDropdown && filteredPatients.length > 0 && !selectedPatient && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition flex items-center gap-2 border-b last:border-b-0"
              >
                <User className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span className="text-gray-900">{patient.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {showDropdown && searchTerm && filteredPatients.length === 0 && !selectedPatient && !loadingPatients && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-gray-500 text-sm text-center">
              No se encontraron pacientes con "{searchTerm}"
            </p>
            {allPatients.length === 0 && (
              <p className="text-gray-400 text-xs text-center mt-2">
                (No hay pacientes cargados en el sistema)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Contenido de Consultas */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
        </div>
      ) : error && selectedPatient ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm">Error: {error}</p>
        </div>
      ) : !selectedPatient ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <User className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 italic">
            Busca y selecciona un paciente para ver sus últimas consultas.
          </p>
          {loadingPatients && (
            <p className="text-gray-400 text-sm mt-2">
              Cargando lista de pacientes...
            </p>
          )}
          {!loadingPatients && allPatients.length > 0 && (
            <p className="text-gray-400 text-sm mt-2">
              {allPatients.length} pacientes disponibles
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Chip del paciente seleccionado */}
          <div className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-900">
                Mostrando consultas de: {selectedPatient.name}
              </span>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-cyan-600 hover:text-cyan-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {recentConsultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 italic">
                No hay consultas recientes para este paciente.
              </p>
            </div>
          ) : (
            recentConsultations.map((consult) => {
              // Obtener medicamentos de la consulta
              const medications = consult.medications || [];
              const hasMedications = medications.length > 0;
              
              return (
                <div
                  key={consult.id}
                  className="border-l-4 border-cyan-500 pl-4 py-2 hover:bg-gray-50 transition rounded"
                >
                  {/* Tipo de Consulta y Badge de Medicamentos */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      consult.type === 'Referral' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {consult.type === 'Referral' ? 'Remisión' : 'Derivación'}
                    </span>
                    
                    {/* Indicador de medicamentos */}
                    {hasMedications && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        <Pill className="w-3 h-3" />
                        {medications.length} med{medications.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-gray-900 mb-2">
                    {consult.patientFullName || selectedPatient?.name || "Paciente Desconocido"}
                  </p>
                  
                  <div className="space-y-1">
                    {/* Fecha */}
                    {consult.consultationDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {new Date(consult.consultationDate).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              timeZone: "UTC",
                            }
                          )}
                        </span>
                      </div>
                    )}
                    
                    {/* Departamento */}
                    {consult.departmentName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span>{consult.departmentName}</span>
                      </div>
                    )}
                    
                    {/* Doctor */}
                    {consult.doctorFullName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Stethoscope className="w-4 h-4 flex-shrink-0" />
                        <span>Dr. {consult.doctorFullName}</span>
                      </div>
                    )}
                    
                    {/* Diagnóstico */}
                    {consult.diagnosis && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{consult.diagnosis}</span>
                      </div>
                    )}
                    
                    {/* Medicamentos recetados */}
                    {hasMedications && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-start gap-2">
                          <Pill className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-700 mb-1">
                              Medicamentos recetados:
                            </p>
                            <ul className="space-y-1">
                              {medications.map((med, index) => (
                                <li 
                                  key={med.medicationId || index} 
                                  className="text-xs text-gray-600 flex items-center gap-2"
                                >
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                  <span className="font-medium">{med.medicationName || 'Medicamento'}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>Cant: {med.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default RecentConsultationsWidget;