// pages/Derivations.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Calendar, Plus, Trash2, Search, X, Loader2, 
  AlertCircle, CheckCircle2, ArrowRight, User, IdCard
} from 'lucide-react';
import { derivationService } from '../services/derivationService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../context/AuthContext';
import { ProtectedComponent, usePermissions } from '../middleware/PermissionMiddleware';
import PatientCIValidator from '../components/PatientCIValidator';
import CustomDatePicker from '../components/CustomDatePicker';

const Derivations = () => {
  const { hasRole } = useAuth();
  const { can, isAdmin } = usePermissions();
  const [derivations, setDerivations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [selectedDerivation, setSelectedDerivation] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    departmentFromId: '',
    departmentToId: '',
    dateTimeDer: new Date()
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Cargar derivaciones y departamentos al inicio
  useEffect(() => {
    loadDerivations();
    loadDepartments();
  }, []);

  const loadDerivations = async () => {
    try {
      setLoading(true);
      const data = await derivationService.getAll();
      setDerivations(data);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar derivaciones';
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

      // Buscar por nombre de departamento origen
      try {
        const byDeptFrom = await derivationService.searchByDepartmentFrom(searchTerm);
        searchResults = [...searchResults, ...byDeptFrom];
      } catch (error) {
        console.log('No results by department from');
      }

      // Buscar por nombre de departamento destino
      try {
        const byDeptTo = await derivationService.searchByDepartmentTo(searchTerm);
        searchResults = [...searchResults, ...byDeptTo];
      } catch (error) {
        console.log('No results by department to');
      }

      // Buscar por nombre de paciente
      try {
        const byPatientName = await derivationService.searchByPatientName(searchTerm);
        searchResults = [...searchResults, ...byPatientName];
      } catch (error) {
        console.log('No results by patient name');
      }

      // Buscar por identificación
      try {
        const byIdentification = await derivationService.searchByIdentification(searchTerm);
        searchResults = [...searchResults, ...byIdentification];
      } catch (error) {
        console.log('No results by identification');
      }

      // Buscar por fecha (si el término parece una fecha)
      if (searchTerm.match(/^\d{2}\/\d{2}\/\d{4}$/) || searchTerm.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const byDate = await derivationService.searchByDate(searchTerm);
          searchResults = [...searchResults, ...byDate];
        } catch (error) {
          console.log('No results by date');
        }
      }

      // Eliminar duplicados por derivationId
      const uniqueResults = searchResults.filter((derivation, index, self) =>
        index === self.findIndex(d => d.derivationId === derivation.derivationId)
      );

      setDerivations(uniqueResults);
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

  // Abrir modal de detalles
  const handleViewDetails = (derivation) => {
    setSelectedDerivation(derivation);
    setShowModalDetails(true);
  };

  // Abrir modal para crear
  const handleCreate = () => {
    if (!can('canCreateDerivations')) {
      setError('No tienes permisos para crear derivaciones');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedPatient(null);
    setFormData({
      departmentFromId: '',
      departmentToId: '',
      dateTimeDer: new Date()
    });
    setShowModalCreate(true);
    setError('');
  };

  // Eliminar derivación
  const handleDelete = async (derivationId, patientName) => {
    if (!can('canDeleteDerivations')) {
      setError('No tienes permisos para eliminar derivaciones');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la derivación del paciente "${patientName}"?`)) {
      return;
    }

    try {
      await derivationService.delete(derivationId);
      setSuccess('Derivación eliminada exitosamente');
      loadDerivations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar derivación';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Guardar derivación
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      setError('Debe seleccionar un paciente válido');
      return;
    }

    if (!formData.departmentFromId || !formData.departmentToId) {
      setError('Debe seleccionar departamento origen y destino');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const dataToSend = {
        departmentFromId: formData.departmentFromId,
        departmentToId: formData.departmentToId,
        patientId: selectedPatient.patientId,
        dateTimeDer: formData.dateTimeDer.toISOString()
      };

      await derivationService.create(dataToSend);
      setSuccess('Derivación creada exitosamente');
      setShowModalCreate(false);
      loadDerivations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al crear derivación';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    loadDerivations();
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
            <ArrowRight className="text-cyan-600" />
            Derivaciones Internas
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las derivaciones de pacientes entre departamentos
          </p>
        </div>

        <ProtectedComponent requiredPermission="canCreateDerivations">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nueva Derivación
          </button>
        </ProtectedComponent>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por: nombre depto, paciente, identificación o fecha..."
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
            Buscando: "{searchTerm}" • {derivations.length} derivación{derivations.length !== 1 ? 'es' : ''} encontrada{derivations.length !== 1 ? 's' : ''}
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

      {/* Derivations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {derivations.map((derivation) => (
          <div
            key={derivation.derivationId}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {derivation.patientName || 'Paciente sin nombre'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    CI: {derivation.patientIdentification || 'N/A'}
                  </p>
                </div>
              </div>
              
              <ProtectedComponent requiredPermission="canDeleteDerivations">
                <button
                  onClick={() => handleDelete(derivation.derivationId, derivation.patientName)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </ProtectedComponent>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Building2 className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">
                    {derivation.departmentFromName || getDepartmentName(derivation.departmentFromId)}
                  </p>
                  <p className="text-xs text-gray-500">Origen</p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-cyan-600" />
                
                <div className="text-center">
                  <Building2 className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-sm font-medium text-gray-900">
                    {derivation.departmentToName || getDepartmentName(derivation.departmentToId)}
                  </p>
                  <p className="text-xs text-gray-500">Destino</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {derivation.dateTimeDer ? 
                      new Date(derivation.dateTimeDer).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'Fecha no disponible'
                    }
                  </span>
                </div>
                
                <button
                  onClick={() => handleViewDetails(derivation)}
                  className="text-cyan-600 hover:text-cyan-800 font-medium text-sm"
                >
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {derivations.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'No se encontraron derivaciones con ese criterio'
              : 'No hay derivaciones registradas'}
          </p>
        </div>
      )}

      {/* Modal de Detalles */}
      {showModalDetails && selectedDerivation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles de Derivación
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
                      {selectedDerivation.patientName || 'No disponible'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identificación
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {selectedDerivation.patientIdentification || 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de Derivación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-cyan-600" />
                  Información de Derivación
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento Origen
                      </label>
                      <p className="text-gray-900 p-2 bg-gray-50 rounded">
                        {selectedDerivation.departmentFromName || getDepartmentName(selectedDerivation.departmentFromId)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento Destino
                      </label>
                      <p className="text-gray-900 p-2 bg-gray-50 rounded">
                        {selectedDerivation.departmentToName || getDepartmentName(selectedDerivation.departmentToId)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Derivación
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded">
                      {selectedDerivation.dateTimeDer ? 
                        new Date(selectedDerivation.dateTimeDer).toLocaleDateString('es-ES', {
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
              
              <ProtectedComponent requiredPermission="canDeleteDerivations">
                <button
                  onClick={() => {
                    setShowModalDetails(false);
                    handleDelete(selectedDerivation.derivationId, selectedDerivation.patientName);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Eliminar Derivación
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
                  Nueva Derivación
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

              {/* Departamentos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Departamentos
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
                  Fecha
                </h3>
                <div className="w-full">
                  <CustomDatePicker
                    selected={formData.dateTimeDer}
                    onChange={(date) => setFormData({ ...formData, dateTimeDer: date })}
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
                    'Crear Derivación'
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

export default Derivations;