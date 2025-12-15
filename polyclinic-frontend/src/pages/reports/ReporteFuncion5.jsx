// pages/reportes/ReporteFuncion5.jsx
import React, { useState } from "react";
import { Activity, BarChart3, Download, AlertCircle, X } from "lucide-react";
import MedicationConsumptionFilter from "../../components/MedicationConsumptionFilter";
import analyticsService from "../../services/analyticsService";
import medicationService from "../../services/medicationService";

const ReporteFuncion5 = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [exportParams, setExportParams] = useState(null);

  const handleExport = async () => {
    if (!exportParams || !exportParams.medicationId || !exportParams.month || !exportParams.year) {
      setError('Debe realizar una búsqueda antes de exportar');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      setLoading(true);
      console.log('Exportando con parámetros:', exportParams);
      const url = await analyticsService.getMedicationConsumptionPdf(exportParams);
      
      // Crear un enlace temporal y hacer clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `consumo_medicamento_${exportParams.month}_${exportParams.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar la URL cuando ya no se necesite
      URL.revokeObjectURL(url);
      
      setSuccess('Consumo de medicamento exportado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al exportar consumo de medicamento';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Consumo Acumulado de Medicamentos
            </h1>
            <p className="text-orange-50 mt-1">
              Consulta el consumo mensual y compara con niveles de inventario
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BarChart3 className="w-4 h-4" />
        <span>Reportes</span>
        <span>/</span>
        <span className="text-orange-600 font-semibold">Consumo de Medicamentos</span>
      </div>

      {/* Botón de exportación */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Widget de Búsqueda de Consumo */}
      <MedicationConsumptionFilter 
        analyticsService={analyticsService}
        medicationService={medicationService}
        onSearchParams={setExportParams}
      />
    </div>
  );
};

export default ReporteFuncion5;