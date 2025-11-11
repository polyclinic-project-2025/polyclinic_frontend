// pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "Client",
    phoneNumber: null,
    validation: {
      IdentificationNumber: "",
    },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: "Client", label: "Cliente" },
    { value: "Patient", label: "Paciente" },
    { value: "Doctor", label: "Doctor" },
    { value: "Nurse", label: "Enfermero/a" },
    { value: "MedicalStaff", label: "Personal Médico" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "IdentificationNumber") {
      // Si el 'name' es IdentificationNumber, actualiza el objeto anidado 'validation'
      setFormData((prev) => ({
        ...prev,
        validation: {
          ...prev.validation,
          IdentificationNumber: value,
        },
      }));
    } else {
      // Para todos los demás campos de nivel superior (email, password, role, etc.)
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.email) {
      setError("El email es requerido");
      return false;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    // Validar requisitos de contraseña según tu API
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("La contraseña debe contener mayúsculas, minúsculas y números");
      return false;
    }

    if (
      formData.role !== "Client" &&
      !formData.validation.IdentificationNumber
    ) {
      setError(
        "El número de identificación es requerido para el rol seleccionado"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
        roles: [formData.role],
        validationData: formData.validation,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message || "Error al registrar usuario. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">Regístrate en Polyclinic</p>
        </div>

        {/* Alert */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Rol
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          {formData.role !== "Client" && (
            <div>
              <label
                htmlFor="identification"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de Identificación
              </label>
              <input
                id="identification"
                name="IdentificationNumber"
                type="text"
                required
                value={formData.validation.IdentificationNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="Ingresa tu número de identificación"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Mínimo 6 caracteres"
            />
            <p className="text-xs text-gray-500 mt-1">
              Debe contener mayúsculas, minúsculas y números
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="Repite la contraseña"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-purple-600 font-medium hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
