import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Mail, Lock, User, ArrowRight, AlertCircle, BookOpen, Users, Award, Sun, Moon } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(location.state?.role || 'MEMBER');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // redirect authenticated users to the dashboard
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
      await register(name, email, password, role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const roles = [
    {
      id: 'LEADER',
      title: 'Project Leader',
      desc: 'Create projects, manage milestones, invite researchers & guides.',
      icon: Users,
    },
    {
      id: 'MEMBER',
      title: 'Team Member',
      desc: 'Upload papers, annotate documents, log daily progress.',
      icon: BookOpen,
    },
    {
      id: 'FACULTY',
      title: 'Faculty Guide',
      desc: 'Review logs, provide academic suggestions, add feedback.',
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 dark:bg-slate-955 flex flex-col md:flex-row relative overflow-hidden transition-colors duration-200">
      
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

      {/* Radial Glow (Dark Mode Only) */}
      <div className="hidden dark:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="hidden dark:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      {/* Left Column: Form */}
      <div className="w-full md:w-[50%] flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 bg-white dark:bg-slate-950 z-10 shadow-xl border-r border-slate-100 dark:border-slate-900 overflow-y-auto">
        
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-650 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/10">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-outfit text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Paper<span className="text-indigo-600 dark:text-indigo-400">Trail</span>
            </span>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 sm:px-10 rounded-xl shadow-md dark:shadow-2xl">
            
            <h2 className="text-2xl font-outfit font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Create research account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-all">
                Sign in to your account
              </Link>
            </p>

            {error && (
              <div className="mb-6 bg-red-100/50 dark:bg-red-905/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg flex items-start gap-3 text-xs animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Full Name
                  </label>
                  <div className="mt-2 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-450 dark:text-slate-550" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                      placeholder="Dr. Sarah Connor"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>
                  <div className="mt-2 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-455 dark:text-slate-555" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!!location.state?.email}
                      className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                        location.state?.email
                          ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-75'
                          : 'bg-white dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600'
                      }`}
                      placeholder="name@university.edu"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <div className="mt-2 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-455 dark:text-slate-555" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Choose Workspace Role
                </span>
                {location.state?.role ? (
                  <div className="p-4 bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Invited Role Locked</p>
                      <p className="text-slate-550 dark:text-slate-400 mt-0.5">
                        You are registering as a <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{location.state.role.toLowerCase()}</span>.
                      </p>
                    </div>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 font-bold uppercase px-2.5 py-1 rounded">
                      {location.state.role}
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      const isSelected = role === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`text-left p-3.5 rounded-lg border flex flex-col justify-between transition-all group cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white'
                              : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700/60'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-550 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`} />
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-650 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-700'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-605 dark:bg-indigo-400"></div>}
                            </div>
                          </div>
                          <div>
                            <h4 className={`text-xs font-semibold ${isSelected ? 'text-indigo-650 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {r.title}
                            </h4>
                            <p className="text-[9px] leading-snug text-slate-400 dark:text-slate-500 mt-0.5">
                              {r.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="glow-button w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-indigo-650/10"
              >
                {submitting ? 'Creating Account...' : 'Register and Join'}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column: Visual Info Panel */}
      <div className="hidden md:flex md:w-[50%] md:h-full bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950 items-center justify-center p-12 text-slate-900 dark:text-white relative">
        <div className="max-w-md space-y-8 z-10">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-indigo-50/80 dark:bg-white/10 text-indigo-650 dark:text-indigo-200 border border-indigo-100/50 dark:border-none">
              JOIN THE NETWORK
            </span>
            <h1 className="font-outfit text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
              Embark on Structured Collaboration
            </h1>
            <p className="text-slate-650 dark:text-indigo-100 text-sm leading-relaxed">
              PaperTrail simplifies literature reviews. Connect with faculty guides, track daily milestones, and store research papers securely.
            </p>
          </div>

          <div className="border border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 rounded-xl p-6 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
            <h3 className="font-outfit text-md font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              Role-Based Workspace
            </h3>
            <p className="text-xs text-slate-500 dark:text-indigo-100 leading-relaxed">
              Different account roles ensure optimal workflow visibility. Project leaders govern membership and milestones, members annotate documents and log progress, and faculty guides review academic logs and coordinates feedback.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] dark:opacity-5 pointer-events-none"></div>
      </div>
    </div>
  );
}
