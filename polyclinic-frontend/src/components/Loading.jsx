// components/Loading.jsx
import React from 'react';
import { Activity } from 'lucide-react';

const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Activity className="w-12 h-12 text-indigo-600 animate-pulse mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loading;