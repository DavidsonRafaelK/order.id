"use client";

// =============================================================================
// src/components/ui/toast.tsx
// Toast notification system — context provider + UI components.
// Fixed: React import moved to top of file.
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 5000;
    setTimeout(() => removeToast(id), duration);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 150);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" aria-hidden />,
    error: <AlertCircle className="w-5 h-5 text-red-500" aria-hidden />,
    warning: <AlertCircle className="w-5 h-5 text-orange-500" aria-hidden />,
  };

  const styles = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-orange-50 border-orange-200",
  };

  return (
    <div
      role="alert"
      aria-atomic="true"
      className={`
        ${styles[toast.type]}
        border rounded-lg p-4 shadow-lg transition-all duration-150 ease-out
        ${isVisible
          ? "transform translate-x-0 opacity-100"
          : "transform translate-x-full opacity-0"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {icons[toast.type]}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900">{toast.title}</p>
          {toast.description && (
            <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          aria-label="Tutup notifikasi"
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
