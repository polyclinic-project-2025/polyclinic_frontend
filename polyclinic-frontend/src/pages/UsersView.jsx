import React, { useState, useEffect } from 'react';
import {
  Building2, Edit, Trash2, Search, X, Loader2, AlertCircle, CheckCircle2, Download,
} from 'lucide-react';
import { userService } from '../services/userService';
import { ProtectedComponent, usePermissions } from '../middleware/PermissionMiddleware';

const Users = () => {
  const { can } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', phoneNumber: '', roles: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Cargando usuarios...');
      
      const data = await userService.getAll();
      console.log('✅ Usuarios recibidos:', data);
      console.log('✅ Es array?', Array.isArray(data));
      
      // Asegurarse de que siempre sea un array
      setUsers(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error('❌ Error al cargar usuarios:', err);
      const errorMessage = err.message || 'Error al cargar usuarios';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (_user) => {
    setModalMode('edit');
    setFormData({
      email: _user.email,
      phoneNumber: _user.phoneNumber || '',
      roles: Array.isArray(_user.roles) ? _user.roles.join(', ') : '',
    });
    setSelectedUser(_user);
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar el usuario "${name}"?`)) {
      return;
    }

    try {
      await userService.delete(id);
      setSuccess('Usuario eliminado exitosamente');
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar usuario';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Actualizar email si cambió
      if (formData.email !== selectedUser.email) {
        await userService.patchField(selectedUser.id, "Email", formData.email, "replace");
      }

      // Actualizar teléfono si cambió
      if (formData.phoneNumber !== selectedUser.phoneNumber) {
        await userService.patchField(selectedUser.id, "PhoneNumber", formData.phoneNumber, "replace");
      }

      // Actualizar roles si cambiaron
      const rolesArray = formData.roles
        .split(',')
        .map(role => role.trim())
        .filter(role => role.length > 0);

      const originalRoles = selectedUser.roles || [];
      const rolesChanged = JSON.stringify(rolesArray.sort()) !== JSON.stringify(originalRoles.sort());

      if (rolesChanged) {
        await userService.patchField(selectedUser.id, "Roles", null, "replace", rolesArray);
      }

      setSuccess('Usuario actualizado exitosamente');
      setShowModal(false);
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Error al actualizar:', err);
      const errorMessage = err.message || 'Error al guardar usuario';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportUsers = async () => {
    if (!can('canExportUsers')) {
      setError('No tienes permisos para exportar usuarios');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const url = await userService.exportToPdf();
      
      // Crear un enlace temporal y hacer clic
      const a = document.createElement('a');
      a.href = url;
      a.download = `usuarios_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar la URL cuando ya no se necesite
      URL.revokeObjectURL(url);
      
      setSuccess('Usuarios exportados exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.message || 'Error al exportar usuarios';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((usr) =>
    (usr.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (usr.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (usr.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="text-cyan-600" />
            Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los usuarios del policlínico
          </p>
        </div>

        <ProtectedComponent requiredPermission="canExportUsers">
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg"
            disabled={loading}
          >
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </ProtectedComponent>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="w-5 h-5 text-green-600" />
          </button>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((_user) => (
          <div
            key={_user.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {_user.name || _user.email?.split('@')[0]}
                  </h3>
                  <p className="text-sm text-gray-600">{_user.email}</p>
                  {_user.phoneNumber && (
                    <p className="text-sm text-gray-500">{_user.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(_user)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(_user.id, _user.name || _user.email)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {_user.roles && _user.roles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {_user.roles.map((role, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full"
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Editar Usuario
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: user@polyclinic.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: +1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles (separados por comas)
                </label>
                <input
                  type="text"
                  value={formData.roles}
                  onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Ej: Admin, Doctor, Nurse"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                    'Actualizar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;