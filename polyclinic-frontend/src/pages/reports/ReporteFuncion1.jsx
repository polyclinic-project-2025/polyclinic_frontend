// pages/reportes/ReporteFuncion1.jsx
import React, { useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

const ReporteFuncion1 = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              Función 1
            </h1>
            <p className="text-blue-50 mt-1">
              Descripción de la funcionalidad del reporte 1
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BarChart3 className="w-4 h-4" />
        <span>Reportes</span>
        <span>/</span>
        <span className="text-blue-600 font-semibold">Función 1</span>
      </div>

      {/* Contenido del Reporte */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Contenido del Reporte
        </h2>
        
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Reporte en desarrollo
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Aquí irá el contenido específico de la Función 1
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReporteFuncion1;