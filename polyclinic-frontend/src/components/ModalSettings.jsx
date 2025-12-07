import { 
    CircleUserRound,
    Users,
    Info
 } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { filterOptionsByPermission } from "../middleware/PermissionMiddleware";
import MyAccount  from "./MyAccount";
import { useState } from "react";

const settingsOptions = [
    {id:"account", name: "Mi Cuenta", icon: CircleUserRound },
    {id:"users", name: "Usuarios", icon: Users },
    {id:"about", name: "Acerca de", icon: Info },
];

const ModalSettings = ({ isOpen, onClose, onNavigateToModule }) => {
    const { user } = useAuth();
    const options = filterOptionsByPermission(settingsOptions, user?.roles || []);
    const [showMyAccount, setShowMyAccount] = useState(false);
    
    if (!isOpen) return null;
    
    return (
        <>
        {/* Overlay */}
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
        onClick={onClose}/>
    
        {/* Modal Content */}
        <div className='fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none'>
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
            {/*User Info*/}
            <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                
                {/* User Details */}
                <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">
                    {user?.email ? user.email.split('@')[0] : "Usuario"}
                </h2>
                
                {user?.phoneNumber && (
                    <p className="text-gray-600 mt-1">{user.phoneNumber}</p>
                )}
                </div>
            </div>
            </div>

            {/*Options Settings*/}
            <div className="p-4">
                {options.length > 0 ? (
                    options.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.id}
                                className="w-full flex items-center gap-4 p-4 hover:bg-gray-100 rounded-lg text-left transition-colors"
                                onClick={() => {
                                    if(option.id === "account") {
                                        setShowMyAccount(true);
                                    } else {
                                        // Notificar al Dashboard para cambiar el módulo
                                        if (onNavigateToModule) {
                                            onNavigateToModule(option.id);
                                        }
                                        onClose();
                                    }
                                }}
                            >
                                <Icon className="w-6 h-6 text-cyan-600" />
                                <span className="text-gray-800 font-medium">{option.name}</span>
                            </button>
                        );
                    })
                ) : (
                    <p className="text-gray-500 text-center py-4">No hay opciones disponibles</p>
                )}
            </div>

            {/* My Account Modal */}
            <MyAccount 
                isOpen={showMyAccount} 
                onClose={() => setShowMyAccount(false)} 
            />
        </div>
        </div>
        </>
        
    );
};

export default ModalSettings;