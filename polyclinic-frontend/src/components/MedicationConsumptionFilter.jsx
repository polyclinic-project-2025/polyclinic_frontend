// components/MedicationConsumptionFilter.jsx
import React, { useState, useEffect } from "react";
import { Package, Calendar, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const MedicationConsumptionFilter = ({ analyticsService, medicationService, onSearchParams }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [medications, setMedications] = useState([]);
  const [selectedMedicationId, setSelectedMedicationId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [consumptionData, setConsumptionData] = useState(null);
  const [error, setError] = useState("");

  // Cargar medicamentos al montar el componente
  useEffect(() => {
    const fetchMedications = async () => {
      setLoadingMeds(true);
      try {
        const response = await medicationService.getAll();
        
        let medicationsData = null;
        if (response.success && response.data) {
          medicationsData = response.data;
        } else if (response.isSuccess && response.value) {
          medicationsData = response.value;
        } else if (Array.isArray(response)) {
          medicationsData = response;
        }
        
        if (medicationsData && medicationsData.length > 0) {
          setMedications(medicationsData);
        } else {
          setError("No se pudieron cargar los medicamentos");
        }
      } catch (err) {
        console.error("Error al cargar medicamentos:", err);
        setError("Error al cargar la lista de medicamentos");
      } finally {
        setLoadingMeds(false);
      }
    };
    fetchMedications();
  }, [medicationService]);

  // Manejar la búsqueda
  const handleSearch = async () => {
    if (!selectedMedicationId) {
      setError("Debe seleccionar un medicamento");
      // Limpiar los parámetros de exportación
      if (onSearchParams) {
        onSearchParams(null);
      }
      return;
    }

    setLoading(true);
    setError("");
    setConsumptionData(null);

    try {
      const params = {
        medicationId: selectedMedicationId,
        month: parseInt(month),
        year: parseInt(year),
      };

      const response = await analyticsService.getMedicationConsumption(params);

      // Los datos vienen directamente en response
      if (response && response.scientificName) {
        setConsumptionData(response);
        
        // Pasar los parámetros al componente padre para exportación
        if (onSearchParams) {
          onSearchParams(params);
        }
      } else {
        setError("No se pudieron obtener los datos de consumo");
        // Limpiar los parámetros en caso de error
        if (onSearchParams) {
          onSearchParams(null);
        }
      }
    } catch (err) {
      console.error("Error al obtener consumo:", err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Error al obtener los datos de consumo");
      }
      
      // Limpiar los parámetros en caso de error
      if (onSearchParams) {
        onSearchParams(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Determinar el estado del stock
  const getStockStatus = () => {
    if (!consumptionData) return null;

    const { quantityWarehouse, minQuantityWarehouse, maxQuantityWarehouse } = consumptionData;

    if (quantityWarehouse < minQuantityWarehouse) {
      return { 
        status: "critical", 
        text: "Crítico - Por debajo del mínimo", 
        color: "red",
        icon: XCircle 
      };
    } else if (quantityWarehouse > maxQuantityWarehouse) {
      return { 
        status: "excess", 
        text: "Exceso - Por encima del máximo", 
        color: "orange",
        icon: AlertCircle 
      };
    } else {
      return { 
        status: "normal", 
        text: "Normal - Dentro del rango", 
        color: "green",
        icon: CheckCircle 
      };
    }
  };

  const stockStatus = getStockStatus();

  // Generar años para el selector
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const months = [
    { value: 1, name: "Enero" },
    { value: 2, name: "Febrero" },
    { value: 3, name: "Marzo" },
    { value: 4, name: "Abril" },
    { value: 5, name: "Mayo" },
    { value: 6, name: "Junio" },
    { value: 7, name: "Julio" },
    { value: 8, name: "Agosto" },
    { value: 9, name: "Septiembre" },
    { value: 10, name: "Octubre" },
    { value: 11, name: "Noviembre" },
    { value: 12, name: "Diciembre" }
  ];

  return (
    <div className="space-y-6">
      {/* Formulario de Búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Filtros de Búsqueda
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Selector de Medicamento */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Medicamento
              {medications.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({medications.length} disponibles)
                </span>
              )}
            </label>
            <select
              value={selectedMedicationId}
              onChange={(e) => {
                setSelectedMedicationId(e.target.value);
                setError("");
                setConsumptionData(null);
                // Limpiar parámetros cuando cambia la selección
                if (onSearchParams) {
                  onSearchParams(null);
                }
              }}
              disabled={loadingMeds}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-gray-800 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingMeds ? "Cargando medicamentos..." : "Seleccione un medicamento"}
              </option>
              {medications.map((med) => (
                <option key={med.medicationId} value={med.medicationId}>
                  {med.commercialName} ({med.scientificName})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Mes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mes
            </label>
            <select
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                if (consumptionData && onSearchParams) {
                  onSearchParams(null);
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-gray-800 font-medium"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Año */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Año
            </label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                if (consumptionData && onSearchParams) {
                  onSearchParams(null);
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white text-gray-800 font-medium"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón de Búsqueda */}
        <button
          onClick={handleSearch}
          disabled={loading || loadingMeds}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 transform hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Consultando...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Consultar Consumo
            </>
          )}
        </button>

        {/* Mensaje de Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      {consumptionData && (
        <div className="space-y-6">
          {/* Información del Medicamento */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Información del Medicamento
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Nombre Comercial</p>
                <p className="text-xl font-bold text-gray-800">
                  {consumptionData.commercialName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Nombre Científico</p>
                <p className="text-xl font-bold text-gray-800">
                  {consumptionData.scientificName}
                </p>
              </div>
            </div>
          </div>

          {/* Consumo del Mes */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6" />
              <h3 className="text-xl font-semibold">
                Consumo del Mes
              </h3>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-6xl font-bold">
                {consumptionData.totalConsumption}
              </p>
              <p className="text-2xl font-medium text-orange-100">
                unidades
              </p>
            </div>
            <p className="text-orange-100 mt-3 text-lg">
              Período: {months.find(m => m.value === parseInt(month))?.name} {year}
            </p>
          </div>

          {/* Niveles de Inventario */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Niveles de Inventario (Almacén)
              </h3>
            </div>

            {/* Estado del Stock */}
            {stockStatus && (
              <div
                className={`mb-6 p-5 rounded-xl border-2 flex items-center gap-4 ${
                  stockStatus.color === "red"
                    ? "bg-red-50 border-red-300"
                    : stockStatus.color === "orange"
                    ? "bg-orange-50 border-orange-300"
                    : "bg-green-50 border-green-300"
                }`}
              >
                <stockStatus.icon 
                  className={`w-8 h-8 ${
                    stockStatus.color === "red"
                      ? "text-red-600"
                      : stockStatus.color === "orange"
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado del Inventario</p>
                  <p
                    className={`text-lg font-bold ${
                      stockStatus.color === "red"
                        ? "text-red-700"
                        : stockStatus.color === "orange"
                        ? "text-orange-700"
                        : "text-green-700"
                    }`}
                  >
                    {stockStatus.text}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
                <p className="text-sm text-blue-600 font-semibold mb-1">Disponible Actual</p>
                <p className="text-4xl font-bold text-blue-700">
                  {consumptionData.quantityWarehouse}
                </p>
                <p className="text-xs text-blue-600 mt-1">unidades en almacén</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200 shadow-sm">
                <p className="text-sm text-red-600 font-semibold mb-1">Mínimo Definido</p>
                <p className="text-4xl font-bold text-red-700">
                  {consumptionData.minQuantityWarehouse}
                </p>
                <p className="text-xs text-red-600 mt-1">nivel mínimo</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 shadow-sm">
                <p className="text-sm text-green-600 font-semibold mb-1">Máximo Definido</p>
                <p className="text-4xl font-bold text-green-700">
                  {consumptionData.maxQuantityWarehouse}
                </p>
                <p className="text-xs text-green-600 mt-1">nivel máximo</p>
              </div>
            </div>

            {/* Barra de Progreso Visual */}
            <div className="mt-6 p-5 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-700 mb-3">Visualización del Stock</p>
              <div className="flex justify-between text-sm text-gray-600 mb-3 font-medium">
                <span>Mín: {consumptionData.minQuantityWarehouse}</span>
                <span className="font-bold text-gray-800">Actual: {consumptionData.quantityWarehouse}</span>
                <span>Máx: {consumptionData.maxQuantityWarehouse}</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${
                    consumptionData.quantityWarehouse < consumptionData.minQuantityWarehouse
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : consumptionData.quantityWarehouse > consumptionData.maxQuantityWarehouse
                      ? "bg-gradient-to-r from-orange-500 to-orange-600"
                      : "bg-gradient-to-r from-green-500 to-green-600"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(5, (consumptionData.quantityWarehouse / consumptionData.maxQuantityWarehouse) * 100)
                    )}%`,
                  }}
                >
                  <span className="text-xs font-bold text-white drop-shadow">
                    {Math.round((consumptionData.quantityWarehouse / consumptionData.maxQuantityWarehouse) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationConsumptionFilter;