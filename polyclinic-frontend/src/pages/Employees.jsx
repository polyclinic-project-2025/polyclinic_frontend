// pages/Employees.jsx
import React, { useState, useEffect } from 'react';
import {
  Stethoscope, Plus, Edit, Trash2, Search, X, Loader2, AlertCircle, CheckCircle2,
  User, Mail, IdCard, Building2, CircleEllipsis
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../middleware/PermissionMiddleware';
import { employeeService } from '../services/employeeService';
import { departmentService } from '../services/departmentService';
import Pagination from '../components/Pagination';

const Employees = ({ type }) => {
  const { hasRole } = useAuth();
  const { can, isAdmin } = usePermissions();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    identification: '',
    name: '',
    employmentStatus: 'Activo',
    departmentId: '',
    nursingId: '' // Para futuro
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Configuración según el tipo (doctor/nurse)
  const config = {
    doctor: {
      title: 'Doctores',
      singular: 'Doctor',
      icon: Stethoscope,
      createPermission: 'canCreateStaff',
      editPermission: 'canEditStaff',
      deletePermission: 'canDeleteStaff',
      useDepartment: true,
      useNursing: false
    },
    nurse: {
      title: 'Enfermeros',
      singular: 'Enfermero',
      icon: Stethoscope,
      createPermission: 'canCreateStaff',
      editPermission: 'canEditStaff',
      deletePermission: 'canDeleteStaff',
      useDepartment: false,
      useNursing: true
    }
  };

  const currentConfig = config[type] || config.doctor;
  const Icon = currentConfig.icon;

  // Cargar empleados y departamentos al montar
  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [type]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllByType(type);
      setEmployees(data);
    } catch (err) {
      const errorMessage = err.message || `Error al cargar ${currentConfig.title.toLowerCase()}`;
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
    return dept ? dept.name : 'Sin departamento';
  };

  const handleCreate = () => {
    if (!can(currentConfig.createPermission)) {
      setError(`No tienes permisos para crear ${currentConfig.title.toLowerCase()}`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setModalMode('create');
    setFormData({
      identification: '',
      name: '',
      employmentStatus: 'Activo',
      departmentId: '',
      nursingId: ''
    });
    setSelectedEmployee(null);
    setShowModal(true);
    setError('');
  };

  const handleEdit = (employee) => {
    if (!can(currentConfig.editPermission)) {
      setError(`No tienes permisos para editar ${currentConfig.title.toLowerCase()}`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    setModalMode('edit');
    setFormData({
      identification: employee.identification,
      name: employee.name,
      employmentStatus: employee.employmentStatus,
      departmentId: employee.departmentId || '',
      nursingId: employee.nursingId || ''
    });
    setSelectedEmployee(employee);
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id, name) => {
    if (!can(currentConfig.deletePermission)) {
      setError(`No tienes permisos para eliminar ${currentConfig.title.toLowerCase()}`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar a ${name}?`)) {
      return;
    }

    try {
      await employeeService.delete(type, id);
      setSuccess(`${currentConfig.singular} eliminado exitosamente`);
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || `Error al eliminar ${currentConfig.singular.toLowerCase()}`;
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Preparar datos según el tipo
      const submitData = {
        identification: formData.identification,
        name: formData.name,
        employmentStatus: formData.employmentStatus
      };

      // Agregar campo específico según tipo
      if (type === 'doctor' && formData.departmentId) {
        submitData.departmentId = formData.departmentId;
      } else if (type === 'nurse' && formData.nursingId) {
        submitData.nursingId = formData.nursingId;
      }

      if (modalMode === 'create') {
        await employeeService.create(type, submitData);
        setSuccess(`${currentConfig.singular} creado exitosamente`);
      } else {
        await employeeService.update(type, selectedEmployee.employeeId, submitData);
        setSuccess(`${currentConfig.singular} actualizado exitosamente`);
      }
      
      setShowModal(false);
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || `Error al guardar ${currentConfig.singular.toLowerCase()}`;
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employmentStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Resetear a página 1 cuando cambie searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Calcular items para la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

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
            <Icon className="text-cyan-600" />
            {currentConfig.title}
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona el personal de {currentConfig.title.toLowerCase()} del policlínico
          </p>
        </div>
        
        {(isAdmin() || can(currentConfig.createPermission)) && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nuevo {currentConfig.singular}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={`Buscar ${currentConfig.title.toLowerCase()}...`}
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
            Solo los administradores pueden crear, editar o eliminar {currentConfig.title.toLowerCase()}.
          </p>
        </div>
      )}

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEmployees.map((employee) => (
          <div
            key={employee.employeeId}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {employee.name}
                  </h3>
                </div>
              </div>
              
              {/* Botones de Acción */}
              <div className="flex gap-2">
                {(isAdmin() || can(currentConfig.editPermission)) && (
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                
                {(isAdmin() || can(currentConfig.deletePermission)) && (
                  <button
                    onClick={() => handleDelete(employee.employeeId, employee.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {type === 'doctor' && employee.departmentId && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{getDepartmentName(employee.departmentId)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <IdCard className="w-4 h-4" />
                <span>{employee.identification}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CircleEllipsis className="w-4 h-4" />
                <span>{employee.employmentStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Paginación */}
      {filteredEmployees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredEmployees.length}
        />
      )}

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm 
              ? `No se encontraron ${currentConfig.title.toLowerCase()} con ese criterio` 
              : `No hay ${currentConfig.title.toLowerCase()} registrados`}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' 
                    ? `Nuevo ${currentConfig.singular}` 
                    : `Editar ${currentConfig.singular}`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Yosvanis Arismin Sierra Hernández"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identificación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.identification}
                    onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="91021772067"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Laboral *
                  </label>
                  <select
                    required
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Licencia">Licencia</option>
                    <option value="Vacaciones">Vacaciones</option>
                  </select>
                </div>

                {/* Dropdown de Departamento (solo para doctores) */}
                {currentConfig.useDepartment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento *
                    </label>
                    <select
                      required
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar departamento...</option>
                      {departments.map((dept) => (
                        <option key={dept.departmentId} value={dept.departmentId}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
    </div>
  );
};

export default Employees;