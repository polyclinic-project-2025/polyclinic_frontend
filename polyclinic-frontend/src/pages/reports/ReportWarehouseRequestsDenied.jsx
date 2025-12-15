// pages/reportes/ReportWarehouseRequestsDenied.jsx
import React, { useEffect, useState } from "react";
import { BarChart3, LineChart, Package, Eye, XCircle } from "lucide-react";
import analyticsService from "../../services/analyticsService";

const ReportWarehouseRequestsDenied = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDenied = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await analyticsService.getDeniedWarehouseRequests();
        setRequests(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Error al cargar solicitudes denegadas:", err);
        setError("No se pudieron cargar las solicitudes. Intente nuevamente.");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDenied();
  }, []);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <LineChart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Solicitudes de almacén denegadas
            </h1>
            <p className="text-pink-50 mt-1">
              Presenta todas las solicitudes denegadas por el jefe del almacén,
              realizadas por los jefes de los departamentos.
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BarChart3 className="w-4 h-4" />
        <span>Reportes</span>
        <span>/</span>
        <span className="text-pink-600 font-semibold">Solicitudes de almacén denegadas</span>
      </div>

      {/* Contenido del Reporte */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* estado de carga / error */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin inline-block">
              <LineChart className="w-10 h-10 text-pink-400" />
            </div>
            <p className="text-gray-500 mt-4">Cargando solicitudes...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8 text-red-600">{error}</div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-12">
            <LineChart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay solicitudes denegadas.</p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {req.departmentName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {req.departmentHeadName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medicamentos */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Medicamentos:</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {req.medications}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportWarehouseRequestsDenied;
