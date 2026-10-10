import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      await login(email, password);
      addToast('Welcome back!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    try {
      setLoading(true);
      await login(demoEmail, 'demo');
      addToast('Signed in with demo team account', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 rounded-xl bg-indigo-600 text-white items-center justify-center font-black text-sm mb-3 shadow-sm">
            CR
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sign in to CommonRoom
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Full-stack team messaging and workspace collaboration
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
            Quick Demo Sign-In
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('alex.mercer@commonroom.io')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Alex Mercer</div>
              <div className="text-[10px] text-slate-400 truncate">Platform Lead</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('sarah.chen@commonroom.io')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-colors"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Sarah Chen</div>
              <div className="text-[10px] text-slate-400 truncate">Product Designer</div>
            </button>
          </div>
        </div>

        {/* Registration Link */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
