// pages/reportes/ReporteFuncion5.jsx
import React from "react";
import { Activity, BarChart3 } from "lucide-react";
import MedicationConsumptionFilter from "../../components/MedicationConsumptionFilter";
import analyticsService from "../../services/analyticsService";
import medicationService from "../../services/medicationService";

const ReporteFuncion5 = () => {
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

      {/* Widget de Búsqueda de Consumo */}
      <MedicationConsumptionFilter 
        analyticsService={analyticsService}
        medicationService={medicationService}
      />
    </div>
  );
};

export default ReporteFuncion5;