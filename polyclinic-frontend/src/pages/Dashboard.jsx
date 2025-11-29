// pages/Dashboard.jsx (CON MIDDLEWARE DE PERMISOS)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Activity, Users, Calendar, Bell, Settings,
  Pill, AlertCircle, Package, Menu, Home, Building2, Stethoscope, BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions, filterModulesByPermission } from "../middleware/PermissionMiddleware";
import Departments from "./Departments";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { canAccess } = usePermissions(); // ← Hook de permisos
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleTranslations = {
    Client: "Cliente",
    Patient: "Paciente",
    Doctor: "Doctor",
    Nurse: "Enfermero/a",
    MedicalStaff: "Personal Médico",
    Admin: "Administrador",
  };

  const slides = [
    {
      title: "Campaña de Vacunación 2025",
      description: "Protege a tu familia. Vacunación gratuita contra la covid.",
      color: "from-blue-600 to-green-600",
      icon: "🦠",
    },
    {
      title: "Nuevos Servicios de Cardiología",
      description: "Chequeos preventivos con tecnología de última generación.",
      color: "from-red-500 to-pink-600",
      icon: "❤️",
    },
    {
      title: "Crisis Epidemiológica",
      description: "Alerta por Chikungunya, Dengue y Oropouche. Medidas preventivas.",
      color: "from-emerald-500 to-red-400",
      icon: "⚠️",
    },
    {
      title: "Farmacia 24/7",
      description: "Servicio de farmacia disponible las 24 horas.",
      color: "from-purple-500 to-indigo-600",
      icon: "💊",
    },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const Format = (day, month, year) => {
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return `${day} de ${monthNames[month - 1]} de ${year}`;
  };
  const dateFormatted = Format(day, month, year);

  // Lista completa de módulos
  const allModules = [
    { id: "dashboard", name: "Página Principal", icon: Home },
    { id: "patients", name: "Pacientes", icon: Users },
    { id: "consultations", name: "Consultas", icon: Calendar },
    { id: "emergency", name: "Cuerpo de Guardia", icon: AlertCircle },
    { id: "departments", name: "Departamentos", icon: Building2 },
    { id: "staff", name: "Personal de Salud", icon: Stethoscope },
    { id: "medications", name: "Medicamentos", icon: Pill },
    { id: "warehouse", name: "Almacén Central", icon: Package },
    { id: "reports", name: "Reportes", icon: BarChart3 },
  ];

  // ← FILTRAR MÓDULOS SEGÚN PERMISOS DEL USUARIO
  const modules = filterModulesByPermission(allModules, user?.roles || []);

  const renderContent = () => {
    // ← VALIDAR ACCESO ANTES DE RENDERIZAR
    if (!canAccess(activeModule)) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">
            No tienes permisos para acceder a este módulo
          </p>
          <p className="text-gray-500 mt-2">
            Contacta al administrador si necesitas acceso
          </p>
        </div>
      );
    }

    switch (activeModule) {
      case "departments":
        return <Departments />;
      case "patients":
        return (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Módulo de Pacientes en desarrollo</p>
          </div>
        );
      case "consultations":
        return (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Módulo de Consultas en desarrollo</p>
          </div>
        );
      case "emergency":
        return (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Módulo de Cuerpo de Guardia en desarrollo</p>
          </div>
        );
      case "staff":
        return (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Módulo de Personal de Salud en desarrollo</p>
          </div>
        );
      case "medications":
        return (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Módulo de Medicamentos en desarrollo</p>
          </div>
        );
      case "warehouse":
        return (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Módulo de Almacén Central en desarrollo</p>
          </div>
        );
      case "reports":
        return (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Módulo de Reportes en desarrollo</p>
          </div>
        );
      default:
        return (
          <>
            {/* Promotional Slider */}
            <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl mb-6">
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 bg-gradient-to-r ${slide.color} transition-opacity duration-1000 ${
                    idx === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="flex items-center justify-between h-full px-12">
                    <div className="text-white max-w-2xl">
                      <div className="text-6xl mb-4">{slide.icon}</div>
                      <h2 className="text-4xl font-bold mb-3">{slide.title}</h2>
                      <p className="text-xl text-white/90">{slide.description}</p>
                    </div>
                    <div className="text-9xl opacity-20">{slide.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full ${
          sidebarOpen ? "w-72" : "w-20"
        } bg-white/80 backdrop-blur-xl border-r border-slate-200/50 transition-all duration-300 z-50 shadow-xl`}
      >
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-700 rounded-lg flex items-center justify-center">
                    <Activity className="text-white" size={18} />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-700 bg-clip-text text-transparent">
                    MatComCare Pro
                  </h1>
                </div>
                <p className="text-xs text-slate-500 ml-10">Policlínico Docente</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
        
        {/* ← RENDERIZAR SOLO MÓDULOS PERMITIDOS */}
        <nav className="p-4 space-y-1">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-800 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{module.name}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`${sidebarOpen ? "ml-72" : "ml-20"} transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40">
          <div className="px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Sistema de Gestión</h2>
                <p className="text-slate-500">{dateFormatted}</p>
              </div>

              <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <Settings className="w-5 h-5" />
                </button>

                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">
                    {user?.roles?.length > 0
                      ? user.roles.map((role) => roleTranslations[role] || role).join(", ")
                      : "Usuario"}
                  </p>
                </div>

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

        {/* Content Area */}
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
};

export default Dashboard;