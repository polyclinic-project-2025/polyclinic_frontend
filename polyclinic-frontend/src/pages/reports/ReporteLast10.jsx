// pages/reportes/ReporteLast10.jsx
import React from "react";
import { Clock, BarChart3 } from "lucide-react";
import RecentConsultationsWidget from "../../components/RecentConsultationsWidget";
import analyticsService from "../../services/analyticsService";

const ReporteLast10 = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Últimas 10 Consultas
            </h1>
            <p className="text-purple-50 mt-1">
              Visualiza el historial reciente de consultas médicas registradas
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BarChart3 className="w-4 h-4" />
        <span>Reportes</span>
        <span>/</span>
        <span className="text-purple-600 font-semibold">Últimas 10 Consultas</span>
      </div>

      {/* Widget de Últimas 10 Consultas */}
      <RecentConsultationsWidget service={analyticsService} />
    </div>
  );
};

export default ReporteLast10;