// components/DerivationFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { departmentService } from '../services/departmentService';
import PatientCIValidator from './PatientCIValidator';

const DerivationFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  error,
  submitting 
}) => {
  const [departments, setDepartments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    departmentFromId: '',
    departmentToId: '',
    dateTimeDer: new Date()
  });

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      return;
    }

    if (!formData.departmentFromId || !formData.departmentToId) {
      return;
    }

    const dataToSend = {
      ...formData,
      patientId: selectedPatient.patientId,
      dateTimeDer: formData.dateTimeDer.toISOString()
    };

    onSubmit(dataToSend, selectedPatient);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Nueva Derivación
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de Paciente */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Paciente *
            </h3>
            <PatientCIValidator
              onPatientSelect={setSelectedPatient}
              selectedPatient={selectedPatient}
            />
          </div>

          {/* Departamentos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Departamentos *
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento Origen *
                </label>
                <select
                  required
                  value={formData.departmentFromId}
                  onChange={(e) => setFormData({ ...formData, departmentFromId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Seleccionar origen...</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento Destino *
                </label>
                <select
                  required
                  value={formData.departmentToId}
                  onChange={(e) => setFormData({ ...formData, departmentToId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Seleccionar destino...</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fecha *
            </h3>
            <div className="w-full">
              <input
                type="datetime-local"
                required
                value={formData.dateTimeDer.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, dateTimeDer: new Date(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={submitting || !selectedPatient}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Derivación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DerivationFormModal;