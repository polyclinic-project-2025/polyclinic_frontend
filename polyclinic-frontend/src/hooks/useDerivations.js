// hooks/useDerivations.js
import { useState, useEffect } from 'react';
import { derivationService } from '../services/derivationService';

const useDerivations = () => {
  const [derivations, setDerivations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDerivations = async () => {
    try {
      setLoading(true);
      const data = await derivationService.getAll();
      setDerivations(data);
      setError('');
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar derivaciones';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchDerivations = async (searchTerm) => {
    if (!searchTerm.trim()) {
      loadDerivations();
      return;
    }

    setLoading(true);
    try {
      let searchResults = [];

      // Buscar por múltiples criterios (igual que en Derivations.jsx)
      try {
        const byDeptFrom = await derivationService.searchByDepartmentFrom(searchTerm);
        searchResults = [...searchResults, ...byDeptFrom];
      } catch (error) {
        console.log('No results by department from');
      }

      try {
        const byDeptTo = await derivationService.searchByDepartmentTo(searchTerm);
        searchResults = [...searchResults, ...byDeptTo];
      } catch (error) {
        console.log('No results by department to');
      }

      try {
        const byPatientName = await derivationService.searchByPatientName(searchTerm);
        searchResults = [...searchResults, ...byPatientName];
      } catch (error) {
        console.log('No results by patient name');
      }

      try {
        const byIdentification = await derivationService.searchByIdentification(searchTerm);
        searchResults = [...searchResults, ...byIdentification];
      } catch (error) {
        console.log('No results by identification');
      }

      if (searchTerm.match(/^\d{2}\/\d{2}\/\d{4}$/) || searchTerm.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const byDate = await derivationService.searchByDate(searchTerm);
          searchResults = [...searchResults, ...byDate];
        } catch (error) {
          console.log('No results by date');
        }
      }

      const uniqueResults = searchResults.filter((derivation, index, self) =>
        index === self.findIndex(d => d.derivationId === derivation.derivationId)
      );

      setDerivations(uniqueResults);
      setError('');
    } catch (err) {
      const errorMessage = err.message || 'Error en la búsqueda';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createDerivation = async (data) => {
    try {
      await derivationService.create(data);
      await loadDerivations();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear derivación';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteDerivation = async (derivationId) => {
    try {
      await derivationService.delete(derivationId);
      await loadDerivations();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar derivación';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    loadDerivations();
  }, []);

  return {
    derivations,
    loading,
    error,
    loadDerivations,
    searchDerivations,
    createDerivation,
    deleteDerivation
  };
};

export default useDerivations;