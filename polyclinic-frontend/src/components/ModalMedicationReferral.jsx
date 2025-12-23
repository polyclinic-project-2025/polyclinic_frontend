// components/ModalMedicationReferral.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Plus, Trash2, Pill } from 'lucide-react';
import medicationService from '../services/medicationService';
import medicationReferralService from '../services/medicationReferralService';
import stockDepartmentService from '../services/stockDepartmentService';
import { consultationReferralService } from '../services/consultationReferralService';

const ModalMedicationReferral = ({ 
  show, 
  onClose, 
  consultationId, 
  onSuccess, 
  mode = 'create', 
  existingMedications = [] 
}) => {
  const [medications, setMedications] = useState([]);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && consultationId) {
      loadMedicationsWithStock();
      if (mode === 'edit' && existingMedications.length > 0) {
        loadExistingMedications();
      }
    }
  }, [show, consultationId, mode, existingMedications]);

  // ✨ IDÉNTICO A DERIVATION: Cargar medicamentos con stock del departamento
  const loadMedicationsWithStock = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener la consulta para saber el departamento
      const consultation = await consultationReferralService.getById(consultationId);
      const deptId = consultation.departmentToId;
      
      if (!deptId) {
        setError('No se pudo obtener el departamento de la consulta');
        setLoading(false);
        return;
      }
      
      // 2. Obtener stock del departamento
      const stockList = await stockDepartmentService.getStockByDepartment(deptId);
      
      // 3. Filtrar solo los que tienen stock > 0
      const medicationsWithStock = stockList.filter(stock => stock.quantity > 0);
      
      // 4. Enriquecer con información del medicamento
      const enrichedMedications = await Promise.all(
        medicationsWithStock.map(async (stock) => {
          try {
            const medInfo = await medicationService.getById(stock.medicationId);
            return {
              ...medInfo,
              availableQuantity: stock.quantity
            };
          } catch (err) {
            return null;
          }
        })
      );
      
      const validMedications = enrichedMedications.filter(med => med !== null);
      setMedications(validMedications);
      
    } catch (err) {
      console.error('Error al cargar medicamentos con stock:', err);
      setError('Error al cargar medicamentos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingMedications = async () => {
    try {
      setLoading(true);
      const allMeds = await medicationService.getAll();
      
      const mappedMedications = existingMedications.map(existing => {
        const medInfo = allMeds.find(m => m.medicationId === existing.medicationId);
        return {
          medicationReferralId: existing.medicationReferralId,
          medicationId: existing.medicationId,
          commercialName: medInfo?.commercialName || 'Desconocido',
          scientificName: medInfo?.scientificName || '',
          quantity: existing.quantity
        };
      });
      
      setSelectedMedications(mappedMedications);
    } catch (err) {
      setError('Error al cargar medicamentos existentes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = (medication) => {
    if (selectedMedications.find(m => m.medicationId === medication.medicationId)) {
      setError('Este medicamento ya está agregado');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedMedications([
      ...selectedMedications,
      {
        medicationId: medication.medicationId,
        commercialName: medication.commercialName,
        scientificName: medication.scientificName,
        quantity: 1,
        availableQuantity: medication.availableQuantity
      }
    ]);
  };

  const handleRemoveMedication = (medicationId) => {
    setSelectedMedications(selectedMedications.filter(m => m.medicationId !== medicationId));
  };

  const handleQuantityChange = (medicationId, quantity) => {
    const numQuantity = parseInt(quantity) || 0;
    if (numQuantity < 0) return;

    setSelectedMedications(
      selectedMedications.map(m =>
        m.medicationId === medicationId
          ? { ...m, quantity: numQuantity }
          : m
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMedications.length > 0) {
      const hasInvalidQuantity = selectedMedications.some(m => m.quantity <= 0);
      if (hasInvalidQuantity) {
        setError('Todas las cantidades deben ser mayores a 0');
        setTimeout(() => setError(''), 3000);
        return;
      }
    }

    if (!consultationId) {
      setError('No se ha seleccionado una consulta válida');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (mode === 'edit') {
        await handleEditMode();
      } else {
        await handleCreateMode();
      }
      
      onSuccess?.();
      handleClose();
      
    } catch (err) {
      console.error('Error general:', err);
      setError(err.message || 'Error al procesar la receta médica');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMode = async () => {
    if (selectedMedications.length === 0) {
      throw new Error('Debe agregar al menos un medicamento');
    }

    for (let i = 0; i < selectedMedications.length; i++) {
      const med = selectedMedications[i];
      const payload = {
        quantity: med.quantity,
        consultationReferralId: consultationId,
        medicationId: med.medicationId
      };
      
      try {
        console.log(`Creando medicamento ${i + 1}/${selectedMedications.length}:`, payload);
        await medicationReferralService.create(payload);
      } catch (medError) {
        console.error(`Error al crear medicamento ${med.commercialName}:`, medError);
        
        const errorMsg = medError.message || 'Error desconocido';
        
        if (errorMsg.includes('Stock insuficiente') || errorMsg.includes('insuficiente')) {
          throw new Error(`❌ ${med.commercialName}: ${errorMsg}`);
        } else if (errorMsg.includes('No existe stock')) {
          throw new Error(`❌ ${med.commercialName}: No hay stock disponible en este departamento`);
        } else {
          throw new Error(`❌ ${med.commercialName}: ${errorMsg}`);
        }
      }
    }
  };

  const handleEditMode = async () => {
    const originalMeds = existingMedications || [];
    const currentMeds = selectedMedications;

    const toUpdate = [];
    const toDelete = [];
    const toCreate = [];

    originalMeds.forEach(original => {
      const current = currentMeds.find(m => m.medicationId === original.medicationId);
      
      if (!current) {
        toDelete.push(original);
      } else if (current.quantity !== original.quantity) {
        toUpdate.push({
          medicationReferralId: original.medicationReferralId,
          medicationId: current.medicationId,
          quantity: current.quantity,
          commercialName: current.commercialName
        });
      }
    });

    currentMeds.forEach(current => {
      const isNew = !originalMeds.find(o => o.medicationId === current.medicationId);
      if (isNew) {
        toCreate.push(current);
      }
    });

    console.log('📊 Operaciones a realizar:', { toUpdate, toDelete, toCreate });

    for (const med of toDelete) {
      try {
        console.log(`🗑️ Eliminando: ${med.medicationReferralId}`);
        await medicationReferralService.delete(med.medicationReferralId);
      } catch (error) {
        throw new Error(`Error al eliminar ${med.commercialName || 'medicamento'}: ${error.message}`);
      }
    }

    for (const med of toUpdate) {
      try {
        console.log(`🔄 Actualizando: ${med.medicationReferralId} → Cantidad: ${med.quantity}`);
        
        const payload = {
          quantity: med.quantity
        };
        
        await medicationReferralService.update(med.medicationReferralId, payload);
      } catch (error) {
        const errorMsg = error.message || 'Error desconocido';
        
        if (errorMsg.includes('Stock insuficiente') || errorMsg.includes('insuficiente')) {
          throw new Error(`❌ ${med.commercialName}: ${errorMsg}`);
        } else {
          throw new Error(`❌ Error al actualizar ${med.commercialName}: ${errorMsg}`);
        }
      }
    }

    // EJECUTAR CREACIONES
    for (const med of toCreate) {
      try {
        console.log(`➕ Creando nuevo: ${med.commercialName}`);
        
        const payload = {
          quantity: med.quantity,
          consultationReferralId: consultationId,
          medicationId: med.medicationId
        };
        
        await medicationReferralService.create(payload);
      } catch (error) {
        const errorMsg = error.message || 'Error desconocido';
        
        if (errorMsg.includes('Stock insuficiente') || errorMsg.includes('insuficiente')) {
          throw new Error(`❌ ${med.commercialName}: ${errorMsg}`);
        } else {
          throw new Error(`❌ Error al crear ${med.commercialName}: ${errorMsg}`);
        }
      }
    }
  };

  const handleClose = () => {
    setSelectedMedications([]);
    setSearchTerm('');
    setError('');
    onClose();
  };

  const filteredMedications = medications.filter(med =>
    med.commercialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.scientificName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Pill className="w-6 h-6 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'edit' ? 'Editar Receta Médica' : 'Recetar Medicamentos'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medicamentos Seleccionados */}
            {selectedMedications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Medicamentos Recetados ({selectedMedications.length})
                </h3>
                <div className="space-y-2">
                  {selectedMedications.map((med) => (
                    <div
                      key={med.medicationId}
                      className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{med.commercialName}</p>
                        <p className="text-sm text-gray-600 italic">{med.scientificName}</p>
                        {med.availableQuantity && (
                          <p className="text-xs text-green-600 mt-1">
                            📦 Stock disponible: {med.availableQuantity} unidades
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Cantidad:</label>
                        <input
                          type="number"
                          min="1"
                          value={med.quantity}
                          onChange={(e) => handleQuantityChange(med.medicationId, e.target.value)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(med.medicationId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Búsqueda de Medicamentos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Buscar Medicamentos con Stock
              </h3>
              <input
                type="text"
                placeholder="Buscar por nombre comercial o científico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-3"
              />

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                  </div>
                ) : filteredMedications.length > 0 ? (
                  filteredMedications.map((medication) => {
                    const isSelected = selectedMedications.find(
                      m => m.medicationId === medication.medicationId
                    );
                    
                    return (
                      <button
                        key={medication.medicationId}
                        type="button"
                        onClick={() => handleAddMedication(medication)}
                        disabled={isSelected}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          isSelected ? 'bg-gray-100 opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{medication.commercialName}</p>
                            <p className="text-sm text-gray-600 italic">{medication.scientificName}</p>
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              ✅ Stock: {medication.availableQuantity} unidades
                            </p>
                          </div>
                          {!isSelected && (
                            <Plus className="w-5 h-5 text-cyan-600" />
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {loading 
                      ? 'Cargando...' 
                      : searchTerm 
                        ? 'No se encontraron medicamentos con ese criterio' 
                        : 'No hay medicamentos con stock en este departamento'}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                    <p className="text-red-800 text-sm whitespace-pre-line">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={
                submitting || 
                (mode === 'create' && selectedMedications.length === 0)
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'edit' ? 'Actualizando...' : 'Recetando...'}
                </>
              ) : (
                <>
                  <Pill className="w-5 h-5" />
                  {mode === 'edit' 
                    ? selectedMedications.length === 0 
                      ? '🗑️ Eliminar Toda la Receta'
                      : `Actualizar Receta (${selectedMedications.length})`
                    : selectedMedications.length === 0
                      ? 'Agregar Medicamentos'
                      : `Recetar Medicamentos (${selectedMedications.length})`
                  }
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalMedicationReferral;