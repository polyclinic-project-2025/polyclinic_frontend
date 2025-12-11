import React, { useState, useEffect } from 'react';
import { 
  X, AlertCircle, Loader2, Package, PackageOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import stockDepartmentService from '../services/stockDepartmentService';

const ModalDepartmentStock = ({ department, onClose }) => {
  const [currentStock, setCurrentStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 9;

  useEffect(() => {
    loadData();
  }, [department]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const stockData = await stockDepartmentService.getStockByDepartment(department.departmentId);
        setCurrentStock(Array.isArray(stockData) ? stockData : []);
        setCurrentPage(1); // Reset a la primera página cuando se carga nuevo stock
      } catch (stockError) {
        console.log('No hay stock para este departamento aún');
        setCurrentStock([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar el stock del departamento');
    } finally {
      setLoading(false);
    }
  };

  // Calcular paginación
  const totalPages = Math.ceil(currentStock.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentStock.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            <span className="ml-3 text-gray-700">Cargando stock...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Package className="w-6 h-6 text-cyan-600" />
                </div>
                Stock del Departamento
              </h2>
              <p className="text-gray-600 mt-2 ml-14">{department.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" />
              <p className="text-red-800 flex-1">{error}</p>
              <button onClick={() => setError('')} className="flex-shrink-0">
                <X className="w-5 h-5 text-red-600" />
              </button>
            </div>
          )}

          {currentStock.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Total de medicamentos: <span className="text-cyan-600">{currentStock.length}</span>
                </h3>
                <div className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </div>
              </div>

              {/* Grid 3x3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {currentItems.map((stock) => {
                  const stockPercentage = ((stock.quantity - stock.minQuantity) / (stock.maxQuantity - stock.minQuantity)) * 100;
                  const isLowStock = stock.quantity < stock.minQuantity;
                  const isOverStock = stock.quantity > stock.maxQuantity;
                  const isNormalStock = !isLowStock && !isOverStock;

                  return (
                    <div
                      key={stock.stockDepartmentId}
                      className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-base mb-1 truncate" title={stock.medicationCommercialName}>
                            {stock.medicationCommercialName}
                          </h4>
                          <p className="text-xs text-gray-600 italic truncate" title={stock.medicationScientificName}>
                            {stock.medicationScientificName}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex-shrink-0 ml-2">
                          {isLowStock && (
                            <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              Bajo
                            </div>
                          )}
                          {isOverStock && (
                            <div className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              Alto
                            </div>
                          )}
                          {isNormalStock && (
                            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              OK
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Display */}
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Cantidad</span>
                          <span className="text-2xl font-bold text-gray-900">{stock.quantity}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLowStock 
                                  ? 'bg-red-500' 
                                  : isOverStock 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                              }`}
                              style={{ 
                                width: `${Math.min(Math.max(stockPercentage, 0), 100)}%` 
                              }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Mín: {stock.minQuantity}</span>
                            <span>Máx: {stock.maxQuantity}</span>
                          </div>
                        </div>
                      </div>

                      {/* Alert Messages */}
                      {isLowStock && (
                        <div className="mt-3 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded border border-red-200">
                          ⚠️ Reabastecimiento urgente
                        </div>
                      )}
                      {isOverStock && (
                        <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded border border-yellow-200">
                          ℹ️ Stock sobre el máximo
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
                  {/* Botón Anterior */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Números de página */}
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            currentPage === pageNumber
                              ? 'bg-cyan-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón Siguiente */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-cyan-100 rounded-full blur-xl opacity-50"></div>
                <PackageOpen className="relative w-24 h-24 text-gray-300" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Stock Vacío
              </h3>
              
              <p className="text-gray-500 text-center max-w-md mb-6">
                Este departamento aún no tiene medicamentos asignados en su inventario.
              </p>

              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-6 max-w-md">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg flex-shrink-0">
                    <Package className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cyan-900 mb-1">
                      ¿Cómo agregar medicamentos?
                    </h4>
                    <p className="text-sm text-cyan-700">
                      Para agregar medicamentos al stock de este departamento, contacte al administrador del sistema o utilice el módulo de gestión de inventario.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDepartmentStock;