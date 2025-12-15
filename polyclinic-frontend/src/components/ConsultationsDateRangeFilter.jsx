// components/ConsultationsDateRangeFilter.jsx
import React, { useState, useEffect, useRef } from "react";
import { Filter, Calendar, Search, Loader2, AlertCircle, Stethoscope, FileText, X, User, ChevronDown, Building2 } from "lucide-react";
import { formatDateMedium } from "../utils/dateUtils";

const ConsultationsDateRangeFilter = ({ service, onSearchParams }) => {
  // Estados del paciente
  const [allPatients, setAllPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  
  // Estados de las fechas
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  
  // Estados de resultados
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Cargar todos los pacientes
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
          throw new Error("Formato de datos inválido");
        }
        
        const patients = data.map(patient => ({
          id: patient.patientId,
          name: patient.name
        }));
        
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

  // Filtrar pacientes basados en búsqueda
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

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm(patient.name);
    setShowDropdown(false);
    setFilteredPatients([]);
    setError("");
    setFilteredResults([]);
  };

  const handleClearSelection = () => {
    setSelectedPatient(null);
    setSearchTerm("");
    setFilteredResults([]);
    setStartDateStr("");
    setEndDateStr("");
    setError("");
    searchInputRef.current?.focus();
    
    // Limpiar los parámetros de exportación
    if (onSearchParams) {
      onSearchParams(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      setError("Por favor, selecciona un paciente primero.");
      if (onSearchParams) {
        onSearchParams(null);
      }
      return;
    }
    
    if (!startDateStr || !endDateStr) {
      setError("Por favor, selecciona una fecha de inicio y una fecha de fin.");
      if (onSearchParams) {
        onSearchParams(null);
      }
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFilteredResults([]);
      
      // Crear DateTime de inicio (00:00:00.000Z)
      const startDateTime = new Date(`${startDateStr}T00:00:00.000Z`).toISOString();
      
      // Crear DateTime de fin (23:59:59.999Z)
      const endOfDay = new Date(`${endDateStr}T23:59:59.999Z`);
      const endDateTime = endOfDay.toISOString();

      // Validación de rango
      if (startDateTime > endDateTime) {
        setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
        setLoading(false);
        if (onSearchParams) {
          onSearchParams(null);
        }
        return;
      }

      console.log(`Buscando consultas del paciente ${selectedPatient.id} entre ${startDateTime} y ${endDateTime}`);

      const params = {
        patientId: selectedPatient.id,
        startDate: startDateTime,
        endDate: endDateTime
      };

      // Llamar al servicio con los parámetros correctos
      const data = await service.getByDateRange(params);
      
      setFilteredResults(data);

      // Pasar los parámetros al componente padre para exportación
      if (onSearchParams) {
        onSearchParams(params);
      }

      if (data.length === 0) {
        setError(`No se encontraron consultas de ${selectedPatient.name} entre ${startDateStr} y ${endDateStr}.`);
      }
    } catch (err) {
      console.error("Error al buscar consultas:", err);
      const errorMessage = err.message || "Error al buscar consultas por rango";
      setError(errorMessage);
      
      // Limpiar los parámetros en caso de error
      if (onSearchParams) {
        onSearchParams(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (setter, value) => {
    setter(value);
    if (error) setError("");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-5">
      <div className="flex items-center gap-3 border-b pb-3 mb-3">
        <Filter className="w-6 h-6 text-cyan-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Buscar Consultas por Rango de Fechas
        </h2>
      </div>

      {/* Buscador de Pacientes */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1. Seleccionar Paciente
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Busca el paciente..."
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
              type="button"
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
                type="button"
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
          </div>
        )}
      </div>

      {/* Chip del paciente seleccionado */}
      {selectedPatient && (
        <div className="flex items-center gap-2 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
          <User className="w-4 h-4 text-cyan-600" />
          <span className="text-sm font-medium text-cyan-900">
            Paciente seleccionado: {selectedPatient.name}
          </span>
        </div>
      )}

      {/* Formulario de Fechas */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
              2. Fecha de Inicio
            </label>
            <input
              id="start-date"
              type="date"
              value={startDateStr}
              onChange={(e) => handleInputChange(setStartDateStr, e.target.value)}
              disabled={!selectedPatient}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-100"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
              3. Fecha de Fin
            </label>
            <input
              id="end-date"
              type="date"
              value={endDateStr}
              onChange={(e) => handleInputChange(setEndDateStr, e.target.value)}
              disabled={!selectedPatient}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedPatient || !startDateStr || !endDateStr}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-md disabled:bg-cyan-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              Buscar Consultas
            </>
          )}
        </button>
      </form>

      {/* Alerts y Resultados */}
      <div className="pt-4 border-t mt-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 w-5 h-5" />
            <p className="text-red-800 text-sm flex-1">{error}</p>
            <button onClick={() => setError("")} type="button">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {filteredResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados ({filteredResults.length} consulta{filteredResults.length !== 1 ? 's' : ''})
            </h3>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
              {filteredResults.map((consult) => (
                <div
                  key={consult.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  {/* Tipo de Consulta */}
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      consult.type === 'Referral' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {consult.type === 'Referral' ? 'Remisión' : 'Derivación'}
                    </span>
                  </div>

                  <p className="font-medium text-gray-900 mb-2">
                    {consult.patientFullName || selectedPatient?.name}
                  </p>
                  
                  <div className="space-y-1">
                    {/* Fecha */}
                    {consult.consultationDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        <span>
                          {new Date(consult.consultationDate).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            timeZone: "UTC"
                          })}
                        </span>
                      </div>
                    )}
                    
                    {/* Departamento */}
                    {consult.departmentName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        <span>{consult.departmentName}</span>
                      </div>
                    )}
                    
                    {/* Doctor */}
                    {consult.doctorFullName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Stethoscope className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                        <span>Dr. {consult.doctorFullName}</span>
                      </div>
                    )}
                    
                    {/* Diagnóstico */}
                    {consult.diagnosis && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{consult.diagnosis}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationsDateRangeFilter;