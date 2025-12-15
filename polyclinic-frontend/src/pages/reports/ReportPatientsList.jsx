import React, { useState, useEffect } from "react";
import { BarChart3, Users, FileText, Calendar, Phone, MapPin, User, Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";
import analyticsService from "../../services/analyticsService";

const ReportPatientsList = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 10 pacientes por página

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
        patientFullName: p.patientFullName,
        identification: p.identification,
        age: p.age,
        contact: p.contact,
        address: p.address
      }));

      setPatients(normalized);
      setCurrentPage(1); // Reiniciar a página 1 cuando se cargan nuevos datos
    } catch (err) {
      console.error("Error al obtener la lista de pacientes:", err);
      setError("Error al obtener los datos. Por favor, intente nuevamente.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = patients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(patients.length / itemsPerPage);

  // Cambiar de página
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Calcular números de página para mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la actual
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // --- NUEVA FUNCIÓN: Exportar a PDF ---
  const handleExport = async () => {
    try {
      // Llamar al servicio para obtener el PDF
      const url = await analyticsService.exportPatientsListToPdf();
      
      // Crear un enlace temporal y hacer clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `pacientes_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar la URL cuando ya no se necesite
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al exportar a PDF:', err);
      setError("Error al generar el PDF. Por favor, intente nuevamente.");
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

      {/* Breadcrumb + Botón de Exportación */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BarChart3 className="w-4 h-4" />
          <span>Reportes</span>
          <span>/</span>
          <span className="text-purple-600 font-semibold">Listado de Pacientes</span>
        </div>

        {/* Botón de Exportación PDF */}
        <button
          onClick={handleExport}
          disabled={loading || patients.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
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

        {/* Tabla de pacientes con paginación */}
        {!loading && !error && patients.length > 0 && (
          <>
            {/* Información de paginación superior */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, patients.length)}</span> de{" "}
                <span className="font-semibold">{patients.length}</span> pacientes
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Pacientes por página:</span>
                <span className="font-semibold">{itemsPerPage}</span>
              </div>
            </div>

            {/* Tabla de pacientes */}
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
                  {currentPatients.map((patient, index) => (
                    <tr 
                      key={`${patient.identification}-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.patientFullName}
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
            </div>

            {/* Paginación */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Información de paginación */}
                <div className="text-sm text-gray-600">
                  Página <span className="font-semibold">{currentPage}</span> de{" "}
                  <span className="font-semibold">{totalPages}</span>
                </div>

                {/* Controles de paginación */}
                <div className="flex items-center gap-2">
                  {/* Botón anterior */}
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Números de página */}
                  <div className="flex gap-1">
                    {getPageNumbers().map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                          currentPage === pageNumber
                            ? "bg-purple-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  {/* Botón siguiente */}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Contador total */}
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Total: <span className="font-semibold">{patients.length}</span> pacientes</span>
                  </div>
                </div>
              </div>

              {/* Información de rango (opcional) */}
              <div className="mt-4 text-center text-xs text-gray-500">
                Pacientes {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, patients.length)} de {patients.length}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPatientsList;