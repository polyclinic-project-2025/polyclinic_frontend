// pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Users, Calendar, FileText, Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { 
      icon: Users, 
      label: 'Pacientes', 
      value: '1,234', 
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    { 
      icon: Calendar, 
      label: 'Citas Hoy', 
      value: '42', 
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive'
    },
    { 
      icon: FileText, 
      label: 'Reportes', 
      value: '89', 
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive'
    },
    { 
      icon: Activity, 
      label: 'En Consulta', 
      value: '12', 
      color: 'bg-orange-500',
      change: '-3%',
      changeType: 'negative'
    },
  ];

  const recentActivities = [
    { id: 1, action: 'Nueva cita agendada', patient: 'Juan Pérez', time: 'Hace 5 minutos' },
    { id: 2, action: 'Consulta completada', patient: 'María García', time: 'Hace 15 minutos' },
    { id: 3, action: 'Reporte generado', patient: 'Carlos López', time: 'Hace 30 minutos' },
    { id: 4, action: 'Nuevo paciente registrado', patient: 'Ana Martínez', time: 'Hace 1 hora' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y Título */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Polyclinic</h1>
                <p className="text-sm text-gray-500">Sistema de Gestión</p>
              </div>
            </div>
            
            {/* User Info y Acciones */}
            <div className="flex items-center gap-4">
              {/* Notificaciones */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Configuración */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <Settings className="w-5 h-5" />
              </button>

              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {user?.roles?.join(', ') || 'Usuario'}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Bienvenido de nuevo, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-indigo-100">
            Aquí está el resumen de tu sistema de gestión de policlínica
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actividad Reciente */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.patient}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">
                <p className="font-medium text-indigo-900">Nueva Cita</p>
                <p className="text-sm text-indigo-600">Agendar cita médica</p>
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition">
                <p className="font-medium text-green-900">Registrar Paciente</p>
                <p className="text-sm text-green-600">Agregar nuevo paciente</p>
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                <p className="font-medium text-purple-900">Ver Reportes</p>
                <p className="text-sm text-purple-600">Consultar estadísticas</p>
              </button>
              <button className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition">
                <p className="font-medium text-orange-900">Gestión de Personal</p>
                <p className="text-sm text-orange-600">Administrar usuarios</p>
              </button>
            </div>
          </div>
        </div>

        {/* API Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información de Conexión
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Endpoint Base</p>
              <code className="text-sm font-mono text-gray-900">
                {process.env.REACT_APP_API_URL || 'https://localhost:7001/api'}
              </code>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Autenticación</p>
              <p className="text-sm font-medium text-green-600">JWT Bearer Token</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Estado</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-green-600">Conectado</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;