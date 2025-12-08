// pages/Referrals.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Calendar, Plus, Trash2, Search, X, Loader2, 
  AlertCircle, CheckCircle2, ExternalLink, User, IdCard
} from 'lucide-react';
import { referralService } from '../services/referralService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../context/AuthContext';
import { ProtectedComponent, usePermissions } from '../middleware/PermissionMiddleware';
import PatientCIValidator from '../components/PatientCIValidator';
import CustomDatePicker from '../components/CustomDatePicker';
import Pagination from '../components/Pagination';

const Referrals = () => {
  const { hasRole } = useAuth();
  const { can, isAdmin } = usePermissions();
  const [referrals, setReferrals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    puestoExterno: '',
    departmentToId: '',
    dateTimeRem: new Date()
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Cargar remitidos y departamentos al inicio
  useEffect(() => {
    loadReferrals();
    loadDepartments();
  }, []);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await referralService.getAll();
      setReferrals(data);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar remitidos';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  // Obtener nombre de departamento por ID
  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.departmentId === departmentId);
    return dept ? dept.name : 'Departamento no encontrado';
  };

  // Manejar búsqueda
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const searchTermLower = searchTerm.toLowerCase().trim();
      let searchResults = [];

      // Buscar por puesto externo
      try {
        const byPuestoExterno = await referralService.searchByPuestoExterno(searchTerm);
        searchResults = [...searchResults, ...byPuestoExterno];
      } catch (error) {
        console.log('No results by puesto externo');
      }

      // Buscar por nombre de departamento destino
      try {
        const byDeptTo = await referralService.searchByDepartmentTo(searchTerm);
        searchResults = [...searchResults, ...byDeptTo];
      } catch (error) {
        console.log('No results by department to');
      }

      // Buscar por nombre de paciente
      try {
        const byPatientName = await referralService.searchByPatientName(searchTerm);
        searchResults = [...searchResults, ...byPatientName];
      } catch (error) {
        console.log('No results by patient name');
      }

      // Buscar por identificación
      try {
        const byIdentification = await referralService.searchByIdentification(searchTerm);
        searchResults = [...searchResults, ...byIdentification];
      } catch (error) {
        console.log('No results by identification');
      }

      // Buscar por fecha (si el término parece una fecha)
      if (searchTerm.match(/^\d{2}\/\d{2}\/\d{4}$/) || searchTerm.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const byDate = await referralService.searchByDate(searchTerm);
          searchResults = [...searchResults, ...byDate];
        } catch (error) {
          console.log('No results by date');
        }
      }

      // Eliminar duplicados por referralId
      const uniqueResults = searchResults.filter((referral, index, self) =>
        index === self.findIndex(r => r.referralId === referral.referralId)
      );

      setReferrals(uniqueResults);
    } catch (err) {
      const errorMessage = err.message || 'Error en la búsqueda';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar búsqueda cuando searchTerm cambia (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Resetear a página 1 cuando cambie searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Calcular items para la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReferrals = referrals.slice(startIndex, endIndex);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(referrals.length / ITEMS_PER_PAGE);

  // Abrir modal de detalles
  const handleViewDetails = (referral) => {
    setSelectedReferral(referral);
    setShowModalDetails(true);
  };

  // Abrir modal para crear
  const handleCreate = () => {
    if (!can('canCreateReferrals')) {
      setError('No tienes permisos para crear remitidos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedPatient(null);
    setFormData({
      puestoExterno: '',
      departmentToId: '',
      dateTimeRem: new Date()
    });
    setShowModalCreate(true);
    setError('');
  };

  // Eliminar remitido
  const handleDelete = async (referralId, patientName) => {
    if (!can('canDeleteReferrals')) {
      setError('No tienes permisos para eliminar remitidos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar el remitido del paciente "${patientName}"?`)) {
      return;
    }

    try {
      await referralService.delete(referralId);
      setSuccess('Remitido eliminado exitosamente');
      loadReferrals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar remitido';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Guardar remitido
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      setError('Debe seleccionar un paciente válido');
      return;
    }

    if (!formData.puestoExterno.trim() || !formData.departmentToId) {
      setError('Debe completar puesto externo y departamento destino');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const dataToSend = {
        puestoExterno: formData.puestoExterno,
        departmentToId: formData.departmentToId,
        patientId: selectedPatient.patientId,
        dateTimeRem: formData.dateTimeRem.toISOString()
      };

      await referralService.create(dataToSend);
      setSuccess('Remitido creado exitosamente');
      setShowModalCreate(false);
      loadReferrals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al crear remitido';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    loadReferrals();
  };

  if (loading && !isSearching) {
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
            <ExternalLink className="text-cyan-600" />
            Pacientes Remitidos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los pacientes remitidos desde puestos externos
          </p>
        </div>

        <ProtectedComponent requiredPermission="canCreateReferrals">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nuevo Remitido
          </button>
        </ProtectedComponent>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por: puesto externo, depto destino, paciente, identificación o fecha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
          </div>
        )}
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Información de búsqueda */}
      {isSearching && searchTerm && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            Buscando: "{searchTerm}" • {referrals.length} remitido{referrals.length !== 1 ? 's' : ''} encontrado{referrals.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

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

      {/* Referrals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedReferrals.map((referral) => (
          <div
            key={referral.referralId}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {referral.patientName || 'Paciente sin nombre'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    CI: {referral.patientIdentification || 'N/A'}
                  </p>
                </div>
              </div>
              
              <ProtectedComponent requiredPermission="canDeleteReferrals">
                <button
                  onClick={() => handleDelete(referral.referralId, referral.patientName)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </ProtectedComponent>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-900">Puesto Externo</p>
                  </div>
                  <p className="text-gray-700">
                    {referral.puestoExterno || 'No especificado'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Departamento Destino</p>
                    <p className="text-gray-700">
                      {referral.departmentToName || getDepartmentName(referral.departmentToId)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {referral.dateTimeRem ? 
                      new Date(referral.dateTimeRem).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'Fecha no disponible'
                    }
                  </span>
                </div>
                
                <button
                  onClick={() => handleViewDetails(referral)}
                  className="text-cyan-600 hover:text-cyan-800 font-medium text-sm"
                >
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginación */}
      {referrals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={referrals.length}
        />
      )}

      {referrals.length === 0 && (
        <div className="text-center py-12">
          <ExternalLink className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'No se encontraron remitidos con ese criterio'
              : 'No hay pacientes remitidos'}
          </p>
        </div>
      )}

      {/* Modal de Detalles */}
      {showModalDetails && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles de Remitido
                </h2>
                <button
                  onClick={() => setShowModalDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del Paciente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-600" />
                  Información del Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {selectedReferral.patientName || 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identificación
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {selectedReferral.patientIdentification || 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Remitido */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-cyan-600" />
                  Información del Remitido
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puesto Externo
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {selectedReferral.puestoExterno || 'No especificado'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento Destino
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {selectedReferral.departmentToName || getDepartmentName(selectedReferral.departmentToId)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Remisión
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {selectedReferral.dateTimeRem ? 
                        new Date(selectedReferral.dateTimeRem).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        }) : 'Fecha no disponible'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModalDetails(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
              
              <ProtectedComponent requiredPermission="canDeleteReferrals">
                <button
                  onClick={() => {
                    setShowModalDetails(false);
                    handleDelete(selectedReferral.referralId, selectedReferral.patientName);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Eliminar Remitido
                </button>
              </ProtectedComponent>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear */}
      {showModalCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nuevo Remitido
                </h2>
                <button
                  onClick={() => setShowModalCreate(false)}
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
                  Paciente
                </h3>
                <PatientCIValidator
                  onPatientSelect={setSelectedPatient}
                  selectedPatient={selectedPatient}
                />
              </div>

              {/* Puesto Externo y Departamento Destino */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información de Remisión
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puesto Externo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.puestoExterno}
                      onChange={(e) => setFormData({ ...formData, puestoExterno: e.target.value })}
                      placeholder="Nombre del puesto externo (ej: Policlínico Central, Hospital General)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
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
                      <option value="">Seleccionar departamento destino...</option>
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
                  Fecha
                </h3>
                <div className="w-full">
                  <CustomDatePicker
                    selected={formData.dateTimeRem}
                    onChange={(date) => setFormData({ ...formData, dateTimeRem: date })}
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
                  onClick={() => setShowModalCreate(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={submitting || !selectedPatient}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Remitido'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;