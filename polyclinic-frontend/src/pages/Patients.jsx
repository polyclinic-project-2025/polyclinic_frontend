// pages/Patients.jsx (CON BOTONES COMO DEPARTMENTS)
import React, { useState, useEffect } from 'react';
import {
  Users, Plus, SquarePen, Trash2, Search, X, Loader2, AlertCircle, CheckCircle2,
  User, Phone, MapPin, IdCard, Calendar, Filter,
  ArrowRight, ExternalLink, Building2, Download
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { derivationService } from '../services/derivationService';
import { referralService } from '../services/referralService';
import { departmentService } from '../services/departmentService';
import { useAuth } from '../context/AuthContext';
import { ProtectedComponent, usePermissions } from '../middleware/PermissionMiddleware';
import PatientCIValidator from '../components/PatientCIValidator';
import Pagination from '../components/Pagination';
import { formatDateMedium, formatDateTimeForBackend } from '../utils/dateUtils';

const Patients = () => {
  const { hasRole } = useAuth();
  const { can, isAdmin } = usePermissions();
  
  // Estados principales
  const [patients, setPatients] = useState([]);
  const [derivations, setDerivations] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para modales de paciente
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [showModalForm, setShowModalForm] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    identification: '',
    age: '',
    contact: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para derivaciones
  const [showDerivationModal, setShowDerivationModal] = useState(false);
  const [derivationFormData, setDerivationFormData] = useState({
    departmentFromId: '',
    departmentToId: '',
    dateTimeDer: new Date()
  });
  const [selectedDerivationPatient, setSelectedDerivationPatient] = useState(null);
  const [derivationSubmitting, setDerivationSubmitting] = useState(false);
  
  // Estados para remisiones
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralFormData, setReferralFormData] = useState({
    puestoExterno: '',
    departmentToId: '',
    dateTimeRem: new Date()
  });
  const [selectedReferralPatient, setSelectedReferralPatient] = useState(null);
  const [referralSubmitting, setReferralSubmitting] = useState(false);
  
  // Estados para filtros y datos
  const [filterType, setFilterType] = useState('all');
  const [departments, setDepartments] = useState([]);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Cargar datos iniciales
  useEffect(() => {
    loadAllPatients();
    loadDepartments();
  }, []);

  // Cargar datos según filtro
  useEffect(() => {
    if (filterType === 'derived') {
      loadDerivations();
    } else if (filterType === 'referred') {
      loadReferrals();
    } else {
      loadAllPatients();
    }
    // Resetear a página 1 cuando cambie el filtro
    setCurrentPage(1);
  }, [filterType]);

  const loadAllPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar pacientes';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

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

  // Búsqueda con funciones dentro del useEffect para evitar advertencias
  useEffect(() => {
    // Función para buscar derivaciones (DENTRO del useEffect)
    const handleSearchDerivations = async () => {
      if (!searchTerm.trim()) {
        setIsSearching(false);
        loadDerivations();
        return;
      }

      setIsSearching(true);
      setLoading(true);

      try {
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

        // Buscar por fecha
        if (searchTerm.match(/^\d{2}\/\d{2}\/\d{4}$/) || searchTerm.match(/^\d{4}-\d{2}-\d{2}$/)) {
          try {
            const byDate = await derivationService.searchByDate(searchTerm);
            searchResults = [...searchResults, ...byDate];
          } catch (error) {
            console.log('No results by date');
          }
        }

        // Eliminar duplicados
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
        setIsSearching(false);
      }
    };

    // Función para buscar remisiones (DENTRO del useEffect)
    const handleSearchReferrals = async () => {
      if (!searchTerm.trim()) {
        setIsSearching(false);
        loadReferrals();
        return;
      }

      setIsSearching(true);
      setLoading(true);

      try {
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

        // Buscar por fecha
        if (searchTerm.match(/^\d{2}\/\d{2}\/\d{4}$/) || searchTerm.match(/^\d{4}-\d{2}-\d{2}$/)) {
          try {
            const byDate = await referralService.searchByDate(searchTerm);
            searchResults = [...searchResults, ...byDate];
          } catch (error) {
            console.log('No results by date');
          }
        }

        // Eliminar duplicados
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
        setIsSearching(false);
      }
    };

    // Función para buscar pacientes (DENTRO del useEffect)
    const handleSearchPatients = () => {
      if (!searchTerm.trim()) {
        setIsSearching(false);
        loadAllPatients();
        return;
      }

      setIsSearching(true);
      setLoading(true);

      try {
        const filteredPatients = patients.filter(patient =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.age.toString().includes(searchTerm) ||
          (patient.contact && patient.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (patient.address && patient.address.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setPatients(filteredPatients);
      } catch (err) {
        const errorMessage = err.message || 'Error en la búsqueda';
        setError(errorMessage);
        setTimeout(() => setError(''), 5000);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      if (filterType === 'derived') {
        handleSearchDerivations();
      } else if (filterType === 'referred') {
        handleSearchReferrals();
      } else {
        handleSearchPatients();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, filterType]);

  // Resetear a página 1 cuando cambie searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calcular items para la página actual
  const getCurrentPageItems = (items) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return items.slice(startIndex, endIndex);
  };

  // Calcular total de páginas
  const getTotalPages = (items) => {
    return Math.ceil(items.length / ITEMS_PER_PAGE);
  };

  // Obtener items paginados según el filtro activo
  const paginatedPatients = getCurrentPageItems(patients);
  const paginatedDerivations = getCurrentPageItems(derivations);
  const paginatedReferrals = getCurrentPageItems(referrals);

  // Obtener nombre de departamento
  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.departmentId === departmentId);
    return dept ? dept.name : 'Departamento no encontrado';
  };

  // ========== FUNCIONES PARA PACIENTES ==========
  
  // Crear paciente
  const handleCreatePatient = () => {
    if (!can('canCreatePatients')) {
      setError('No tienes permisos para crear pacientes');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setModalMode('create');
    setPatientFormData({
      name: '',
      identification: '',
      age: '',
      contact: '',
      address: ''
    });
    setSelectedPatient(null);
    setShowModalForm(true);
    setError('');
  };

  // Editar paciente (desde botón en tarjeta)
  const handleEditPatient = (patient) => {
    if (!can('canEditPatients')) {
      setError('No tienes permisos para editar pacientes');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setModalMode('edit');
    setPatientFormData({
      name: patient.name,
      identification: patient.identification,
      age: patient.age.toString(),
      contact: patient.contact || '',
      address: patient.address || ''
    });
    setSelectedPatient(patient);
    setShowModalForm(true);
    setError('');
  };

  // Eliminar paciente (desde botón en tarjeta)
  const handleDeletePatient = async (patientId, patientName) => {
    if (!can('canDeletePatients')) {
      setError('No tienes permisos para eliminar pacientes');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar al paciente "${patientName}"?`)) {
      return;
    }

    try {
      await patientService.delete(patientId);
      setSuccess('Paciente eliminado exitosamente');
      loadAllPatients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar paciente';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Guardar paciente (crear o editar)
  const handleSubmitPatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const dataToSend = {
        name: patientFormData.name,
        identification: patientFormData.identification,
        age: parseInt(patientFormData.age),
        contact: patientFormData.contact,
        address: patientFormData.address
      };

      if (modalMode === 'create') {
        await patientService.create(dataToSend);
        setSuccess('Paciente creado exitosamente');
      } else {
        await patientService.update(selectedPatient.patientId, dataToSend);
        setSuccess('Paciente actualizado exitosamente');
      }

      setShowModalForm(false);
      loadAllPatients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || `Error al ${modalMode === 'create' ? 'crear' : 'actualizar'} paciente`;
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ========== FUNCIONES PARA DERIVACIONES ==========
  
  const handleCreateDerivation = () => {
    if (!can('canCreateDerivations')) {
      setError('No tienes permisos para crear derivaciones');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSelectedDerivationPatient(null);
    setDerivationFormData({
      departmentFromId: '',
      departmentToId: '',
      dateTimeDer: new Date()
    });
    setShowDerivationModal(true);
    setError('');
  };

  const handleDeleteDerivation = async (derivationId, patientName) => {
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

  const handleSubmitDerivation = async (e) => {
    e.preventDefault();
    
    if (!selectedDerivationPatient) {
      setError('Debe seleccionar un paciente válido');
      return;
    }

    if (!derivationFormData.departmentFromId || !derivationFormData.departmentToId) {
      setError('Debe seleccionar departamento origen y destino');
      return;
    }

    setDerivationSubmitting(true);
    setError('');

    try {
      const dataToSend = {
        departmentFromId: derivationFormData.departmentFromId,
        departmentToId: derivationFormData.departmentToId,
        patientId: selectedDerivationPatient.patientId,
        dateTimeDer: formatDateTimeForBackend(derivationFormData.dateTimeDer)
      };

      await derivationService.create(dataToSend);
      setSuccess('Derivación creada exitosamente');
      setShowDerivationModal(false);
      loadDerivations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al crear derivación';
      setError(errorMessage);
    } finally {
      setDerivationSubmitting(false);
    }
  };

  // ========== FUNCIONES PARA REMISIONES ==========
  
  const handleCreateReferral = () => {
    if (!can('canCreateReferrals')) {
      setError('No tienes permisos para crear remitidos');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSelectedReferralPatient(null);
    setReferralFormData({
      puestoExterno: '',
      departmentToId: '',
      dateTimeRem: new Date()
    });
    setShowReferralModal(true);
    setError('');
  };

  const handleDeleteReferral = async (referralId, patientName) => {
    if (!can('canDeleteReferrals')) {
      setError('No tienes permisos para eliminar remitidos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la remisión del paciente "${patientName}"?`)) {
      return;
    }

    try {
      await referralService.delete(referralId);
      setSuccess('Remisión eliminada exitosamente');
      loadReferrals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar remisión';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmitReferral = async (e) => {
    e.preventDefault();
    
    if (!selectedReferralPatient) {
      setError('Debe seleccionar un paciente válido');
      return;
    }

    if (!referralFormData.puestoExterno.trim() || !referralFormData.departmentToId) {
      setError('Debe completar puesto externo y departamento destino');
      return;
    }

    setReferralSubmitting(true);
    setError('');

    try {
      const dataToSend = {
        puestoExterno: referralFormData.puestoExterno,
        departmentToId: referralFormData.departmentToId,
        patientId: selectedReferralPatient.patientId,
        dateTimeRem: formatDateTimeForBackend(referralFormData.dateTimeRem)
      };

      await referralService.create(dataToSend);
      setSuccess('Remisión creada exitosamente');
      setShowReferralModal(false);
      loadReferrals();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al crear remisión';
      setError(errorMessage);
    } finally {
      setReferralSubmitting(false);
    }
  };

  // ========== FUNCIÓN PARA EXPORTAR PACIENTES ==========
  
  const handleExportPatients = async () => {
    if (!can('canExportPatients')) {
      setError('No tienes permisos para exportar pacientes');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const url = await patientService.exportToPdf();
      
      // Crear un enlace temporal y hacer clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `pacientes_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar la URL cuando ya no se necesite
      URL.revokeObjectURL(url);
      
      setSuccess('Pacientes exportados exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al exportar pacientes';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Obtener badge según filtro
  const getFilterBadge = () => {
    switch (filterType) {
      case 'derived':
        return { 
          label: 'Derivaciones', 
          icon: ArrowRight, 
          badgeColor: 'bg-blue-600 text-white'
        };
      case 'referred':
        return { 
          label: 'Remisiones', 
          icon: ExternalLink, 
          badgeColor: 'bg-purple-600 text-white'
        };
      default:
        return { 
          label: 'Pacientes', 
          icon: Users, 
          badgeColor: 'bg-cyan-600 text-white'
        };
    }
  };

  const filterBadge = getFilterBadge();
  const FilterIcon = filterBadge.icon;

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
            <Users className="text-cyan-600" />
            {filterType === 'derived' ? 'Derivaciones' : 
             filterType === 'referred' ? 'Remisiones' : 'Pacientes'}
          </h1>
          <p className="text-gray-600 mt-1">
            {filterType === 'derived' ? 'Gestiona las derivaciones de pacientes entre departamentos' :
             filterType === 'referred' ? 'Gestiona los pacientes remitidos desde puestos externos' :
             'Gestiona los pacientes del policlínico'}
          </p>
        </div>

        <div className="flex gap-3">
          {filterType === 'all' && (
            <>
              <ProtectedComponent requiredPermission="canExportPatients">
                <button
                  onClick={handleExportPatients}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg"
                  disabled={loading}
                >
                  <Download className="w-5 h-5" />
                  Exportar PDF
                </button>
              </ProtectedComponent>
              
              <ProtectedComponent requiredPermission="canCreatePatients">
                <button
                  onClick={handleCreatePatient}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Paciente
                </button>
              </ProtectedComponent>
            </>
          )}

          {filterType === 'derived' && (
            <ProtectedComponent requiredPermission="canCreateDerivations">
              <button
                onClick={handleCreateDerivation}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nueva Derivación
              </button>
            </ProtectedComponent>
          )}

          {filterType === 'referred' && (
            <ProtectedComponent requiredPermission="canCreateReferrals">
              <button
                onClick={handleCreateReferral}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nueva Remisión
              </button>
            </ProtectedComponent>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={
            filterType === 'all' 
              ? "Buscar por nombre, identificación o edad..."
              : filterType === 'derived'
              ? "Buscar por: nombre depto, paciente, identificación o fecha..."
              : "Buscar por: puesto externo, depto destino, paciente, identificación o fecha..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${filterType === 'all' ? filterBadge.badgeColor : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Users className="w-4 h-4" />
            Pacientes
          </button>
          <button
            onClick={() => setFilterType('derived')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${filterType === 'derived' ? filterBadge.badgeColor : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <ArrowRight className="w-4 h-4" />
            Derivaciones
          </button>
          <button
            onClick={() => setFilterType('referred')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${filterType === 'referred' ? filterBadge.badgeColor : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <ExternalLink className="w-4 h-4" />
            Remisiones
          </button>
        </div>
      </div>

      {/* Información de búsqueda */}
      {searchTerm && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            Buscando: "{searchTerm}" • 
            {filterType === 'all' && ` ${patients.length} paciente${patients.length !== 1 ? 's' : ''}`}
            {filterType === 'derived' && ` ${derivations.length} derivación${derivations.length !== 1 ? 'es' : ''}`}
            {filterType === 'referred' && ` ${referrals.length} remisión${referrals.length !== 1 ? 'es' : ''}`}
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

      {/* CONTENIDO SEGÚN FILTRO */}

      {/* Grid de Pacientes (CON BOTONES COMO DEPARTMENTS) */}
      {filterType === 'all' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPatients.map((patient) => (
            <div
              key={patient.patientId}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      CI: {patient.identification}
                    </p>
                  </div>
                </div>
                
                {/* BOTONES DE ACCIÓN PROTEGIDOS - COMO DEPARTMENTS */}
                <div className="flex gap-2">
                  <ProtectedComponent requiredPermission="canEditPatients">
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                  </ProtectedComponent>
                  
                  <ProtectedComponent requiredPermission="canDeletePatients">
                    <button
                      onClick={() => handleDeletePatient(patient.patientId, patient.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </ProtectedComponent>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{patient.age} años</span>
                </div>
                {patient.contact && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{patient.contact}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Paginación para pacientes */}
        {patients.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages(patients)}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={patients.length}
          />
        )}
        </>
      )}

      {/* Grid de Derivaciones */}
      {filterType === 'derived' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedDerivations.map((derivation) => (
            <div
              key={derivation.derivationId}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
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
                    onClick={() => handleDeleteDerivation(derivation.derivationId, derivation.patientName)}
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
                  
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                  
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
                        formatDateMedium(derivation.dateTimeDer) : 'Fecha no disponible'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Paginación para derivaciones */}
        {derivations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages(derivations)}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={derivations.length}
          />
        )}
        </>
      )}

      {/* Grid de Remisiones */}
      {filterType === 'referred' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedReferrals.map((referral) => (
            <div
              key={referral.referralId}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
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
                    onClick={() => handleDeleteReferral(referral.referralId, referral.patientName)}
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
                        formatDateMedium(referral.dateTimeRem) : 'Fecha no disponible'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Paginación para remisiones */}
        {referrals.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={getTotalPages(referrals)}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={referrals.length}
          />
        )}
        </>
      )}

      {/* Mensajes de vacío */}
      {filterType === 'all' && patients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'No se encontraron pacientes con ese criterio'
              : 'No hay pacientes registrados'}
          </p>
        </div>
      )}

      {filterType === 'derived' && derivations.length === 0 && (
        <div className="text-center py-12">
          <ArrowRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'No se encontraron derivaciones con ese criterio'
              : 'No hay derivaciones registradas'}
          </p>
        </div>
      )}

      {filterType === 'referred' && referrals.length === 0 && (
        <div className="text-center py-12">
          <ExternalLink className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'No se encontraron remisiones con ese criterio'
              : 'No hay remisiones registradas'}
          </p>
        </div>
      )}

      {/* Modal de Formulario de Paciente */}
      {showModalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Nuevo Paciente' : 'Editar Paciente'}
                </h2>
                <button
                  onClick={() => setShowModalForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitPatient} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientFormData.name}
                    onChange={(e) => setPatientFormData({ ...patientFormData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Nombre completo del paciente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientFormData.identification}
                    onChange={(e) => setPatientFormData({ ...patientFormData, identification: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Número de identificación"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="150"
                  value={patientFormData.age}
                  onChange={(e) => setPatientFormData({ ...patientFormData, age: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Edad en años"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contacto *
                </label>
                <input
                  type="text"
                  required
                  value={patientFormData.contact}
                  onChange={(e) => setPatientFormData({ ...patientFormData, contact: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Teléfono o email de contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <textarea
                  required
                  value={patientFormData.address}
                  onChange={(e) => setPatientFormData({ ...patientFormData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  placeholder="Dirección completa"
                />
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
                  onClick={() => setShowModalForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    modalMode === 'create' ? 'Crear' : 'Actualizar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Crear Derivación */}
      {showDerivationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nueva Derivación
                </h2>
                <button
                  onClick={() => setShowDerivationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitDerivation} className="p-6 space-y-6">
              {/* Selección de Paciente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Paciente *
                </h3>
                <PatientCIValidator
                  onPatientSelect={setSelectedDerivationPatient}
                  selectedPatient={selectedDerivationPatient}
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
                      value={derivationFormData.departmentFromId}
                      onChange={(e) => setDerivationFormData({ ...derivationFormData, departmentFromId: e.target.value })}
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
                      value={derivationFormData.departmentToId}
                      onChange={(e) => setDerivationFormData({ ...derivationFormData, departmentToId: e.target.value })}
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
                    value={derivationFormData.dateTimeDer.toISOString().slice(0, 16)}
                    onChange={(e) => setDerivationFormData({ ...derivationFormData, dateTimeDer: new Date(e.target.value) })}
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
                  onClick={() => setShowDerivationModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={derivationSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={derivationSubmitting || !selectedDerivationPatient}
                >
                  {derivationSubmitting ? (
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

      {/* Modal de Crear Remisión */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Nueva Remisión
                </h2>
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitReferral} className="p-6 space-y-6">
              {/* Selección de Paciente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Paciente *
                </h3>
                <PatientCIValidator
                  onPatientSelect={setSelectedReferralPatient}
                  selectedPatient={selectedReferralPatient}
                />
              </div>

              {/* Puesto Externo y Departamento Destino */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información de Remisión *
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puesto Externo *
                    </label>
                    <input
                      type="text"
                      required
                      value={referralFormData.puestoExterno}
                      onChange={(e) => setReferralFormData({ ...referralFormData, puestoExterno: e.target.value })}
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
                      value={referralFormData.departmentToId}
                      onChange={(e) => setReferralFormData({ ...referralFormData, departmentToId: e.target.value })}
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
                  Fecha *
                </h3>
                <div className="w-full">
                  <input
                    type="datetime-local"
                    required
                    value={referralFormData.dateTimeRem.toISOString().slice(0, 16)}
                    onChange={(e) => setReferralFormData({ ...referralFormData, dateTimeRem: new Date(e.target.value) })}
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
                  onClick={() => setShowReferralModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={referralSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={referralSubmitting || !selectedReferralPatient}
                >
                  {referralSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Remisión'
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

export default Patients;