// pages/reportes/ReporteDateRange.jsx
import React from "react";
import { Calendar, BarChart3 } from "lucide-react";
import ConsultationsDateRangeFilter from "../../components/ConsultationsDateRangeFilter";
import analyticsService from "../../services/analyticsService";

const ReporteDateRange = () => {
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

      {/* Widget de Búsqueda por Rango de Fechas */}
      <ConsultationsDateRangeFilter service={analyticsService} />
    </div>
  );
};

export default ReporteDateRange;