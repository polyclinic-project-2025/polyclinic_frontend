import React, { useState, useEffect } from "react";
import { BarChart3, Users, FileText, Calendar, Phone, MapPin, User, Loader2 } from "lucide-react";
import analyticsService from "../../services/analyticsService";

const ReportPatientsList = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");

  // Cargar pacientes al montar el componente
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await analyticsService.getPatientsList();
      const payload = res?.data ?? res;

      if (!Array.isArray(payload)) {
        setPatients([]);
        setError("Respuesta del servidor en formato inesperado.");
        return;
      }

      const normalized = payload.map((p) => ({
        patientName: p.patientName,
        identification: p.identification,
        age: p.age,
        contact: p.contact,
        address: p.address
      }));

      setPatients(normalized);
    } catch (err) {
      console.error("Error al obtener la lista de pacientes:", err);
      setError("Error al obtener los datos. Por favor, intente nuevamente.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Listado de Pacientes Registrados</h1>
            <p className="text-purple-50 mt-1 max-w-2xl">
              Lista completa de pacientes registrados en el sistema con su información de contacto y dirección.
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BarChart3 className="w-4 h-4" />
        <span>Reportes</span>
        <span>/</span>
        <span className="text-purple-600 font-semibold">Listado de Pacientes</span>
      </div>

      {/* Contenedor del reporte */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Spinner de carga */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-purple-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Cargando lista de pacientes...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadPatients}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Sin pacientes */}
        {!loading && !error && patients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay pacientes registrados en el sistema.</p>
          </div>
        )}

        {/* Tabla de pacientes */}
        {!loading && !error && patients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nombre del Paciente
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Identificación
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Edad
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contacto
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Dirección
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient, index) => (
                  <tr 
                    key={`${patient.identification}-${index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">
                        {patient.identification}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        {patient.age} años
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {patient.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-md">
                        {patient.address}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Contador de pacientes */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Total de pacientes registrados: <span className="font-semibold text-gray-700">{patients.length}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPatientsList;