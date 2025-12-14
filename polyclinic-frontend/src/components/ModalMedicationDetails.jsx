// components/ModalMedicationDetails.jsx
import React from 'react';
import { X } from 'lucide-react';

const ModalMedicationDetails = ({ show, onClose, medication }) => {
  if (!show || !medication) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Detalles del Medicamento
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Imagen */}
          {medication.imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={medication.imageUrl}
                alt={medication.commercialName}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Información General */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre Comercial</p>
                <p className="text-base font-medium text-gray-900">{medication.commercialName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nombre Científico</p>
                <p className="text-base font-medium text-gray-900">{medication.scientificName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Formato</p>
                <p className="text-base font-medium text-gray-900">{medication.format}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Compañía</p>
                <p className="text-base font-medium text-gray-900">{medication.commercialCompany}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Número de Lote</p>
                <p className="text-base font-medium text-gray-900">{medication.batchNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateShort(medication.expirationDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Inventario Almacén */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario - Almacén</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Cantidad Actual</p>
                <p className="text-2xl font-bold text-blue-900">{medication.quantityWarehouse}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">Mínimo</p>
                <p className="text-2xl font-bold text-orange-900">{medication.minQuantityWarehouse}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Máximo</p>
                <p className="text-2xl font-bold text-green-900">{medication.maxQuantityWarehouse}</p>
              </div>
            </div>
          </div>

          {/* Inventario Enfermería */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventario - Enfermería</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Cantidad Actual</p>
                <p className="text-2xl font-bold text-blue-900">{medication.quantityNurse}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">Mínimo</p>
                <p className="text-2xl font-bold text-orange-900">{medication.minQuantityNurse}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Máximo</p>
                <p className="text-2xl font-bold text-green-900">{medication.maxQuantityNurse}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalMedicationDetails;
