// pages/Warehouse.jsx
import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Search, X, Loader2, AlertCircle, CheckCircle2,
  Eye, Edit, Trash2, CheckCircle, XCircle, Clock, UserCog, FileText
} from 'lucide-react';
import { warehouseRequestService } from '../services/warehouseRequestService';
import { medicationRequestService } from '../services/medicationRequestService';
import { warehouseManagerService } from '../services/warehouseManagerService';
import { departmentService } from '../services/departmentService';
import { departmentHeadService } from '../services/departmentHeadService';
import stockDepartmentService from '../services/stockDepartmentService';
import { employeeService } from '../services/employeeService';
import medicationService from '../services/medicationService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { ProtectedComponent, usePermissions } from '../middleware/PermissionMiddleware';
import Pagination from '../components/Pagination';

const Warehouse = () => {
  const { user } = useAuth();
  const { can, isAdmin } = usePermissions();
  
  // Estados principales
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'in-progress', 'approved', 'rejected'
  
  // Estados de usuario
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
  const [isDepartmentHead, setIsDepartmentHead] = useState(false);
  const [isWarehouseManager, setIsWarehouseManager] = useState(false);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignManagerModal, setShowAssignManagerModal] = useState(false);
  const [showCurrentManagerModal, setShowCurrentManagerModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestMedications, setRequestMedications] = useState([]);
  
  // Estados para crear solicitud
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [availableMedications, setAvailableMedications] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para asignar jefe de almacén
  const [managerFormData, setManagerFormData] = useState({
    identification: '',
    name: '',
    employmentStatus: 'Activo'
  });
  const [currentWarehouseManager, setCurrentWarehouseManager] = useState(null);
  
  // Estados para mostrar info de solicitudes
  const [medications, setMedications] = useState({});
  const [departments, setDepartments] = useState({});
  const [doctors, setDoctors] = useState({});
  const [departmentHeads, setDepartmentHeads] = useState({});
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Cargar datos iniciales
  useEffect(() => {
    loadUserData();
  }, [user]);

  useEffect(() => {
    if (currentEmployeeId !== null || isAdmin() || isWarehouseManager) {
      loadRequests();
      loadAdditionalData();
    }
  }, [currentEmployeeId, isDepartmentHead, isWarehouseManager, isAdmin()]);

  // Obtener datos del usuario actual
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Si es admin, no necesita empleado específico
      if (isAdmin()) {
        setLoading(false);
        return;
      }

      // Si es jefe de almacén, no necesita departamento específico
      if (user?.roles?.includes('Jefe de Almacén')) {
        setIsWarehouseManager(true);
        setLoading(false);
        return;
      }
      
      // Obtener profile del usuario logueado (para doctores y jefes de departamento)
      const profileResponse = await userService.getProfile(user.id);
      const currentDoctor = profileResponse.profile;

      if (!currentDoctor) {
        setError('No se encontró información del empleado');
        setLoading(false);
        return;
      }
      
      setCurrentEmployeeId(currentDoctor.employeeId);
      setCurrentDepartmentId(currentDoctor.departmentId);
      
      // Verificar si es jefe de departamento
      try {
        const deptHead = await departmentHeadService.getByDepartmentId(currentDoctor.departmentId);
        setIsDepartmentHead(deptHead.doctorId === currentDoctor.employeeId);
      } catch (err) {
        setIsDepartmentHead(false);
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err);
      setError('Error al cargar información del usuario');
      setLoading(false);
    }
  };

  // Cargar datos adicionales (medicamentos, departamentos, doctores)
  const loadAdditionalData = async () => {
    try {
      const [medsData, deptsData, docsData] = await Promise.all([
        medicationService.getAll(),
        departmentService.getAll(),
        employeeService.getAllByType('doctor')
      ]);
      
      // Crear mapas para acceso rápido
      const medsMap = {};
      medsData.forEach(med => {
        medsMap[med.medicationId] = med;
      });
      setMedications(medsMap);
      
      const deptsMap = {};
      deptsData.forEach(dept => {
        deptsMap[dept.departmentId] = dept;
      });
      setDepartments(deptsMap);
      
      const docsMap = {};
      docsData.forEach(doc => {
        docsMap[doc.employeeId] = doc;
      });
      setDoctors(docsMap);
      
      // Cargar jefes de departamento
      const headsMap = {};
      await Promise.all(
        deptsData.map(async (dept) => {
          try {
            const headInfo = await departmentHeadService.getByDepartmentId(dept.departmentId);
            headsMap[dept.departmentId] = headInfo;
          } catch (err) {
            headsMap[dept.departmentId] = null;
          }
        })
      );
      setDepartmentHeads(headsMap);
      
    } catch (err) {
      console.error('Error al cargar datos adicionales:', err);
    }
  };

  // Cargar solicitudes según el rol
  const loadRequests = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (isAdmin()) {
        // Admin ve todas las solicitudes
        data = await warehouseRequestService.getAll();
      } else if (isWarehouseManager) {
        data = await warehouseRequestService.getAll();
      } else if (isDepartmentHead) {
        // Jefe de departamento ve todas las solicitudes de su departamento
        data = await warehouseRequestService.getByDepartment(currentDepartmentId);
      } else {
        // Doctor normal ve solo solicitudes de su departamento
        data = await warehouseRequestService.getByDepartment(currentDepartmentId);
      }
      
      setRequests(data);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar solicitudes';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // --- cargar jefe de almacén actual (si tienes endpoint) ---
  const loadCurrentWarehouseManager = async () => {
    try {
      // Si tu servicio devuelve el jefe actual:
      const manager = await warehouseManagerService.getCurrent?.() ?? null;
      // si la API es diferente: ajusta la llamada
      setCurrentWarehouseManager(manager || null);
    } catch (err) {
      console.warn('No se pudo obtener Jefe de Almacén actual:', err);
      setCurrentWarehouseManager(null);
    }
  };

  // --- abrir modal de asignar jefe (botón de admin) ---
  const handleOpenAssignManager = async () => {
    await loadCurrentWarehouseManager();
    setManagerFormData({
      identification: '',
      name: '',
      employmentStatus: 'Activo'
    });
    setShowAssignManagerModal(true);
  };

  // --- asignar el jefe seleccionado (botón del modal) ---
  const handleAssignManager = async () => {
    if (!managerFormData.name.trim() || !managerFormData.identification.trim()) {
      setError('Completa todos los campos requeridos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`¿Asignar a ${managerFormData.name} como Jefe de Almacén?`)) return;

    try {
      setSubmitting(true);
      // Crear el jefe de almacén directamente
      const newManager = await warehouseManagerService.create({
        name: managerFormData.name,
        identification: managerFormData.identification,
        employmentStatus: managerFormData.employmentStatus
      });

      setSuccess('Jefe de almacén asignado correctamente');
      setCurrentWarehouseManager(newManager);
      setShowAssignManagerModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error asignando jefe:', err);
      setError(err?.message || 'Error al asignar jefe de almacén');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // --- eliminar solicitud (botón eliminar) ---
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('¿Eliminar esta solicitud? Esta acción no se puede deshacer.')) return;

    try {
      await warehouseRequestService.delete?.(requestId) ?? warehouseRequestService.remove?.(requestId);
      setSuccess('Solicitud eliminada');
      loadRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error eliminando solicitud:', err);
      setError('No se pudo eliminar la solicitud');
      setTimeout(() => setError(''), 4000);
    }
  };


  // Abrir modal de creación
  const handleCreateRequest = async () => {
    if (!can('canCreateWarehouseRequests')) {
      setError('No tienes permisos para crear solicitudes');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const medications = await medicationService.getAll();
      setAvailableMedications(medications);
      setSelectedMedications([]);
      setShowCreateModal(true);
    } catch (err) {
      setError('Error al cargar medicamentos');
    }
  };

  // Agregar medicamento a la solicitud
  const handleAddMedication = (medication) => {
    const exists = selectedMedications.find(m => m.medicationId === medication.medicationId);
    if (exists) {
      setError('Este medicamento ya está agregado');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setSelectedMedications([...selectedMedications, {
      ...medication,
      quantity: 1
    }]);
  };

  // Actualizar cantidad de medicamento
  const handleUpdateQuantity = (medicationId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setSelectedMedications(selectedMedications.map(m =>
      m.medicationId === medicationId ? { ...m, quantity: newQuantity } : m
    ));
  };

  // Remover medicamento de la solicitud
  const handleRemoveMedication = (medicationId) => {
    setSelectedMedications(selectedMedications.filter(m => m.medicationId !== medicationId));
  };

  // Crear solicitud
  const handleSubmitRequest = async () => {
    if (selectedMedications.length === 0) {
      setError('Debe agregar al menos un medicamento');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // 1. Crear la solicitud de almacén
      const warehouseRequest = await warehouseRequestService.create({
        departmentId: currentDepartmentId
      });
      
      // 2. Agregar cada medicamento a la solicitud
      for (const med of selectedMedications) {
        await medicationRequestService.create({
          quantity: med.quantity,
          warehouseRequestId: warehouseRequest.warehouseRequestId,
          medicationId: med.medicationId
        });
      }
      
      setSuccess('Solicitud creada exitosamente');
      setShowCreateModal(false);
      loadRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al crear solicitud';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Ver detalles de solicitud
  const handleViewDetails = async (request) => {
    try {
      const medicationsData = await medicationRequestService.getByWarehouseRequest(request.warehouseRequestId);
      const department = departments[request.departmentId] || { name: 'N/A' };

      setRequestMedications(medicationsData);
      setSelectedRequest({
        ...request,
        departmentName: department.name,
      });
      setShowDetailsModal(true);
    } catch (err) {
      setError('Error al cargar detalles de la solicitud');
    }
  };

  // Aprobar solicitud
  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Obtener la solicitud principal (WarehouseRequest)
      const request = await warehouseRequestService.getById(requestId);
      if (!request) {
        setError('Solicitud no encontrada.');
        return;
      }

      // Obtener los MedicationRequest asociados a la WarehouseRequest
      const medicationRequests = await medicationRequestService.getByWarehouseRequest(requestId);
      if (!Array.isArray(medicationRequests) || medicationRequests.length === 0) {
        setError('No se encontraron medicamentos asociados a la solicitud.');
        return;
      }

      if (isDepartmentHead) {
        // Si es jefe de departamento, cambiar estado a "Pendiente Almacén"
        await warehouseRequestService.update(requestId, { status: '2' });
        setSuccess('Solicitud enviada al Jefe de Almacén.');
      } else if (isWarehouseManager) {
        // Si es jefe de almacén, procesar cada MedicationRequest
        for (const medication of medicationRequests) {
          const { medicationId, quantity } = medication;

          const { departmentId } = request; // Extraer departmentId de la solicitud principal

          console.log('Department ID:', request);
          console.log('Department ID:', departmentId);

          // Obtener los datos completos del medicamento
          const medicationData = await medicationService.getById(medicationId);

          // Actualizar la cantidad en el almacén
          const updatedMedicationData = {
            ...medicationData, // Mantener los datos originales
            quantityWarehouse: medicationData.quantityWarehouse - quantity, // Actualizar solo este campo
          };
          
          // Enviar todos los campos al backend
          await medicationService.update(medicationId, updatedMedicationData);
          
          // Verificar si el medicamento ya existe en el stock del departamento
          const departmentStock = await stockDepartmentService.getStockByDepartment(departmentId);
          console.log('Contenido de departmentStock:', departmentStock);
          const existingStock = departmentStock.find((stock) => stock.medicationId === medicationId);
          console.log('Stock existente encontrado:', existingStock);

          if (existingStock) {
            // Actualizar cantidad en el stock del departamento
            await stockDepartmentService.update(existingStock.stockDepartmentId, {
              quantity: existingStock.quantity + quantity,
            });
          } else {
            // Crear nuevo registro en el stock del departamento
            await stockDepartmentService.create({
              medicationId,
              departmentId,
              quantity,
            });
          }
        }

        // Actualizar estado de la solicitud a "Aprobada"
        await warehouseRequestService.update(requestId, { status: '0' });
        setSuccess('Solicitud aprobada y stock actualizado correctamente.');
      }

      loadRequests(); // Recargar solicitudes
    } catch (error) {
      console.error('Error al aprobar la solicitud:', error);
      setError('Hubo un error al aprobar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  // Rechazar solicitud
  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('¿Está seguro de rechazar esta solicitud?')) return;
    
    try {
      const newStatus = isDepartmentHead ? "-1" : "-2";
      await warehouseRequestService.update(requestId, { status: newStatus });
      
      setSuccess('Solicitud rechazada');
      loadRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al rechazar solicitud');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Obtener badge de estado
  const getStatusBadge = (status) => {
    const badges = {
      "1": { label: 'Pendiente Jefe Depto', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      "2": { label: 'Pendiente Almacén', color: 'bg-blue-100 text-blue-800', icon: Clock },
      "0": { label: 'Aprobada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      "-1": { label: 'Rechazada por Jefe de Departamento', color: 'bg-red-100 text-red-800', icon: XCircle },
      "-2": { label: 'Rechazada por Jefe de Almacén', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[status] || { label: 'Desconocido', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  };

  // Filtrar solicitudes
  const filteredRequests = requests.filter(req => {
    // Filtrar por búsqueda
    const matchesSearch = req.warehouseRequestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status?.includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    // Filtrar por estado
    if (statusFilter === 'all') return true;
    if (statusFilter === 'in-progress') return req.status === '1' || req.status === '2';
    if (statusFilter === 'approved') return req.status === '0';
    if (statusFilter === 'rejected') return req.status === '-1' || req.status === '-2';
    
    return true;
  });

  // Paginación
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);

  const filteredMedications = availableMedications.filter(med =>
    med.name?.toLowerCase().includes(medicationSearch.toLowerCase()) ||
    med.commercialName?.toLowerCase().includes(medicationSearch.toLowerCase()) ||
    med.batchNumber?.toLowerCase().includes(medicationSearch.toLowerCase())
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
            <Package className="text-cyan-600" />
            Solicitudes de Almacén
          </h1>
          <p className="text-gray-600 mt-1">
            {isWarehouseManager ? 'Gestiona las solicitudes de todos los departamentos' :
             isDepartmentHead ? 'Gestiona las solicitudes de tu departamento' :
             'Crea y gestiona tus solicitudes de medicamentos'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              loadCurrentWarehouseManager();
              setShowCurrentManagerModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            <UserCog className="w-5 h-5" />
            Ver Jefe Actual
          </button>

          {isAdmin() && (
            <button
              onClick={handleOpenAssignManager}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg"
            >
              <UserCog className="w-5 h-5" />
              Asignar Jefe
            </button>
          )}
          
          {!isWarehouseManager && (
            <ProtectedComponent requiredPermission="canCreateWarehouseRequests">
              <button
                onClick={handleCreateRequest}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nueva Solicitud
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
          placeholder="Buscar solicitudes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Tabs de filtro por estado */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setStatusFilter('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-3 font-medium transition-colors ${
            statusFilter === 'all'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => {
            setStatusFilter('in-progress');
            setCurrentPage(1);
          }}
          className={`px-4 py-3 font-medium transition-colors ${
            statusFilter === 'in-progress'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          En Proceso
        </button>
        <button
          onClick={() => {
            setStatusFilter('approved');
            setCurrentPage(1);
          }}
          className={`px-4 py-3 font-medium transition-colors ${
            statusFilter === 'approved'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Aprobadas
        </button>
        <button
          onClick={() => {
            setStatusFilter('rejected');
            setCurrentPage(1);
          }}
          className={`px-4 py-3 font-medium transition-colors ${
            statusFilter === 'rejected'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rechazadas
        </button>
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

      {/* Grid de Solicitudes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedRequests.map((request) => {
          const statusBadge = getStatusBadge(request.status);
          const StatusIcon = statusBadge.icon;
          
          return (
            <div
              key={request.warehouseRequestId}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Solicitud #{request.warehouseRequestId.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusBadge.color}`}>
                <StatusIcon className="w-4 h-4" />
                {statusBadge.label}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleViewDetails(request)}
                  className="flex-1 px-3 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition flex items-center justify-center gap-2"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                  Detalles
                </button>

                {/* Botones según rol y estado */}
                {request.status === "1" && isDepartmentHead && (
                  <>
                    <button
                      onClick={() => handleApproveRequest(request.warehouseRequestId)}
                      className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Aprobar"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.warehouseRequestId)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Rechazar"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {request.status === "2" && isWarehouseManager && (
                  <>
                    <button
                      onClick={() => handleApproveRequest(request.warehouseRequestId)}
                      className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Aprobar"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.warehouseRequestId)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Rechazar"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {filteredRequests.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredRequests.length}
        />
      )}

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay solicitudes para mostrar</p>
        </div>
      )}

      {/* Modal Crear Solicitud */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nueva Solicitud de Medicamentos</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Buscador de medicamentos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Medicamento
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={medicationSearch}
                    onChange={(e) => setMedicationSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Buscar por nombre o lote..."
                  />
                </div>
              </div>

              {/* Lista de medicamentos disponibles */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredMedications.length > 0 ? (
                  filteredMedications.map((med) => (
                    <button
                      key={med.medicationId}
                      onClick={() => handleAddMedication(med)}
                      className="w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{med.commercialName || med.name}</div>
                      <div className="text-sm text-gray-500">
                        Lote: {med.batchNumber} • Stock: {med.stockWarehouse}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {medicationSearch ? 'No se encontraron medicamentos' : 'Busca un medicamento para agregarlo'}
                  </div>
                )}
              </div>

              {/* Medicamentos seleccionados */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Medicamentos en la solicitud ({selectedMedications.length})
                </h3>
                <div className="space-y-3">
                  {selectedMedications.map((med) => (
                    <div key={med.medicationId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{med.commercialName || med.name}</div>
                        <div className="text-sm text-gray-500">Lote: {med.batchNumber}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(med.medicationId, med.quantity - 1)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={med.quantity}
                          onChange={(e) => handleUpdateQuantity(med.medicationId, parseInt(e.target.value) || 1)}
                          className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(med.medicationId, med.quantity + 1)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveMedication(med.medicationId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={submitting || selectedMedications.length === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Solicitud'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Detalles de Solicitud</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información del Solicitante */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Solicitante</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Departamento</p>
                    <p className="font-medium text-gray-900">
                      {departments[selectedRequest.departmentId]?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de la Solicitud */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedRequest.requestDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Estado</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusBadge(selectedRequest.status).color}`}>
                    {(() => {
                      const StatusIcon = getStatusBadge(selectedRequest.status).icon;
                      return (
                        <>
                          <StatusIcon className="w-4 h-4" />
                          {getStatusBadge(selectedRequest.status).label}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Medicamentos Solicitados */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Medicamentos Solicitados</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {requestMedications.length > 0 ? (
                    requestMedications.map((medReq) => (
                      <div key={medReq.medicationRequestId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {medications[medReq.medicationId]?.commercialName || medications[medReq.medicationId]?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Lote: {medications[medReq.medicationId]?.batchNumber || 'N/A'}
                            </p>
                          </div>
                          <p className="text-cyan-600 font-semibold ml-4">Cantidad: {medReq.quantity}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay medicamentos en esta solicitud</p>
                  )}
                </div>
              </div>

              {/* Botón de cierre */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Jefe de Almacén */}
      {showAssignManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Asignar Jefe de Almacén</h2>
                <button
                  onClick={() => setShowAssignManagerModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {currentWarehouseManager && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Jefe actual:</strong> {currentWarehouseManager.name}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Nombre Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={managerFormData.name}
                  onChange={(e) => setManagerFormData({...managerFormData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Yosvanis Arismin Sierra Hernández"
                  disabled={submitting}
                />
              </div>

              {/* Identificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificación *
                </label>
                <input
                  type="text"
                  value={managerFormData.identification}
                  onChange={(e) => setManagerFormData({...managerFormData, identification: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: 91021772067"
                  disabled={submitting}
                />
              </div>

              {/* Estado Laboral */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Laboral *
                </label>
                <select
                  value={managerFormData.employmentStatus}
                  onChange={(e) => setManagerFormData({...managerFormData, employmentStatus: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={submitting}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Licencia">Licencia</option>
                </select>
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
                  onClick={() => setShowAssignManagerModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAssignManager}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={submitting || !managerFormData.name.trim() || !managerFormData.identification.trim()}
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

      {/* Modal Ver Jefe de Almacén Actual */}
      {showCurrentManagerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Jefe de Almacén Actual</h2>
                <button
                  onClick={() => setShowCurrentManagerModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {currentWarehouseManager ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Nombre Completo</p>
                    <p className="text-lg font-semibold text-gray-900">{currentWarehouseManager.name}</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Identificación</p>
                    <p className="text-lg font-semibold text-gray-900">{currentWarehouseManager.identification}</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Estado Laboral</p>
                    <p className="text-lg font-semibold text-gray-900">{currentWarehouseManager.employmentStatus}</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowCurrentManagerModal(false)}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No hay jefe de almacén asignado</p>
                  <p className="text-gray-500 text-sm mt-2">Contacta al administrador para asignar uno</p>
                  <button
                    onClick={() => setShowCurrentManagerModal(false)}
                    className="mt-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;