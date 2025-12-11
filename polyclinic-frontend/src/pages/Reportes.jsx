// pages/Reportes.jsx
import React from "react";
import { BarChart3 } from "lucide-react";
import RecentConsultationsWidget from "../components/RecentConsultationsWidget";
import ConsultationsDateRangeFilter from "../components/ConsultationsDateRangeFilter";
import analyticsService from "../services/analyticsService";

const Reportes = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="text-cyan-600" />
            Reportes y Estadísticas
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza el historial y estadísticas de consultas médicas.
          </p>
        </div>
      </div>

      {/* Contenedor con los dos widgets uno debajo del otro */}
      <div className="flex flex-col gap-6">
        {/* Widget de Últimas 10 Consultas */}
        <RecentConsultationsWidget service={analyticsService} />
        
        {/* Widget de Búsqueda por Rango de Fechas */}
        <ConsultationsDateRangeFilter service={analyticsService} />
      </div>
    </div>
  );
};

export default Reportes;