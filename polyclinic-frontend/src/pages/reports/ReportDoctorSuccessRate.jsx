import React, { useEffect, useState } from "react";
import { BarChart3, Database, AlertCircle, X, Download } from "lucide-react";
import analyticsService from "../../services/analyticsService";

const ReportDoctorSuccessRate = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [frequency, setFrequency] = useState(1);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (freq = frequency) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await analyticsService.getDoctorSuccessRate({ frequency: freq });
      const list = payload;
      setDoctors(list);
    } catch (err) {
      console.error("Error al obtener tasas de éxito de doctores:", err);
      setError("No se pudieron cargar los datos. Intente nuevamente.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const freq = Number(frequency);

    if (!freq || !isFinite(freq) || freq <= 0 || freq > 1000000) {
      setError("La frecuencia mínima debe ser un número mayor que 0 y menor a 1,000,000.");
      setDoctors([]);
      return;
    }

    fetchData(freq);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const url = await analyticsService.getDoctorSuccessRatePdf({ frequency: frequency });
      
      // Crear un enlace temporal y hacer clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasa_exito_doctores_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar la URL cuando ya no se necesite
      URL.revokeObjectURL(url);
      
      setSuccess('Tasas de éxito de doctores exportadas exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al exportar tasas de éxito de doctores';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Tasa de éxito de prescripciones por doctor
            </h1>
            <p className="text-indigo-50 mt-1">
              Determina la tasa de éxito de prescripción de medicamentos para los pacientes mayores de 60 años. <br /> 
              La tasa de éxito se define como el porcentaje de pacientes que, después de una prescripción inicial, no han
              requerido una nueva consulta en los siguientes tres meses. <br />
              La consulta muestra hasta 5 doctores con la tasa de éxito más alta en este segmento de pacientes, junto con la
              cantidad total de prescripciones que han realizado para ellos, el departamento al que pertenecen y los
              medicamentos más frecuentemente prescritos.
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb + controles */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BarChart3 className="w-4 h-4" />
          <span>Reportes</span>
          <span>/</span>
          <span className="text-indigo-600 font-semibold">Tasa de éxito de prescripciones</span>
        </div>

        {/* Control simple para frequency */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Frecuencia mínima de medicamento:</label>
          <input
            type="number"
            min={1}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-20 px-2 py-1 border rounded-md"
            aria-label="frequency"
          />
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg"
          disabled={loading}
        >
          <Download className="w-5 h-5" />
          Exportar PDF
        </button>
      </div>

      {/* Contenido del Reporte */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto mb-12">
        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
        
        {loading && (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-indigo-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        )}
        
        {!loading && doctors.length === 0 && !error && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No se encontraron doctores con la frecuencia indicada.</p>
          </div>
        )}

        {/* Tarjetas*/}
        {!loading && doctors.length > 0 && (
          <div className="space-y-4">
            {doctors.map((doc, idx) => {
              const key = idx;
              const meds =
                doc.frequentMedications && doc.frequentMedications.trim() !== "."
                  ? doc.frequentMedications
                  : "No hay medicamentos frecuentes.";
              const successPercent = doc.successRate;

              return (
                <div
                  key={key}
                  className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-shadow p-5 flex flex-col lg:flex-row gap-4 items-stretch"
                >
                  {/* Left: info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                          {doc.doctorName ?? "Doctor desconocido"}
                        </h2>
                        <h3 className="text-md text-gray-700 mt-1">
                          {doc.departmentName}
                        </h3>
                      </div>
                    </div>

                    {/* Medicamentos frecuentes */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Medicamentos frecuentes</h4>
                      <p className="text-sm text-gray-600 mt-1 break-words">{meds}</p>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">Prescripciones totales: {doc.totalPrescriptions ?? 0}</h4>
                    </div>
                  </div>

                  {/* Right: tasa y progreso */}
                  <div className="w-full lg:w-56 flex-shrink-0">
                    <div className="text-sm font-medium text-gray-700">Tasa de éxito</div>
                    <div className="flex items-baseline justify-between mt-2 gap-2">
                      <div className="text-2xl font-bold text-gray-900">{doc.successRate} %</div>
                    </div>

                    {/* barra de progreso */}
                    <div className="w-full bg-gray-100 rounded-full h-3 mt-4 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-indigo-600"
                        style={{ width: `${successPercent}%` }}
                        aria-valuenow={successPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mb-1 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportDoctorSuccessRate;