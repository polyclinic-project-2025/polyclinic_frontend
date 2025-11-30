import { 
    Phone,
    IdCard,
    Mail,
    SquarePen,
    Check,
    X,
    Plus,
 } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { roleTranslations } from "../pages/Dashboard";
import { userService } from "../services/userService";
import { useState } from 'react';
import Alert from './Alert';

const MyAccount = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState(user?.email || "");
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState(user?.phoneNumber || "");
    const [isEditingRoles, setIsEditingRoles] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");
    const [alert, setAlert] = useState(null); // Estado para manejar alerts

    const availableRoles = ["Admin", "Doctor", "Nurse", "MedicalStaff", "Patient"];

    const handleCloseAlert = () => {
        setAlert(null);
    };

    const handleSaveEmail = async () => {
        try {
            await userService.patch(user.id, {
                property: "Email",
                value: newEmail,
                operation: "replace"
            });
            setIsEditingEmail(false);
            updateUser({ email: newEmail });
            setAlert({
                type: 'success',
                message: 'Email actualizado correctamente'
            });
        } catch (error) {
            console.error("Error al actualizar email:", error);
            const errorMessage = error.message || 'Error al actualizar email';
            setAlert({
                type: 'error',
                message: errorMessage
            });
        }
    };

    const handleSavePhone = async () => {
        try {
            console.log("Actualizando teléfono a:", user.id);
            await userService.patch(user.id, {
                property: "PhoneNumber",
                value: newPhone,
                operation: "replace"
            });
            setIsEditingPhone(false);
            updateUser({phoneNumber: newPhone});
            setAlert({
                type: 'success',
                message: 'Teléfono actualizado correctamente'
            });
        } catch (error) {
            console.error("Error al actualizar teléfono:", error);
            console.error("Detalles:", error.response)
            const errorMessage = error.message || 'Error al actualizar teléfono';
            setAlert({
                type: 'error',
                message: errorMessage
            });
        }
    };

    const handleAddRole = async () => {
        if (!selectedRole) {
            setAlert({
                type: 'warning',
                message: 'Por favor, selecciona un rol'
            });
            return;
        }
        
        try {
            await userService.patch(user.id, {
                property: "Roles",
                operation: "add",
                roles: [selectedRole]
            });
            setIsEditingRoles(false);
            setSelectedRole("");
            updateUser({ roles: [...user.roles, selectedRole] });
            setAlert({
                type: 'success',
                message: `Rol ${roleTranslations[selectedRole] || selectedRole} agregado correctamente`
            });
        } catch (error) {
            console.error("Error al agregar rol:", error);
            const errorMessage = error.message || 'Error al agregar rol';
            setAlert({
                type: 'error',
                message: errorMessage
            });
        }
    };

    if (!isOpen) return null;
    
    return (
        <>
        <div className='fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none'>
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="p-8">
            {/* Alert Component */}
            {alert && (
                <div className="mb-4">
                    <Alert 
                        type={alert.type} 
                        message={alert.message} 
                        onClose={handleCloseAlert}
                    />
                </div>
            )}

            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-cyan-700 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4">
                {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {user?.email ? user.email.split('@')[0] : "Usuario"}
                </h2>

                {/* Roles con botón para agregar */}
                {user?.roles && user.roles.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center items-center">
                    {user.roles.map((role) => (
                    <span
                        key={role}
                        className="px-4 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium"
                    >
                        {roleTranslations[role] || role}
                    </span>
                    ))}
                    {!isEditingRoles && (
                        <button
                            onClick={() => setIsEditingRoles(true)}
                            className="p-1.5 hover:bg-cyan-50 rounded-full transition"
                        >
                            <Plus className="w-5 h-5 text-cyan-600"/>
                        </button>
                    )}
                </div>
                )}

                {/* Selector de rol */}
                {isEditingRoles && (
                    <div className="flex items-center gap-2 mt-2">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-1.5 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Seleccionar rol</option>
                            {availableRoles.filter(r => !user.roles.includes(r)).map(role => (
                                <option key={role} value={role}>{roleTranslations[role] || role}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddRole}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                            <Check className="w-5 h-5"/>
                        </button>
                        <button
                            onClick={() => {
                                setIsEditingRoles(false);
                                setSelectedRole("");
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4 max-w-md mx-auto border-t border-gray-200 pt-6">
                
                {/* Teléfono */}
                <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-cyan-600 flex-shrink-0"/>
                    
                    {isEditingPhone ? (
                    <div className="flex items-center gap-2 flex-1">
                        <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Nuevo teléfono"
                        autoFocus
                        />
                        <button
                        onClick={handleSavePhone}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                        <Check className="w-5 h-5"/>
                        </button>
                        <button
                        onClick={() => {
                            setNewPhone(user.phoneNumber || "");
                            setIsEditingPhone(false);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                        <X className="w-5 h-5"/>
                        </button>
                    </div>
                    ) : (
                    <>
                        <span className="text-base flex-1">{user?.phoneNumber || "Sin teléfono"}</span>
                        <button 
                        onClick={() => {
                            setNewPhone(user?.phoneNumber || "");
                            setIsEditingPhone(true);
                        }}
                        className="hover:scale-110 transition-transform"
                        >
                        {user?.phoneNumber ? <SquarePen className="w-4 h-4 text-cyan-600"/> : <Plus className="w-4 h-4 text-cyan-600"/>}
                        </button>
                    </>
                    )}
                </div>

                {/* Email */}
                {user?.email && (
                <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-5 h-5 text-cyan-600 flex-shrink-0"/>
                    
                    {isEditingEmail ? (
                    <div className="flex items-center gap-2 flex-1">
                        <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-cyan-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Nuevo email"
                        autoFocus
                        />
                        <button
                        onClick={handleSaveEmail}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                        <Check className="w-5 h-5"/>
                        </button>
                        <button
                        onClick={() => {
                            setNewEmail(user.email);
                            setIsEditingEmail(false);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                        <X className="w-5 h-5"/>
                        </button>
                    </div>
                    ) : (
                    <>
                        <span className="text-base flex-1">{user.email}</span>
                        <button 
                        onClick={() => {
                            setNewEmail(user.email);
                            setIsEditingEmail(true);
                        }}
                        className="hover:scale-110 transition-transform"
                        >
                        <SquarePen className="w-4 h-4 text-cyan-600"/>
                        </button>
                    </>
                    )}
                </div>
                )}

                {/* Identification */}
                {user?.identification && (
                <div className="flex items-center gap-3 text-gray-700">
                    <IdCard className="w-5 h-5 text-cyan-600 flex-shrink-0"/>
                    <span className="text-base">{user.identification}</span>
                </div>
                )}
            </div>
            </div>
        </div>
        </div>
        </>
    );
};

export default MyAccount;