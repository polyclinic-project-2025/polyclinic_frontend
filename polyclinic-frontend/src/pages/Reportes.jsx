// pages/Reportes.jsx
import React from "react";
import { BarChart3 } from "lucide-react";
import RecentConsultationsWidget from "../components/RecentConsultationsWidget";
import unifiedConsultationService from "../services/unifiedConsultationService";

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

      {/* Widget de Consultas Recientes */}
      <div className="mt-6">
        <RecentConsultationsWidget service={unifiedConsultationService} />
      </div>

    </div>
  );
};

export default Reportes;