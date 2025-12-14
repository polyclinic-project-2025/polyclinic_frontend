// pages/Dashboard.jsx 
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut, Activity, Users, Calendar, Bell, Settings,
  Pill, AlertCircle, Package, Menu, Home, Building2, Stethoscope, BarChart3, ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions, filterModulesByPermission } from "../middleware/PermissionMiddleware";
import { warehouseManagerService } from "../services/warehouseManagerService";
import { userService } from "../services/userService";
import Departments from "./Departments";
import Warehouse from "./Warehouse";
import UsersView from "./UsersView";
import ModalSettings from "../components/ModalSettings";
import ConsultationsReferral from "./ConsultationsReferral";
import ConsultationsDerivation from "./ConsultationsDerivation";
import Employees from "./Employees";
import Medications from "./Medications";
import Patients from "./Patients";
import ReporteFuncion1 from "./reports/ReporteFuncion1";
import ReporteFuncion2 from "./reports/ReporteFuncion2";
import ReporteDateRange from "./reports/ReporteDateRange";
import ReporteLast10 from "./reports/ReporteLast10";
import ReporteFuncion5 from "./reports/ReporteFuncion5";
import ReporteFuncion6 from "./reports/ReporteFuncion6";
import ReporteFuncion7 from "./reports/ReporteFuncion7";
import EmergencyGuard from "./EmergencyGuard";
import EmergencyCare from "./EmergencyCare";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { canAccess } = usePermissions();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModalSettings, setShowModalSettings] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [currentWarehouseManager, setCurrentWarehouseManager] = useState(null);
  const [isCurrentWarehouseManager, setIsCurrentWarehouseManager] = useState(false);
  const [loadingWarehouseManager, setLoadingWarehouseManager] = useState(true);

  // Detectar navegación desde ModalSettings
  useEffect(() => {
    if (location.pathname === '/users') {
      setActiveModule('users');
    }

    if (location.pathname.startsWith('/employees')) {
      setActiveModule('staff');

      const params = new URLSearchParams(location.search);
      const type = params.get('type');

      if (type === 'doctor' || type === 'nurse') {
        setSelectedMode({ itemId: 'staff', modeId: type });
      } else {
        setSelectedMode(null);
      }

      setActiveItem(null);
    }
  }, [location.pathname, location.search]);

  // Verificar si el usuario es el jefe de almacén actual
  useEffect(() => {
    const verifyCurrentWarehouseManager = async () => {
      try {
        setLoadingWarehouseManager(true);
        
        const manager = await warehouseManagerService.getCurrent();
        setCurrentWarehouseManager(manager);

        if (user?.roles?.includes('Jefe de Almacén')) {
          const profile = await userService.getProfile(user.id);
          const userEmployeeId = profile.profile?.employeeId;
          
          setIsCurrentWarehouseManager(userEmployeeId === manager?.employeeId);
        } else {
          setIsCurrentWarehouseManager(false);
        }
      } catch (err) {
        console.warn('Error verificando jefe de almacén actual:', err);
        setCurrentWarehouseManager(null);
        setIsCurrentWarehouseManager(false);
      } finally {
        setLoadingWarehouseManager(false);
      }
    };

    if (user?.id) {
      verifyCurrentWarehouseManager();
    }
  }, [user?.id, user?.roles]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleTranslations = {
    Paciente: "Paciente",
    Doctor: "Doctor",
    "Enfermero/a": "Enfermero/a",
    "Jefe de Almacén": "Jefe de Almacén",
    Admin: "Admin",
    "Jefe de Departamento": "Jefe de Departamento",
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

  useEffect(() => {
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

  const menuItems = [
    {
      id: "consultations", 
      modes: [
        { id: "referral", name: "Por Remisión Médica" },
        { id: "derivation", name: "Por Derivación Interna" }
      ]
    },
    {
      id: "staff",
      modes: [
        { id: "doctor", name: "Doctores" },
        { id: "nurse", name: "Enfermeros" }
      ]
    },
    {
      id: "reports",
      modes: [
        { id: "funcion1", name: "Función 1" },
        { id: "funcion2", name: "Función 2" },
        { id: "daterange", name: "Consultas por Rango de Fechas" },
        { id: "last10", name: "Últimas 10 Consultas" },
        { id: "funcion5", name: "Consumo Acumulado de Medicamentos" },
        { id: "funcion6", name: "Función 6" },
        { id: "funcion7", name: "Función 7" }
      ]
    },
    {
      id: "emergency",
      modes: [
        { id: "guard", name: "Guardias" },
        { id: "care", name: "Atenciones" }
      ]
    },
  ];

  const handleItemClick = (itemId) => {
    const hasSubmenu = menuItems.find(item => item.id === itemId);
    
    if (hasSubmenu) {
      setActiveItem(activeItem === itemId ? null : itemId);
    } else {
      setActiveModule(itemId);
      setSelectedMode(null);
      setActiveItem(null);
    }
  };

  const handleModeSelect = (itemId, modeId) => {
    if (itemId === 'staff') {
      navigate(`/employees?type=${modeId}`);
      setSelectedMode({ itemId: 'staff', modeId });
      setActiveModule('staff');
      setActiveItem(null);
      return;
    }

    setSelectedMode({ itemId, modeId });
    setActiveModule(itemId);
    setActiveItem(null);
  };

  // Cerrar submenú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeItem && !event.target.closest('.sidebar-nav')) {
        setActiveItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeItem]);

  // Filtrar módulos
  const modules = filterModulesByPermission(allModules, user?.roles || []).filter(module => {
    if (module.id === 'warehouse' && user?.roles?.includes('Jefe de Almacén') && !isCurrentWarehouseManager) {
      return false;
    }
    return true;
  });

  const renderContent = () => {
    if (!canAccess(activeModule)) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">
            No tienes permisos para acceder a este módulo
            Roles: {user?.roles?.join(", ")}
          </p>
          <p className="text-gray-500 mt-2">
            Contacta al administrador si necesitas acceso
          </p>
        </div>
      );
    }

    // Mostrar modo seleccionado si existe
    if (selectedMode) {
      const module = allModules.find(m => m.id === selectedMode.itemId);
      const mode = menuItems
        .find(item => item.id === selectedMode.itemId)
        ?.modes.find(m => m.id === selectedMode.modeId);

      if (selectedMode.itemId === 'staff' && (mode.id === 'doctor' || mode.id === 'nurse')) {
        return <Employees type={mode.id} />;
      }

      if (selectedMode.itemId === 'reports') {
        switch (mode.id) {
          case "funcion1":
            return <ReporteFuncion1 />;
          case "funcion2":
            return <ReporteFuncion2 />;
          case "daterange":
            return <ReporteDateRange />;
          case "last10":
            return <ReporteLast10 />;
          case "funcion5":
            return <ReporteFuncion5 />;
          case "funcion6":
            return <ReporteFuncion6 />;
          case "funcion7":
            return <ReporteFuncion7 />;
          default:
            return (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
                <p className="text-gray-700 text-lg font-semibold">
                  Reporte no encontrado
                </p>
              </div>
            );
        }
      }
      if (selectedMode.itemId === 'emergency') {
        switch (mode.id) {
          case "guard":
            return <EmergencyGuard />;
          case "care":
            return <EmergencyCare />;
          default:
            return (
              <div className="text-center py-12">
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 max-w-md mx-auto">
                  <AlertCircle className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
                  <p className="text-gray-700 text-lg font-semibold mb-2">
                    {module.name}
                  </p>
                  <p className="text-cyan-700 text-xl font-bold">
                    Modo: {mode.name}
                  </p>
                </div>
              </div>
            );
        }
      }

      switch (mode.id) {
        case "referral":
          return <ConsultationsReferral />;
        
        case "derivation":
          return <ConsultationsDerivation  />;

        default:
          return (
          <div className="text-center py-12">
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-semibold mb-2">
                {module.name}
              </p>
              <p className="text-cyan-700 text-xl font-bold">
                Modo: {mode.name}
              </p>
              <p className="text-gray-500 text-sm mt-4">
                Contenido específico para este modo en desarrollo
              </p>
            </div>
          </div>
        )
      }
    }

    switch (activeModule) {
      case "users":
        return <UsersView />;
      case "departments":
        return <Departments />;
      case "patients":
        return <Patients />;
      case "consultations":
        if (!selectedMode || selectedMode.itemId !== "consultations") {
          return (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Selecciona un modo de consulta</p>
              <p className="text-gray-400 text-sm mt-2">Usa el menú lateral para elegir el tipo de consulta</p>
            </div>
          );
        }
        break;
      case "staff":
        return (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Módulo de Personal de Salud en desarrollo</p>
          </div>
        );
      case "medications":
        return <Medications />;
      case "warehouse":
        return <Warehouse />;
      case "reports":
        if (!selectedMode || selectedMode.itemId !== "reports") {
          return (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Selecciona un tipo de reporte</p>
              <p className="text-gray-400 text-sm mt-2">Usa el menú lateral para elegir el reporte que deseas ver</p>
            </div>
          );
        }
        break;
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
        } bg-white/80 backdrop-blur-xl border-r border-slate-200/50 transition-all duration-300 z-30 shadow-xl flex flex-col`}
      >
        <div className="p-6 border-b border-slate-200/50 flex-shrink-0">
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
        
        <nav className="p-4 space-y-1 sidebar-nav flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent'
          }}
        >
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            const hasSubmenu = menuItems.find(item => item.id === module.id);
            const isSubmenuOpen = activeItem === module.id;

            return (
              <div key={module.id} className="relative group">
                <button
                  onClick={() => handleItemClick(module.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-800 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {sidebarOpen && <span className="font-medium">{module.name}</span>}
                  </div>
                  {sidebarOpen && hasSubmenu && (
                    <ChevronRight
                      size={18}
                      className={`transition-transform ${
                        isSubmenuOpen ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Submenú inline */}
                {sidebarOpen && hasSubmenu && isSubmenuOpen && (
                  <div
                    className="mt-2 pl-10 pr-4 space-y-1"
                    role="menu"
                    aria-labelledby={`menu-${module.id}`}
                  >
                    {hasSubmenu.modes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => handleModeSelect(module.id, mode.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg hover:bg-cyan-50 transition ${
                          selectedMode?.itemId === module.id && selectedMode?.modeId === mode.id
                            ? "bg-cyan-100 text-cyan-700 font-semibold"
                            : "text-gray-700"
                        }`}
                        role="menuitem"
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        
        {/* Estilos CSS para scrollbar personalizado */}
        <style jsx>{`
          .sidebar-nav::-webkit-scrollbar {
            width: 6px;
          }
          
          .sidebar-nav::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .sidebar-nav::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          
          .sidebar-nav::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </aside>

      {/* Main Content */}
      <main
        className={`${sidebarOpen ? "ml-72" : "ml-20"} transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30">
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

                <button onClick={() => setShowModalSettings(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
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

      {/* Modal Settings */}
      {showModalSettings && (
        <ModalSettings 
          isOpen={showModalSettings} 
          onClose={() => setShowModalSettings(false)}
          onNavigateToModule={(moduleId) => setActiveModule(moduleId)}
        />
      )}
    </div>
  );
};

export default Dashboard;
export const roleTranslations = {
  Paciente: "Paciente",
  Doctor: "Doctor",
  "Enfermero/a": "Enfermero/a",
  "Jefe de Almacén": "Jefe de Almacén",
  Admin: "Admin",
  "Jefe de Departamento": "Jefe de Departamento",
};