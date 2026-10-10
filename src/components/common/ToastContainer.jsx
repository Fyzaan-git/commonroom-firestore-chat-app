import React from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-indigo-500 shrink-0" />}
              <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
