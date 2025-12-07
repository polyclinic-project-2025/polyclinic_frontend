// components/PatientCIValidator.jsx (VERSIÓN CORREGIDA)
import React, { useState, useEffect } from 'react';
import { User, IdCard, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { patientService } from '../services/patientService';

const PatientCIValidator = ({ onPatientSelect, selectedPatient }) => {
  const [ci, setCI] = useState(selectedPatient?.identification || '');
  const [nombre, setNombre] = useState(selectedPatient?.name || '');
  const [error, setError] = useState('');
  const [pacienteValidado, setPacienteValidado] = useState(selectedPatient || null);
  const [validando, setValidando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Función para normalizar nombres (para comparación)
  const normalizarNombre = (nombre) => {
    return nombre.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Función para buscar sugerencias mientras se escribe
  const buscarSugerencias = async (termino) => {
    if (!termino.trim() || termino.length < 3) {
      setSugerencias([]);
      return;
    }

    try {
      const pacientes = await patientService.getAll();
      
      // Filtrar pacientes que coincidan con el término
      const filtrados = pacientes.filter(paciente => {
        const nombreNormalizado = normalizarNombre(paciente.name);
        const ciNormalizado = paciente.identification.toLowerCase();
        const terminoNormalizado = normalizarNombre(termino);
        
        return nombreNormalizado.includes(terminoNormalizado) || 
               ciNormalizado.includes(termino.toLowerCase());
      }).slice(0, 5); // Limitar a 5 sugerencias

      setSugerencias(filtrados);
    } catch (error) {
      console.error('Error buscando sugerencias:', error);
      setSugerencias([]);
    }
  };

  // Validar que CI y Nombre correspondan al mismo paciente
  const validarCoincidencia = async (ciValor, nombreValor) => {
    if (!ciValor.trim() || !nombreValor.trim()) {
      setPacienteValidado(null);
      onPatientSelect(null);
      return;
    }

    setValidando(true);
    setError('');
    
    try {
      // Buscar TODOS los pacientes
      const todosPacientes = await patientService.getAll();
      
      // Buscar por CI primero (exacto o parcial)
      const pacientePorCI = todosPacientes.find(paciente => 
        paciente.identification.toLowerCase().includes(ciValor.toLowerCase().trim())
      );
      
      if (pacientePorCI) {
        // Normalizar nombres para comparación
        const nombreEscritoNormalizado = normalizarNombre(nombreValor);
        const nombrePacienteNormalizado = normalizarNombre(pacientePorCI.name);
        
        // Verificar si el nombre escrito coincide con el nombre del paciente del CI
        const coincide = nombrePacienteNormalizado.includes(nombreEscritoNormalizado) || 
                        nombreEscritoNormalizado.includes(nombrePacienteNormalizado) ||
                        nombreEscritoNormalizado === nombrePacienteNormalizado;
        
        if (coincide) {
          // ¡VALIDACIÓN EXITOSA!
          setPacienteValidado(pacientePorCI);
          onPatientSelect(pacientePorCI);
          setError('');
        } else {
          // NOMBRE NO COINCIDE
          setError(`El CI "${ciValor}" corresponde a: "${pacientePorCI.name}". Verifique el nombre.`);
          setPacienteValidado(null);
          onPatientSelect(null);
        }
      } else {
        // CI NO ENCONTRADO - Buscar por nombre
        const pacientePorNombre = todosPacientes.find(paciente => {
          const nombrePacienteNormalizado = normalizarNombre(paciente.name);
          const nombreEscritoNormalizado = normalizarNombre(nombreValor);
          return nombrePacienteNormalizado.includes(nombreEscritoNormalizado) ||
                 nombreEscritoNormalizado.includes(nombrePacienteNormalizado);
        });
        
        if (pacientePorNombre) {
          setError(`Paciente "${pacientePorNombre.name}" encontrado pero con CI: ${pacientePorNombre.identification}. Verifique el CI.`);
          setPacienteValidado(null);
          onPatientSelect(null);
        } else {
          // PACIENTE NO ENCONTRADO
          setError('Paciente no encontrado. Verifique los datos o cree el paciente primero en el módulo Pacientes.');
          setPacienteValidado(null);
          onPatientSelect(null);
        }
      }
    } catch (error) {
      console.error('Error validando paciente:', error);
      setError('Error al buscar paciente. Intente nuevamente.');
      setPacienteValidado(null);
      onPatientSelect(null);
    } finally {
      setValidando(false);
    }
  };

  // Limpiar selección
  const handleClear = () => {
    setCI('');
    setNombre('');
    setError('');
    setPacienteValidado(null);
    setSugerencias([]);
    onPatientSelect(null);
  };

  // Seleccionar paciente de sugerencias
  const handleSelectSugerencia = (paciente) => {
    setCI(paciente.identification);
    setNombre(paciente.name);
    setPacienteValidado(paciente);
    onPatientSelect(paciente);
    setSugerencias([]);
    setMostrarSugerencias(false);
    setError('');
  };

  // Efecto para buscar sugerencias
  useEffect(() => {
    if (nombre.trim() && nombre.length >= 3) {
      buscarSugerencias(nombre);
    } else {
      setSugerencias([]);
    }
  }, [nombre]);

  // Efecto para validar cuando ambos campos tienen valores (con debounce)
  useEffect(() => {
    if (ci.trim() && nombre.trim() && !pacienteValidado) {
      const timer = setTimeout(() => {
        validarCoincidencia(ci, nombre);
      }, 800); // Debounce de 0.8 segundos

      return () => clearTimeout(timer);
    } else if (!ci.trim() || !nombre.trim()) {
      // Si falta algún campo, limpiar validación
      setPacienteValidado(null);
      onPatientSelect(null);
    }
  }, [ci, nombre]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Identificación (CI) *
        </label>
        <div className="relative">
          <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={ci}
            onChange={(e) => {
              setCI(e.target.value);
              setPacienteValidado(null);
            }}
            placeholder="Número de identificación completo"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
              error ? 'border-red-300' : 
              pacienteValidado ? 'border-green-300' : 
              'border-gray-300'
            }`}
          />
          {validando && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-600"></div>
            </div>
          )}
          {pacienteValidado && !validando && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
          )}
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Paciente *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setPacienteValidado(null);
              setMostrarSugerencias(true);
            }}
            onFocus={() => setMostrarSugerencias(true)}
            onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
            placeholder="Nombre completo del paciente"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
              error ? 'border-red-300' : 
              pacienteValidado ? 'border-green-300' : 
              'border-gray-300'
            }`}
          />
          {nombre.length >= 3 && (
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Sugerencias */}
        {mostrarSugerencias && sugerencias.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {sugerencias.map((paciente) => (
              <div
                key={paciente.patientId}
                onClick={() => handleSelectSugerencia(paciente)}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{paciente.name}</p>
                    <p className="text-sm text-gray-600">
                      CI: {paciente.identification} • {paciente.age} años
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 text-sm font-medium">{error}</p>
              <p className="text-red-600 text-xs mt-1">
                Verifique los datos o cree el paciente primero en el módulo Pacientes.
              </p>
            </div>
          </div>
        </div>
      )}

      {pacienteValidado && !error && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">{pacienteValidado.name}</p>
                <p className="text-sm text-gray-600">
                  CI: {pacienteValidado.identification} • {pacienteValidado.age} años
                  {pacienteValidado.contact && ` • ${pacienteValidado.contact}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        <p className="font-medium mb-1">📝 Cómo usar:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Ingrese el CI completo del paciente</li>
          <li>Escriba el nombre (aparecerán sugerencias después de 3 letras)</li>
          <li>Puede seleccionar un paciente de las sugerencias</li>
          <li>La validación se realiza automáticamente</li>
        </ul>
      </div>
    </div>
  );
};

export default PatientCIValidator;