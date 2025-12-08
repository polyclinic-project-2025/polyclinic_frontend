// pages/Departments.jsx
import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, SquarePen, Trash2, Search, X, Loader2, AlertCircle, CheckCircle2, UserCog, User, Download
} from 'lucide-react';
import { departmentService } from '../services/departmentService';
import { departmentHeadService } from '../services/departmentHeadService';
import { employeeService } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';
import { ProtectedComponent, usePermissions } from '../middleware/PermissionMiddleware';
import Pagination from '../components/Pagination';

const Departments = () => {
  const { hasRole } = useAuth();
  const { can, isAdmin } = usePermissions();
  const [departments, setDepartments] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]); // Todos los doctores del sistema
  const [departmentHeads, setDepartmentHeads] = useState({}); // { departmentId: headInfo }
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHeadModal, setShowHeadModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [doctors, setDoctors] = useState([]); // Doctores del departamento seleccionado
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Cargar departamentos y doctores en paralelo
      const [departmentsData, doctorsData] = await Promise.all([
        departmentService.getAll(),
        employeeService.getAllByType('doctor')
      ]);
      
      setDepartments(departmentsData);
      setAllDoctors(doctorsData);
      
      // Cargar jefes de cada departamento
      await loadDepartmentHeads(departmentsData);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar datos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentHeads = async (departmentsList) => {
    const headsMap = {};
    
    // Intentar obtener el jefe de cada departamento
    await Promise.all(
      departmentsList.map(async (dept) => {
        try {
          const headInfo = await departmentHeadService.getByDepartmentId(dept.departmentId);
          headsMap[dept.departmentId] = headInfo;
        } catch (err) {
          // Si no hay jefe asignado, el endpoint retorna 404, lo cual es normal
          headsMap[dept.departmentId] = null;
        }
      })
    );
    
    setDepartmentHeads(headsMap);
  };

  const loadDepartments = async () => {
    await loadInitialData();
  };

  const loadDoctorsByDepartment = async (departmentId) => {
    try {
      const data = await departmentService.getDoctorsByDepartment(departmentId);
      setDoctors(data);
    } catch (err) {
      console.error('Error al cargar doctores:', err);
      setDoctors([]);
    }
  };

  // Obtener nombre del jefe de departamento
  const getDepartmentHeadName = (departmentId) => {
    const headInfo = departmentHeads[departmentId];
    if (!headInfo) return 'Jefe no asignado';
    
    // Buscar el doctor en la lista de todos los doctores
    const doctor = allDoctors.find(d => d.employeeId === headInfo.doctorId);
    return doctor ? doctor.name : 'Jefe no asignado';
  };

  const handleCreate = () => {
    if (!can('canCreateDepartments')) {
      setError('No tienes permisos para crear departamentos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setModalMode('create');
    setFormData({ name: '' });
    setSelectedDepartment(null);
    setShowModal(true);
    setError('');
  };

  const handleEdit = (department) => {
    if (!can('canEditDepartments')) {
      setError('No tienes permisos para editar departamentos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setModalMode('edit');
    setFormData({
      name: department.name
    });
    setSelectedDepartment(department);
    setShowModal(true);
    setError('');
  };

  const handleAssignHead = async (department) => {
    if (!can('canEditDepartments')) {
      setError('No tienes permisos para asignar jefes de departamento');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedDepartment(department);
    setDoctorSearchTerm('');
    setSelectedDoctor(null);
    await loadDoctorsByDepartment(department.departmentId);
    setShowHeadModal(true);
    setError('');
  };

  const handleDelete = async (id, name) => {
    if (!can('canDeleteDepartments')) {
      setError('No tienes permisos para eliminar departamentos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar el departamento "${name}"?`)) {
      return;
    }

    try {
      await departmentService.delete(id);
      setSuccess('Departamento eliminado exitosamente');
      loadDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar departamento';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (modalMode === 'create') {
        await departmentService.create(formData);
        setSuccess('Departamento creado exitosamente');
      } else {
        await departmentService.update(selectedDepartment.departmentId, formData);
        setSuccess('Departamento actualizado exitosamente');
      }
      
      setShowModal(false);
      loadDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al guardar departamento';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignDepartmentHead = async () => {
    if (!selectedDoctor) {
      setError('Debe seleccionar un doctor');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await departmentHeadService.assign(selectedDepartment.departmentId, selectedDoctor.employeeId);
      setSuccess('Jefe de departamento asignado exitosamente');
      setShowHeadModal(false);
      loadDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al asignar jefe de departamento';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportDepartments = async () => {
    if (!can('canExportDepartments')) {
      setError('No tienes permisos para exportar departamentos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const url = await departmentService.exportToPdf();
      
      // Crear un enlace temporal y hacer clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `departamentos_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar la URL cuando ya no se necesite
      URL.revokeObjectURL(url);
      
      setSuccess('Departamentos exportados exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al exportar departamentos';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Resetear a página 1 cuando cambie searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Calcular items para la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
    doc.identification.toLowerCase().includes(doctorSearchTerm.toLowerCase())
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
            Departamentos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los departamentos del policlínico
          </p>
        </div>
        
        <div className="flex gap-3">
          <ProtectedComponent requiredPermission="canExportDepartments">
            <button
              onClick={handleExportDepartments}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg"
              disabled={loading}
            >
              <Download className="w-5 h-5" />
              Exportar PDF
            </button>
          </ProtectedComponent>
          
          <ProtectedComponent requiredPermission="canCreateDepartments">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nuevo Departamento
            </button>
          </ProtectedComponent>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar departamentos..."
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

      {!isAdmin() && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-800">
            Solo los administradores pueden crear, editar o eliminar departamentos.
          </p>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedDepartments.map((department) => (
          <div
            key={department.departmentId}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {department.name}
                  </h3>
                </div>
              </div>
              
              {/* Botones de Acción */}
              <div className="flex gap-2">
                <ProtectedComponent requiredPermission="canEditDepartments">
                  <button
                    onClick={() => handleAssignHead(department)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    title="Asignar Jefe de Departamento"
                  >
                    <UserCog className="w-4 h-4" />
                  </button>
                </ProtectedComponent>

                <ProtectedComponent requiredPermission="canEditDepartments">
                  <button
                    onClick={() => handleEdit(department)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Editar"
                  >
                    <SquarePen className="w-4 h-4 text-cyan-600"/> 
                  </button>
                </ProtectedComponent>
                
                <ProtectedComponent requiredPermission="canDeleteDepartments">
                  <button
                    onClick={() => handleDelete(department.departmentId, department.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </ProtectedComponent>
              </div>
            </div>
            
            {/* Información del Jefe de Departamento */}
            <div className="space-y-2 text-sm">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <User className="w-4 h-4" />
                <span> {getDepartmentHeadName(department.departmentId)} </span>
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginación */}
      {filteredDepartments.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredDepartments.length}
        />
      )}

      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No se encontraron departamentos con ese criterio' : 'No hay departamentos registrados'}
          </p>
        </div>
      )}

      {/* Modal Crear/Editar Departamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Nuevo Departamento' : 'Editar Departamento'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: Cardiología"
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
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
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
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Jefe de Departamento */}
      {showHeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Asignar Jefe de Departamento
                </h2>
                <button
                  onClick={() => setShowHeadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {selectedDepartment?.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Buscador de Doctores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Doctor
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={doctorSearchTerm}
                    onChange={(e) => setDoctorSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Buscar por nombre o identificación..."
                  />
                </div>
              </div>

              {/* Lista de Doctores */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <button
                      key={doctor.employeeId}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedDoctor?.employeeId === doctor.employeeId
                          ? 'bg-cyan-100 border-l-4 border-l-cyan-600'
                          : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{doctor.name}</div>
                      <div className="text-sm text-gray-500">ID: {doctor.identification}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {doctorSearchTerm ? 'No se encontraron doctores' : 'No hay doctores en este departamento'}
                  </div>
                )}
              </div>

              {selectedDoctor && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <p className="text-sm text-cyan-800">
                    <strong>Seleccionado:</strong> {selectedDoctor.name}
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowHeadModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAssignDepartmentHead}
                  className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={submitting || !selectedDoctor}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    'Asignar Jefe'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;