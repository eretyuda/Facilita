import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-teal-50 dark:bg-teal-900/30',
      border: 'border-teal-200 dark:border-teal-800',
      text: 'text-teal-800 dark:text-teal-200',
      icon: <CheckCircle className="text-teal-500" size={20} />
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: <XCircle className="text-red-500" size={20} />
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: <AlertTriangle className="text-yellow-500" size={20} />
    }
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-[slideDown_0.3s_ease-out]">
      <div className={`${currentStyle.bg} ${currentStyle.border} border px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 relative`}>
        <div className="shrink-0">
          {currentStyle.icon}
        </div>
        <p className={`text-sm font-medium ${currentStyle.text} pr-6`}>
          {message}
        </p>
        <button 
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
        >
          <X size={14} className={currentStyle.text} />
        </button>
      </div>
    </div>
  );
};