// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario al montar el componente
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      
      // Guardar token y datos de usuario
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.email,
        roles: response.roles,
      }));
      
      setUser({
        email: response.email,
        roles: response.roles,
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      // Guardar token y datos de usuario
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.email,
        roles: response.roles,
      }));
      
      setUser({
        email: response.email,
        roles: response.roles,
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
  };
};