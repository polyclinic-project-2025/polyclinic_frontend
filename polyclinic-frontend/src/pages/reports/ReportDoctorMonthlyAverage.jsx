// pages/reportes/ReportDoctorMonthlyAverage.jsx
import React, { useState } from "react";
import { BarChart3, PieChart, AlertCircle, X, Loader2 } from "lucide-react";
import analyticsService from "../../services/analyticsService"; 

const ReportDoctorMonthlyAverage = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const formatNumber = (v) => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return "N/A";
    return Number(v).toFixed(2);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();

    // Validaciones básicas
    if (!fromDate || !toDate) {
      setError("Por favor, selecciona fecha de inicio y fecha de fin.");
      setDoctors([]);
      return;
    }

    const start = new Date(`${fromDate}T00:00:00.000Z`);
    const end = new Date(`${toDate}T23:59:59.999Z`);

    if (start > end) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      setDoctors([]);
      return;
    }

    setLoading(true);
    setError("");
    setDoctors([]);

    try {
      const fromIso = start.toISOString();
      const toIso = end.toISOString();

      const res = await analyticsService.getDoctorMonthlyAverage({
        from: fromIso,
        to: toIso,
      });

      const payload = res?.data ?? res;

      if (!Array.isArray(payload)) {
        setDoctors([]);
        setError("Respuesta del servidor en formato inesperado.");
        return;
      }

      const normalized = payload.map((p) => ({
        doctorName: p.doctorName,
        departmentName: p.departmentName,
        consultationAverage: p.consultationAverage,
        emergencyRoomAverage: p.emergencyRoomAverage,
      }));

      setDoctors(normalized);
    } catch (err) {
      console.error("Error al obtener promedio mensual de atenciones:", err);
      const message = err?.message ?? "Error al obtener los datos.";
      setError(message);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <PieChart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Promedio mensual de atenciones por doctor</h1>
            <p className="text-green-50 mt-1 max-w-2xl">
              Selecciona un rango de fechas para obtener el promedio mensual de
              consultas y de urgencias por doctor. 
              Se muestran el nombre del
              doctor, su departamento y los promedios correspondientes.
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb + controles de fecha */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BarChart3 className="w-4 h-4" />
          <span>Reportes</span>
          <span>/</span>
          <span className="text-green-600 font-semibold">Promedio mensual por doctor</span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-sm text-gray-600">Desde</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              if (error) setError("");
            }}
            className="px-2 py-1 border rounded-md"
            aria-label="Fecha desde"
          />
          <label className="text-sm text-gray-600">Hasta</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              if (error) setError("");
            }}
            className="px-2 py-1 border rounded-md"
            aria-label="Fecha hasta"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando...
              </span>
            ) : (
              "Buscar"
            )}
          </button>
        </form>
      </div>

      {/* Contenedor del reporte (centrado y con max width) */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto mb-12">
        {/* ALERTA (única) */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm flex-1">{error}</p>
            <button
              onClick={() => setError("")}
              aria-label="Cerrar alerta"
              className="ml-auto"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}

        {/* Spinner */}
        {loading && (
          <div className="text-center py-8">
            <PieChart className="w-12 h-12 text-green-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        )}

        {/* No results */}
        {!loading && doctors.length === 0 && !error && (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay resultados para el rango seleccionado.</p>
            <p className="text-gray-400 text-sm mt-2">Prueba otro rango de fechas.</p>
          </div>
        )}

        {/* Grid listado (Doctor/Depto | Prom consultas | Prom urgencias) */}
        {!loading && doctors.length > 0 && (
          <div className="space-y-4">
            {/* Encabezado de columnas */}
            <div className="grid grid-cols-4 gap-4 px-3 py-2 bg-gray-50 rounded-md text-sm font-semibold text-gray-700 border border-gray-100">
              <div className="col-span-2">Doctor / Departamento</div>
              <div className="text-center">Prom. Consultas</div>
              <div className="text-center">Prom. Urgencias</div>
            </div>

            {/* Filas */}
            <div className="space-y-2">
              {doctors.map((item, idx) => {
                const key = `${item.doctorName}-${item.departmentName}-${idx}`;
                return (
                  <div
                    key={key}
                    className="grid grid-cols-4 gap-4 items-center px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    {/* Doctor + Department (col-span-2) */}
                    <div className="col-span-2 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.doctorName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {item.departmentName}
                      </p>
                    </div>

                    {/* Promedio Consultas */}
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium">
                        {item.consultationAverage !== null && item.consultationAverage !== undefined
                          ? formatNumber(item.consultationAverage)
                          : "N/A"}
                      </span>
                    </div>

                    {/* Promedio Urgencias */}
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm font-medium">
                        {item.emergencyRoomAverage !== null && item.emergencyRoomAverage !== undefined
                          ? formatNumber(item.emergencyRoomAverage)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pie de sección con resumen */}
            <div className="text-sm text-gray-500 mt-2">
              Mostrando {doctors.length} resultado{doctors.length !== 1 ? "s" : ""}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDoctorMonthlyAverage;
