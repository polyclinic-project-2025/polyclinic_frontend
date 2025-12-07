// components/ModalMedication.jsx
import React from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';

const ModalMedication = ({ 
  show, 
  onClose, 
  mode, 
  formData, 
  onInputChange, 
  onSubmit, 
  error, 
  submitting 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Nuevo Medicamento' : 'Editar Medicamento'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Comercial *
                </label>
                <input
                  type="text"
                  name="commercialName"
                  required
                  value={formData.commercialName}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: Paracetamol 500mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Científico *
                </label>
                <input
                  type="text"
                  name="scientificName"
                  required
                  value={formData.scientificName}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: Acetaminofén"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato *
                </label>
                <input
                  type="text"
                  name="format"
                  required
                  value={formData.format}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: Tabletas, Jarabe, Inyectable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compañía Farmacéutica *
                </label>
                <input
                  type="text"
                  name="commercialCompany"
                  required
                  value={formData.commercialCompany}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: Bayer, Pfizer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Lote *
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  required
                  value={formData.batchNumber}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: LOT123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  name="expirationDate"
                  required
                  value={formData.expirationDate}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen (opcional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>
          </div>

          {/* Inventario Almacén */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario - Almacén</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Actual
                </label>
                <input
                  type="number"
                  name="quantityWarehouse"
                  required
                  min="0"
                  value={formData.quantityWarehouse}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Mínima
                </label>
                <input
                  type="number"
                  name="minQuantityWarehouse"
                  required
                  min="0"
                  value={formData.minQuantityWarehouse}
                  onChange={onInputChange}
                  className=" bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Máxima
                </label>
                <input
                  type="number"
                  name="maxQuantityWarehouse"
                  required
                  min="0"
                  value={formData.maxQuantityWarehouse}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Inventario Enfermería */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario - Enfermería</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Actual
                </label>
                <input
                  type="number"
                  name="quantityNurse"
                  required
                  min="0"
                  value={formData.quantityNurse}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Mínima
                </label>
                <input
                  type="number"
                  name="minQuantityNurse"
                  required
                  min="0"
                  value={formData.minQuantityNurse}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Máxima
                </label>
                <input
                  type="number"
                  name="maxQuantityNurse"
                  required
                  min="0"
                  value={formData.maxQuantityNurse}
                  onChange={onInputChange}
                  className="bg-cyan-50 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
                mode === 'create' ? 'Crear Medicamento' : 'Actualizar Medicamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalMedication;
