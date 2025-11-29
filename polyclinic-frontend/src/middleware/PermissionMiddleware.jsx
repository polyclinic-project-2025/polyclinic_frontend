// middleware/PermissionMiddleware.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';


const PERMISSIONS = {
  Admin: {
    canCreateDepartments: true,
    canEditDepartments: true,
    canDeleteDepartments: true,
    canViewReports: true,
    canManageStaff: true,
    canAccessAllModules: true,
  },
  
  Doctor: {
    canCreateDepartments: false,
    canEditDepartments: false,
    canDeleteDepartments: false,
    canViewReports: true,
    canManageStaff: false,
    canAccessAllModules: false,
  },
  
  Nurse: {
    canCreateDepartments: false,
    canEditDepartments: false,
    canDeleteDepartments: false,
    canViewReports: false,
    canManageStaff: false,
    canAccessAllModules: false,
  },
  
  MedicalStaff: {
    canCreateDepartments: false,
    canEditDepartments: false,
    canDeleteDepartments: false,
    canViewReports: false,
    canManageStaff: false,
    canAccessAllModules: false,
  },
  
  Patient: {
    canCreateDepartments: false,
    canEditDepartments: false,
    canDeleteDepartments: false,
    canViewReports: false,
    canManageStaff: false,
    canAccessAllModules: false,
  },
};

const MODULE_ACCESS = {
  Admin: ['dashboard', 'patients', 'consultations', 'emergency', 'departments', 'staff', 'medications', 'warehouse', 'reports'],
  Doctor: ['dashboard', 'patients', 'consultations', 'emergency', 'departments'],
  Nurse: ['dashboard', 'patients', 'consultations', 'emergency', 'departments'],
  MedicalStaff: ['dashboard', 'patients', 'consultations', 'departments'],
  Patient: ['dashboard', 'consultations', 'departments'],
};


export const ProtectedComponent = ({ 
  children, 
  requiredPermission, 
  requiredRole = null,
  fallback = null 
}) => {
  const { user, hasRole } = useAuth();

  if (!user || !user.roles) {
    return fallback;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }

  if (requiredPermission) {
    const hasPermission = checkPermission(user.roles, requiredPermission);
    if (!hasPermission) {
      return fallback;
    }
  }

  return <>{children}</>;
};

// ============================================
// 4. FUNCIONES AUXILIARES
// ============================================

/**
 * Verifica si alguno de los roles del usuario tiene el permiso solicitado
 */
export const checkPermission = (userRoles, permission) => {
  if (!userRoles || userRoles.length === 0) return false;

  // Verificar si alguno de los roles tiene el permiso
  return userRoles.some(role => {
    const rolePermissions = PERMISSIONS[role];
    return rolePermissions && rolePermissions[permission] === true;
  });
};

/**
 * Verifica si el usuario tiene acceso a un módulo específico
 */
export const canAccessModule = (userRoles, moduleId) => {
  if (!userRoles || userRoles.length === 0) return false;

  // Si es Admin, puede acceder a todo
  if (userRoles.includes('Admin')) return true;

  // Verificar si alguno de los roles tiene acceso al módulo
  return userRoles.some(role => {
    const allowedModules = MODULE_ACCESS[role] || [];
    return allowedModules.includes(moduleId);
  });
};

/**
 * Filtra una lista de módulos según los permisos del usuario
 */
export const filterModulesByPermission = (modules, userRoles) => {
  if (!userRoles || userRoles.length === 0) return [];

  return modules.filter(module => 
    canAccessModule(userRoles, module.id)
  );
};

/**
 * Hook personalizado para usar permisos fácilmente
 */
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    // Verificar un permiso específico
    can: (permission) => {
      if (!user || !user.roles) return false;
      return checkPermission(user.roles, permission);
    },
    
    // Verificar acceso a un módulo
    canAccess: (moduleId) => {
      if (!user || !user.roles) return false;
      return canAccessModule(user.roles, moduleId);
    },
    
    // Obtener todos los permisos del usuario
    getPermissions: () => {
      if (!user || !user.roles || user.roles.length === 0) return {};
      
      // Combinar permisos de todos los roles del usuario
      const combinedPermissions = {};
      user.roles.forEach(role => {
        const rolePermissions = PERMISSIONS[role] || {};
        Object.keys(rolePermissions).forEach(permission => {
          // Si algún rol tiene el permiso en true, el usuario lo tiene
          if (rolePermissions[permission]) {
            combinedPermissions[permission] = true;
          }
        });
      });
      return combinedPermissions;
    },

    // Verificar si es admin
    isAdmin: () => {
      if (!user || !user.roles) return false;
      return user.roles.includes('Admin');
    },
  };
};

// ============================================
// 5. COMPONENTE DE ALERTA DE PERMISOS
// ============================================

/**
 * Muestra un mensaje cuando el usuario no tiene permisos
 */
export const PermissionDenied = ({ message = "No tienes permisos para realizar esta acción" }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800 text-sm">{message}</p>
    </div>
  );
};
