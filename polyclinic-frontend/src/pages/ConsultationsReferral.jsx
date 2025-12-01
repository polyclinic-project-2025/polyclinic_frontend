// pages/Consultations.jsx (CON MIDDLEWARE DE PERMISOS)
import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Edit, Search, X, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { consultationReferralService } from '../services/consultationReferralService';
import { ProtectedComponent, usePermissions } from '../middleware/PermissionMiddleware';
import ModalConsultation from '../components/ModalConsultation'

const Departments = () => {
  const { can} = usePermissions(); // ← Hook de permisos
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalConsultation, setShowModalConsultation] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadConsultations();
  }, []);

 const loadConsultations = async () => {
    try {
      setLoading(true);
      const data = await consultationReferralService.getAll();
      setConsultations(data);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar consultas';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
  if (!can('canCreateConsultations')) {
    setError('No tienes permisos para agregar consultas');
    setTimeout(() => setError(''), 3000);
    return;
  }

    setModalMode('create');
    setSelectedConsultation(null);
    setShowModalConsultation(true);  
    setError('');
  };

  const handleEdit = (consultation) => {
    if (!can('canEditConsultation')) {
      setError('No tienes permisos para editar consultas');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setModalMode('edit');
    setSelectedConsultation(consultation);
    setShowModalConsultation(true);  
    setError('');
  };

  const filteredConsultatios = consultations.filter((consult) =>
    consult.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consult.dateTime.toLowerCase().includes(searchTerm.toLowerCase()) || 
    consult.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consult.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consult.diagnostic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consult.medications.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="text-cyan-600" />
            Consultas por Remisión Médica
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las consultas por remisión médica de los pacientes.
          </p>
        </div>
        
        {/* ← BOTÓN PROTEGIDO: Solo visible si tiene permiso */}
        <ProtectedComponent requiredPermission="canCreateConsultations">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Agregar Consulta
          </button>
        </ProtectedComponent>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar consultas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
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
          <CheckCircle2 className="text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-5 h-5 text-green-600" />
          </button>
        </div>
      )}

      <ProtectedComponent requiredPermission={"canCreateConsultation"}>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-800">
            Solo el doctor principal agrega o edita consultas.
          </p>
        </div>
      </ProtectedComponent>

      {/* Consultations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConsultatios.map((consultation) => (
          <div
            key={consultation.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {consultation.patientName}
                  </h3>
                </div>
              </div>
              
              {/* ← BOTONES DE ACCIÓN PROTEGIDOS */}
              <div className="flex gap-2">
                <ProtectedComponent requiredPermission="canEditConsultation">
                  <button
                    onClick={() => handleEdit(consultation)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </ProtectedComponent>
              </div>
            </div>
            {consultation.department && (
              <p className="text-gray-600 text-sm">{consultation.department}</p>
            )}
          </div>
        ))}
      </div>

      {filteredConsultatios.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No se encontraron consultas con ese criterio' : 'No hay consultas registradas'}
          </p>
        </div>
      )}

      {/* Modal Create Consultation*/}
      <ModalConsultation
                modalMode={modalMode}
                selected={selectedConsultation} 
                loadConsultations = {loadConsultations}
                isOpen={showModalConsultation} 
                onClose={() => setShowModalConsultation(false)} 
      />
      
    </div>
  );
};

export default Departments;
