// hooks/useReferrals.js
import { useState, useEffect } from 'react';
import { referralService } from '../services/referralService';

const useReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const data = await referralService.getAll();
      setReferrals(data);
      setError('');
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar remitidos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchReferrals = async (searchTerm) => {
    if (!searchTerm.trim()) {
      loadReferrals();
      return;
    }

    setLoading(true);
    try {
      let searchResults = [];

      // Buscar por múltiples criterios (igual que en Referrals.jsx)
      try {
        const byPuestoExterno = await referralService.searchByPuestoExterno(searchTerm);
        searchResults = [...searchResults, ...byPuestoExterno];
      } catch (error) {
        console.log('No results by puesto externo');
      }

      try {
        const byDeptTo = await referralService.searchByDepartmentTo(searchTerm);
        searchResults = [...searchResults, ...byDeptTo];
      } catch (error) {
        console.log('No results by department to');
      }

      try {
        const byPatientName = await referralService.searchByPatientName(searchTerm);
        searchResults = [...searchResults, ...byPatientName];
      } catch (error) {
        console.log('No results by patient name');
      }

      try {
        const byIdentification = await referralService.searchByIdentification(searchTerm);
        searchResults = [...searchResults, ...byIdentification];
      } catch (error) {
        console.log('No results by identification');
      }

      if (searchTerm.match(/^\d{2}\/\d{2}\/\d{4}$/) || searchTerm.match(/^\d{4}-\d{2}-\d{2}$/)) {
        try {
          const byDate = await referralService.searchByDate(searchTerm);
          searchResults = [...searchResults, ...byDate];
        } catch (error) {
          console.log('No results by date');
        }
      }

      const uniqueResults = searchResults.filter((referral, index, self) =>
        index === self.findIndex(r => r.referralId === referral.referralId)
      );

      setReferrals(uniqueResults);
      setError('');
    } catch (err) {
      const errorMessage = err.message || 'Error en la búsqueda';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createReferral = async (data) => {
    try {
      await referralService.create(data);
      await loadReferrals();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear remisión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteReferral = async (referralId) => {
    try {
      await referralService.delete(referralId);
      await loadReferrals();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar remisión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  return {
    referrals,
    loading,
    error,
    loadReferrals,
    searchReferrals,
    createReferral,
    deleteReferral
  };
};

export default useReferrals;