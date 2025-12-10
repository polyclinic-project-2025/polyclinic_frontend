import React, { useState, useEffect } from 'react';
import { 
  X, Search, Plus, Trash2, AlertCircle, CheckCircle2, 
  Loader2, Package, Save 
} from 'lucide-react';
import stockDepartmentService from '../services/stockDepartmentService';
import medicationService from '../services/medicationService';

const ModalDepartmentStock = ({ department, onClose, onSuccess }) => {
  const [medications, setMedications] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    quantity: '',
    minQuantity: '',
    maxQuantity: ''
  });

  useEffect(() => {
    loadData();
  }, [department]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medsData, stockData] = await Promise.all([
        medicationService.getAll(),
        stockDepartmentService.getStockByDepartment(department.departmentId)
      ]);
      
      setMedications(medsData);
      setCurrentStock(stockData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = medications.filter((med) =>
    med.commercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMedication = (medication) => {
    // Verificar si el medicamento ya existe en el stock
    const existingStock = currentStock.find(
      s => s.medicationId === medication.medicationId
    );

    if (existingStock) {
      setError('Este medicamento ya está en el stock del departamento');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedMedication(medication);
    setFormData({
      quantity: '',
      minQuantity: '',
      maxQuantity: ''
    });
    setError('');
  };

  const handleAddToStock = async () => {
    if (!selectedMedication) {
      setError('Debe seleccionar un medicamento');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!formData.quantity || !formData.minQuantity || !formData.maxQuantity) {
      setError('Todos los campos son requeridos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const quantity = parseInt(formData.quantity);
    const minQuantity = parseInt(formData.minQuantity);
    const maxQuantity = parseInt(formData.maxQuantity);

    if (quantity < 0 || minQuantity < 0 || maxQuantity < 0) {
      setError('Las cantidades deben ser números positivos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (minQuantity > maxQuantity) {
      setError('La cantidad mínima no puede ser mayor que la máxima');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setSubmitting(true);
      
      const stockData = {
        quantity: quantity,
        departmentId: department.departmentId,
        medicationId: selectedMedication.medicationId,
        minQuantity: minQuantity,
        maxQuantity: maxQuantity
      };

      await stockDepartmentService.create(stockData);
      
      setSuccess('Medicamento agregado al stock exitosamente');
      
      // Recargar el stock
      await loadData();
      
      // Limpiar formulario
      setSelectedMedication(null);
      setFormData({
        quantity: '',
        minQuantity: '',
        maxQuantity: ''
      });
      
      setTimeout(() => setSuccess(''), 3000);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al agregar medicamento al stock';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromStock = async (stockId, medicationName) => {
    if (!window.confirm(`¿Está seguro de eliminar "${medicationName}" del stock?`)) {
      return;
    }

    try {
      await stockDepartmentService.delete(stockId);
      setSuccess('Medicamento eliminado del stock exitosamente');
      await loadData();
      setTimeout(() => setSuccess(''), 3000);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar medicamento del stock';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="text-cyan-600" />
                Stock del Departamento
              </h2>
              <p className="text-gray-600 mt-1">{department.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Add Medication */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-600" />
                Agregar Medicamento
              </h3>

              {/* Search Medications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Medicamento
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Buscar por nombre comercial o científico..."
                  />
                </div>
              </div>

              {/* Medications List */}
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                {filteredMedications.length > 0 ? (
                  filteredMedications.map((med) => {
                    const isInStock = currentStock.some(s => s.medicationId === med.medicationId);
                    return (
                      <button
                        key={med.medicationId}
                        onClick={() => !isInStock && handleSelectMedication(med)}
                        disabled={isInStock}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                          isInStock
                            ? 'bg-gray-100 cursor-not-allowed opacity-50'
                            : selectedMedication?.medicationId === med.medicationId
                            ? 'bg-cyan-100 border-l-4 border-l-cyan-600'
                            : 'hover:bg-cyan-50'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{med.commercialName}</div>
                        <div className="text-sm text-gray-500">{med.scientificName}</div>
                        {isInStock && (
                          <div className="text-xs text-gray-400 mt-1">Ya en stock</div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron medicamentos' : 'No hay medicamentos disponibles'}
                  </div>
                )}
              </div>

              {/* Form */}
              {selectedMedication && (
                <div className="space-y-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div>
                    <p className="text-sm font-medium text-cyan-900 mb-2">
                      Medicamento seleccionado:
                    </p>
                    <p className="font-semibold text-gray-900">{selectedMedication.commercialName}</p>
                    <p className="text-sm text-gray-600">{selectedMedication.scientificName}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad Actual *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad Mínima *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minQuantity}
                        onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad Máxima *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxQuantity}
                        onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddToStock}
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Agregando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Agregar al Stock
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right Side - Current Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-600" />
                Stock Actual ({currentStock.length})
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {currentStock.length > 0 ? (
                  currentStock.map((stock) => (
                    <div
                      key={stock.stockDepartmentId}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {stock.medicationCommercialName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {stock.medicationScientificName}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Cantidad:</span> {stock.quantity}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Rango:</span> {stock.minQuantity} - {stock.maxQuantity}
                            </p>
                          </div>
                          
                          {/* Stock Status */}
                          {stock.quantity < stock.minQuantity && (
                            <div className="mt-2 inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              Stock Bajo
                            </div>
                          )}
                          {stock.quantity > stock.maxQuantity && (
                            <div className="mt-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                              Sobre Stock
                            </div>
                          )}
                          {stock.quantity >= stock.minQuantity && stock.quantity <= stock.maxQuantity && (
                            <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              Stock Normal
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleRemoveFromStock(stock.stockDepartmentId, stock.medicationCommercialName)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar del stock"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay medicamentos en el stock</p>
                    <p className="text-sm text-gray-400 mt-1">Agregue medicamentos usando el formulario</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0" />
              <p className="text-green-800">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-5 h-5 text-green-600" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDepartmentStock;