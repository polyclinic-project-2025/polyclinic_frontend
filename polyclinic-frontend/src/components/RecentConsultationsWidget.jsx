// components/RecentConsultationsWidget.jsx
import React, { useState, useEffect } from "react";
import { Stethoscope, Clock, FileText, Loader2, AlertCircle, Calendar } from "lucide-react";

const RecentConsultationsWidget = ({service}) => {
  const [recentConsultations, setRecentConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecentConsultations = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await service.getLastTen();
        setRecentConsultations(data);
      } catch (err) {
        const errorMessage = err.message || "Error al cargar las últimas consultas";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadRecentConsultations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-md border border-gray-200">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0" />
        <p className="text-red-800 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3 border-b pb-3 mb-3">
        <Clock className="w-6 h-6 text-cyan-600" />
        <h2 className="text-xl font-bold text-gray-900">
          Últimas 10 Consultas
        </h2>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {recentConsultations.length === 0 ? (
          <p className="text-gray-500 italic">No hay consultas recientes.</p>
        ) : (
          recentConsultations.map((consult) => (
            <div
              key={consult.id}
              className="border-l-4 border-cyan-500 pl-4 py-1.5 hover:bg-gray-50 transition"
            >
              <p className="font-medium text-gray-900">
                {consult.patientFullName || "Paciente Desconocido"}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(consult.dateTimeCRem).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        timeZone: "UTC", // <--- FUERZA la visualización en UTC
                      }
                    )}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" />
                  <span>Dr. {consult.doctorFullName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-xs">{consult.diagnosis}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentConsultationsWidget;