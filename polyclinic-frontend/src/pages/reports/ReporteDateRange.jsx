// pages/reportes/ReporteDateRange.jsx
import React, { useState } from "react";
import { Calendar, BarChart3, Download, AlertCircle, X } from "lucide-react";
import ConsultationsDateRangeFilter from "../../components/ConsultationsDateRangeFilter";
import analyticsService from "../../services/analyticsService";

const ReporteDateRange = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportParams, setExportParams] = useState(null);

  const handleExport = async () => {
    if (!exportParams || !exportParams.patientId || !exportParams.startDate || !exportParams.endDate) {
      setError('Debe realizar una búsqueda antes de exportar');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      setLoading(true);
      const url = await analyticsService.getByDateRangePdf(exportParams);
      
      // Crear un enlace temporal y hacer clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `consultas_rango_${exportParams.startDate}_${exportParams.endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar la URL cuando ya no se necesite
      URL.revokeObjectURL(url);
      
      setSuccess('Consultas exportadas exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al exportar consultas';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Consultas por Rango de Fechas
            </h1>
            <p className="text-cyan-50 mt-1">
              Filtra y visualiza las consultas médicas en un período específico
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BarChart3 className="w-4 h-4" />
        <span>Reportes</span>
        <span>/</span>
        <span className="text-cyan-600 font-semibold">Consultas por Rango de Fechas</span>
      </div>

      {/* Botón de exportación */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !exportParams}
        >
          <Download className="w-5 h-5" />
          Exportar PDF
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-5 h-5 text-green-600" />
          </button>
        </div>
      )}

      {/* Widget de Búsqueda por Rango de Fechas */}
      <ConsultationsDateRangeFilter 
        service={analyticsService}
        onSearchParams={setExportParams}
      />
    </div>
  );
};

export default ReporteDateRange;