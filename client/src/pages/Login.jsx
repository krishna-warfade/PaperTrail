import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, ArrowLeft, Sun, Moon } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);



  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative overflow-hidden transition-colors duration-200">
      
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Background Radial Glow (Only shown in dark mode) */}
      <div className="hidden dark:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="hidden dark:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      {/* Left Column: Forms */}
      <div className="w-full md:w-[45%] flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 bg-white dark:bg-slate-950 z-10 shadow-xl border-r border-slate-100 dark:border-slate-900">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/10">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-outfit text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Paper<span className="text-indigo-600 dark:text-indigo-400">Trail</span>
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          
            {/* Login Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 sm:px-10 rounded-xl shadow-md dark:shadow-2xl">
              <h2 className="text-2xl font-outfit font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                Welcome back!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
                Or{' '}
                <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-all">
                  create a new research account
                </Link>
              </p>

              {error && (
                <div className="mb-6 bg-red-100/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg flex items-start gap-3 text-xs animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>
                  <div className="mt-2 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                      placeholder="name@university.edu"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      state={{ email }}
                      className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="mt-2 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {submitting ? 'Authenticating...' : 'Sign In'}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
        </div>
      </div>

      {/* Right Column: Visual Info Panels */}
      <div className="hidden md:flex md:w-[55%] md:h-full bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950 items-center justify-center p-12 text-slate-900 dark:text-white relative">
        <div className="max-w-md space-y-6 z-10">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-indigo-50/80 dark:bg-white/10 text-indigo-650 dark:text-indigo-200 border border-indigo-100/50 dark:border-none">
              COLLABORATIVE RESEARCH WORKSPACE
            </span>
            <h1 className="font-outfit text-3xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
              Manage Research Papers & Team Collaboration Seamlessly
            </h1>
            <p className="text-slate-600 dark:text-indigo-100/90 text-xs leading-relaxed">
              PaperTrail brings students, guides, and leaders into one workspace to manage research, share papers, write notes, and track progress.
            </p>
          </div>

          {/* Illustrative Cards */}
          <div className="grid grid-cols-1 gap-3.5">
            <div className="p-3.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg flex items-start gap-3 shadow-sm dark:shadow-none backdrop-blur-md">
              <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Paper Repository</h4>
                <p className="text-[11px] text-slate-500 dark:text-indigo-200 mt-0.5">Upload, organize, and access research papers and references easily.</p>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg flex items-start gap-3 shadow-sm dark:shadow-none backdrop-blur-md">
              <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notes & Discussions</h4>
                <p className="text-[11px] text-slate-500 dark:text-indigo-200 mt-0.5">Share findings and collaborate with paper-specific notes and discussions.</p>
              </div>
            </div>

            <div className="p-3.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg flex items-start gap-3 shadow-sm dark:shadow-none backdrop-blur-md">
              <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Progress & Feedback</h4>
                <p className="text-[11px] text-slate-500 dark:text-indigo-200 mt-0.5">Track timeline progress and receive real-time guide feedback.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle decorative grid/dots overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] dark:opacity-5 pointer-events-none"></div>
      </div>
    </div>
  );
}
