// pages/Medications.jsx
import React, { useState, useEffect } from 'react';
import {
  Pill, Plus, SquarePen, Trash2, Search, X, Loader2, AlertCircle, CheckCircle2, Eye, Package, Calendar, Building
} from 'lucide-react';
import medicationService from '../services/medicationService';
import { useAuth } from '../context/AuthContext';
import { ProtectedComponent, usePermissions } from '../middleware/PermissionMiddleware';
import ModalMedication from '../components/ModalMedication';
import ModalMedicationDetails from '../components/ModalMedicationDetails';

const Medications = () => {
  const { can, isAdmin } = usePermissions();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [formData, setFormData] = useState({
    format: '',
    commercialName: '',
    commercialCompany: '',
    expirationDate: '',
    batchNumber: '',
    scientificName: '',
    quantityWarehouse: 0,
    quantityNurse: 0,
    minQuantityWarehouse: 0,
    minQuantityNurse: 0,
    maxQuantityWarehouse: 0,
    maxQuantityNurse: 0,
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await medicationService.getAll();
      setMedications(data);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar medicamentos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!can('canCreateMedications')) {
      setError('No tienes permisos para crear medicamentos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setModalMode('create');
    setFormData({
      format: '',
      commercialName: '',
      commercialCompany: '',
      expirationDate: '',
      batchNumber: '',
      scientificName: '',
      quantityWarehouse: 0,
      quantityNurse: 0,
      minQuantityWarehouse: 0,
      minQuantityNurse: 0,
      maxQuantityWarehouse: 0,
      maxQuantityNurse: 0,
      imageUrl: ''
    });
    setSelectedMedication(null);
    setShowModal(true);
    setError('');
  };

  const handleEdit = (medication) => {
    if (!can('canEditMedications')) {
      setError('No tienes permisos para editar medicamentos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setModalMode('edit');
    setFormData({
      format: medication.format,
      commercialName: medication.commercialName,
      commercialCompany: medication.commercialCompany,
      expirationDate: medication.expirationDate?.split('T')[0] || '',
      batchNumber: medication.batchNumber,
      scientificName: medication.scientificName,
      quantityWarehouse: medication.quantityWarehouse,
      quantityNurse: medication.quantityNurse,
      minQuantityWarehouse: medication.minQuantityWarehouse,
      minQuantityNurse: medication.minQuantityNurse,
      maxQuantityWarehouse: medication.maxQuantityWarehouse,
      maxQuantityNurse: medication.maxQuantityNurse,
      imageUrl: medication.imageUrl || ''
    });
    setSelectedMedication(medication);
    setShowModal(true);
    setError('');
  };

  const handleViewDetails = (medication) => {
    setSelectedMedication(medication);
    setShowDetailsModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!can('canDeleteMedications')) {
      setError('No tienes permisos para eliminar medicamentos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar el medicamento "${name}"?`)) {
      return;
    }

    try {
      await medicationService.delete(id);
      setSuccess('Medicamento eliminado exitosamente');
      loadMedications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar medicamento';
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
        await medicationService.create(formData);
        setSuccess('Medicamento creado exitosamente');
      } else {
        await medicationService.update(selectedMedication.medicationId, formData);
        setSuccess('Medicamento actualizado exitosamente');
      }
      
      setShowModal(false);
      loadMedications();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al guardar medicamento';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('quantity') || name.includes('Quantity') ? Number(value) : value
    }));
  };

  const filteredMedications = medications.filter((med) =>
    med.commercialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (current, min, max) => {
    if (current < min) return { text: 'Bajo', color: 'text-red-600 bg-red-100' };
    if (current > max) return { text: 'Exceso', color: 'text-orange-600 bg-orange-100' };
    return { text: 'Normal', color: 'text-green-600 bg-green-100' };
  };

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
            <Pill className="text-cyan-600" />
            Medicamentos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona el inventario de medicamentos del policlínico
          </p>
        </div>
        
        <ProtectedComponent requiredPermission="canCreateMedications">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nuevo Medicamento
          </button>
        </ProtectedComponent>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar medicamentos por nombre, principio activo o lote..."
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
            Solo los administradores pueden crear, editar o eliminar medicamentos.
          </p>
        </div>
      )}

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.map((medication) => {
          const warehouseStatus = getStockStatus(
            medication.quantityWarehouse,
            medication.minQuantityWarehouse,
            medication.maxQuantityWarehouse
          );
          
          return (
            <div
              key={medication.medicationId}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 overflow-hidden"
            >
              {/* Imagen del Medicamento */}
              <div className="h-48 bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                {medication.imageUrl ? (
                  <img
                    src={medication.imageUrl}
                    alt={medication.commercialName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`${medication.imageUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}
                  style={{ display: medication.imageUrl ? 'none' : 'flex' }}
                >
                  <Pill className="w-20 h-20 text-cyan-300" />
                </div>
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {medication.commercialName}
                    </h3>
                    <p className="text-sm text-gray-600 italic">
                      {medication.scientificName}
                    </p>
                  </div>
                </div>

                {/* Información General */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4 text-cyan-600" />
                    <span className="font-medium">{medication.commercialCompany}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-cyan-600" />
                    <span>Formato: {medication.format}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    <span>Lote: {medication.batchNumber}</span>
                  </div>

                  {/* Estado de Stock */}
                  <div className="pt-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${warehouseStatus.color}`}>
                      Stock: {warehouseStatus.text} ({medication.quantityWarehouse} unidades)
                    </span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewDetails(medication)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-cyan-600 bg-cyan-50 hover:bg-cyan-100 rounded-lg transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalles
                  </button>

                  <ProtectedComponent requiredPermission="canEditMedications">
                    <button
                      onClick={() => handleEdit(medication)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                  </ProtectedComponent>
                  
                  <ProtectedComponent requiredPermission="canDeleteMedications">
                    <button
                      onClick={() => handleDelete(medication.medicationId, medication.commercialName)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </ProtectedComponent>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedications.length === 0 && (
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No se encontraron medicamentos con ese criterio' : 'No hay medicamentos registrados'}
          </p>
        </div>
      )}

      {/* Modales */}
      <ModalMedication
        show={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        error={error}
        submitting={submitting}
      />

      <ModalMedicationDetails
        show={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        medication={selectedMedication}
      />
    </div>
  );
};

export default Medications;
