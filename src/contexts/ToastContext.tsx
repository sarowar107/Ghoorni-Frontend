import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const isSuccess = toast.type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        min-w-80 max-w-md p-4 rounded-lg shadow-lg backdrop-blur-sm border
        ${isSuccess 
          ? 'bg-green-50/90 dark:bg-green-900/30 border-green-200 dark:border-green-500/30' 
          : 'bg-red-50/90 dark:bg-red-900/30 border-red-200 dark:border-red-500/30'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${
            isSuccess 
              ? 'text-green-800 dark:text-green-300' 
              : 'text-red-800 dark:text-red-300'
          }`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className={`mt-1 text-sm ${
              isSuccess 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-red-700 dark:text-red-400'
            }`}>
              {toast.message}
            </p>
          )}
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className={`flex-shrink-0 p-1 rounded-full hover:bg-opacity-20 transition-colors ${
            isSuccess 
              ? 'hover:bg-green-600 text-green-600 dark:text-green-400' 
              : 'hover:bg-red-600 text-red-600 dark:text-red-400'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
