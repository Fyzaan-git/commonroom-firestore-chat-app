import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="text-center max-w-sm">
        <div className="text-5xl font-black text-indigo-600 mb-2">404</div>
        <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          The requested channel, conversation, or page does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Workspace</span>
        </Link>
      </div>
    </div>
  );
}
