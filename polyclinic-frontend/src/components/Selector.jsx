// Selector.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";

const GenericSelector = ({
  service,
  method,
  methodParams, // NUEVO: parámetros para el método
  selected,
  onSelect,
  getDisplayText,
  getSearchableText,
  renderItem,
  getItemId, // NUEVO: función para obtener el ID único de cada item
  icon: Icon,
  label = "Seleccionar",
  placeholder = "Buscar y seleccionar...",
  searchPlaceholder = "Buscar...",
  required = false,
  filterData = null,
}) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  // Recargar items cuando cambian los parámetros del método
  useEffect(() => {
    loadItems();
  }, [methodParams]);

  // Click outside (mejorado para no cerrar en scrollbar)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // No cerrar si el clic es dentro del dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Verificar si el clic fue en un scrollbar o en elementos con scroll
        const clickedElement = event.target;
        
        // Verificar si es un clic en el scrollbar
        const isScrollbarClick = 
          event.clientX >= document.documentElement.clientWidth - 20 ||
          event.clientY >= document.documentElement.clientHeight - 20;
        
        // Verificar si el elemento clickeado tiene overflow
        const hasOverflow = (element) => {
          if (!element) return false;
          const style = window.getComputedStyle(element);
          return style.overflowY === 'auto' || style.overflowY === 'scroll' || 
                 style.overflowX === 'auto' || style.overflowX === 'scroll';
        };
        
        // Buscar si algún padre tiene scroll
        let parent = clickedElement;
        let isInScrollableArea = false;
        while (parent && parent !== document.body) {
          if (hasOverflow(parent)) {
            const rect = parent.getBoundingClientRect();
            // Verificar si el clic está en el área del scrollbar
            if (event.clientX > rect.right - 20 || event.clientY > rect.bottom - 20) {
              isInScrollableArea = true;
              break;
            }
          }
          parent = parent.parentElement;
        }
        
        // No cerrar si fue clic en scrollbar o área scrollable
        if (!isScrollbarClick && !isInScrollableArea) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        getSearchableText(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  const loadItems = async () => {
    try {
      setLoading(true);

      let data = null;
      switch (method) {
        case "getDoctors":
          if (methodParams) {
            data = await service.getDoctorsByDepartment(methodParams);
          } 
          break;
        default:
          data = await service.getAll();
          break;
      }

      const finalData = filterData ? filterData(data) : data;
      setItems(finalData);
      setFilteredItems(finalData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    onSelect(item);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    onSelect(null);
    setSearchTerm("");
  };

  // Función auxiliar para obtener ID del item
  const getItemKey = (item) => {
    if (getItemId) {
      return getItemId(item);
    }
    // Fallback: intenta varias propiedades comunes
    return item.id || item.employeeId || item.departmentId || item.referralId || item.patientId || JSON.stringify(item);
  };

  // Función para verificar si un item está seleccionado
  const isItemSelected = (item) => {
    if (!selected) return false;
    return getItemKey(item) === getItemKey(selected);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {/* Selector principal */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 bg-cyan-50 border border-gray-300 rounded-lg cursor-pointer transition-all 
            ${
              isOpen ? "ring-2 ring-cyan-500 border-transparent" : ""
            } hover:border-cyan-400`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {selected ? (
                <>
                  {Icon && <Icon className="w-5 h-5 text-cyan-600" />}
                  <span className="text-gray-900">
                    {getDisplayText(selected)}
                  </span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">{placeholder}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selected && (
                <button
                  onClick={handleClearSelection}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              )}
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
            {/* Barra de búsqueda */}
            <div className="p-3 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Cargando...</div>
              ) : filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm
                    ? "No se encontraron resultados"
                    : "No hay datos disponibles"}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={getItemKey(item)}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className={`w-full px-4 py-3 text-left hover:bg-cyan-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0
              ${isItemSelected(item) ? "bg-cyan-100" : ""}`}
                  >
                    {renderItem(item, isItemSelected(item))}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericSelector;