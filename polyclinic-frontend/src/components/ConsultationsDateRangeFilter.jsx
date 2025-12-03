// components/ConsultationsDateRangeFilterV2.jsx
import React, { useState } from "react";
import { Filter, Calendar, Search, Loader2, AlertCircle, Stethoscope, FileText, X } from "lucide-react";

const ConsultationsDateRangeFilter = ({service}) => {
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!startDateStr || !endDateStr) {
      setError("Por favor, selecciona una fecha de inicio y una fecha de fin.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setFilteredResults([]);
      
      // 1. Crear el DateTime de inicio (00:00:00.000Z)
      // Usamos el constructor new Date(YYYY-MM-DD) que suele interpretar la fecha en UTC medianoche.
      const startDateTime = new Date(`${startDateStr}T00:00:00.000Z`).toISOString();
      
      // 2. Crear el DateTime de fin (23:59:59.999Z)
      // Para incluir todo el día de la fecha de fin:
      const endOfDay = new Date(`${endDateStr}T23:59:59.999Z`);
      const endDateTime = endOfDay.toISOString();

      // Validación simple para rango
      if (startDateTime > endDateTime) {
          setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
          setLoading(false);
          return;
      }

      console.log(`Buscando con Start: ${startDateTime} y End: ${endDateTime}`); // Debugging

      const data = await service.inRange(startDateTime, endDateTime);
      setFilteredResults(data);

      if (data.length === 0) {
        setError(`No se encontraron consultas entre ${startDateStr} y ${endDateStr}.`);
      }
    } catch (err) {
      const errorMessage = err.message || "Error al buscar consultas por rango";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Limpiar el error cuando se cambian los inputs
  const handleInputChange = (setter, value) => {
    setter(value);
    setError("");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-5">
      <div className="flex items-center gap-3 border-b pb-3 mb-3">
        <Filter className="w-6 h-6 text-cyan-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Buscar por Rango de Fechas (Día Completo)
        </h2>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
            Fecha de Inicio
          </label>
          <input
            id="start-date"
            type="date"
            value={startDateStr}
            onChange={(e) => handleInputChange(setStartDateStr, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        
        <div className="flex-1 space-y-1">
          <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
            Fecha de Fin
          </label>
          <input
            id="end-date"
            type="date"
            value={endDateStr}
            onChange={(e) => handleInputChange(setEndDateStr, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !startDateStr || !endDateStr}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-md disabled:bg-cyan-400 min-w-max"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              Buscar
            </>
          )}
        </button>
      </form>

      {/* Alerts y Resultados (Mismos estilos que la versión anterior) */}
      <div className="pt-4 border-t mt-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 w-5 h-5" />
            <p className="text-red-800 text-sm flex-1">{error}</p>
            <button onClick={() => setError("")} className="ml-auto">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {filteredResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados ({filteredResults.length})
            </h3>
            <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
              {filteredResults.map((consult) => (
                <div
                  key={consult.id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-between hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {consult.patientFullName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-500" />
                        <span>{new Date(consult.dateTimeCRem).toLocaleString("es-ES")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-cyan-500" />
                        <span>Dr. {consult.doctorFullName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-cyan-500" />
                        <span className="truncate max-w-xs">{consult.diagnosis}</span>
                      </div>
                    </div>
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