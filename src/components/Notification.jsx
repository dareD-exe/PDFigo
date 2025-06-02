import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90';
  const iconColor = type === 'success' ? 'text-green-100' : 'text-red-100';
  const IconComponent = type === 'success' ? FiCheckCircle : FiAlertTriangle;

  return (
    <div 
      className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-xl text-white ${bgColor} backdrop-blur-sm border ${type === 'success' ? 'border-green-600' : 'border-red-600'} flex items-center max-w-sm animate-slide-in-right`}
      role="alert"
    >
      <IconComponent className={`h-6 w-6 mr-3 ${iconColor}`} />
      <span className="flex-grow text-sm font-medium">{message}</span>
      <button 
        onClick={onClose} 
        className={`ml-4 -mr-1 p-1 rounded-full hover:bg-white/20 transition-colors ${iconColor}`}
        aria-label="Close"
      >
        <FiX className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Notification;