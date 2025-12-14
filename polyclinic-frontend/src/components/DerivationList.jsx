// components/DerivationList.jsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, Building2, Calendar, Trash2, User, IdCard } from 'lucide-react';
import { derivationService } from '../services/derivationService';
import { departmentService } from '../services/departmentService';
import { ProtectedComponent } from '../middleware/PermissionMiddleware';

const DerivationList = ({ 
  derivations, 
  onDeleteDerivation, 
  onCreateDerivation,
  onSearch,
  searchTerm,
  setSearchTerm,
  loading
}) => {
  const [departments, setDepartments] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.departmentId === departmentId);
    return dept ? dept.name : 'Departamento no encontrado';
  };

  const handleSearch = async () => {
    if (onSearch) {
      onSearch();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid de Derivaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {derivations.map((derivation) => (
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
                  onClick={() => onDeleteDerivation(derivation.derivationId, derivation.patientName)}
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
                      {formatDateMedium(derivation.dateTimeDer)} : 'Fecha no disponible'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {derivations.length === 0 && (
        <div className="text-center py-12">
          <ArrowRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? 'No se encontraron derivaciones con ese criterio'
              : 'No hay derivaciones registradas'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DerivationList;