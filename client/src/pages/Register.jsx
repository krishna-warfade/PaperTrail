import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, ArrowRight, AlertCircle, BookOpen, Users, Award } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(location.state?.role || 'MEMBER');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // redirect authenticated users to the dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/');
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden dot-grid">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="flex justify-center items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-650 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/10">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-outfit text-2xl font-bold tracking-tight text-white">
            Paper<span className="text-indigo-400">Trail</span>
          </span>
        </div>
        <h2 className="mt-6 text-center font-outfit text-3xl font-bold tracking-tight text-white">
          Create research account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-medium">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900 border border-indigo-500/10 py-8 px-6 sm:px-10 rounded-xl shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-955/20 border border-red-900/30 text-red-200 p-4 rounded-lg flex items-start gap-3 text-xs animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <div className="mt-2 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                    placeholder="Dr. Sarah Connor"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="mt-2 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="mt-2 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Choose Workspace Role
              </span>
              {location.state?.role ? (
                <div className="p-4 bg-slate-955 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">Invited Role Locked</p>
                    <p className="text-slate-400 mt-0.5">
                      You are registering as a <span className="text-indigo-400 font-bold uppercase">{location.state.role.toLowerCase()}</span>.
                    </p>
                  </div>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase px-2.5 py-1 rounded">
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
                        className={`text-left p-3.5 rounded-lg border flex flex-col justify-between transition-all group cursor-pointer ${isSelected
                          ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20 text-white'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/80 hover:border-slate-700/60'
                          }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-550 group-hover:text-slate-400'}`} />
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-400' : 'border-slate-700'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-400"></div>}
                          </div>
                        </div>
                        <div>
                          <h4 className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {r.title}
                          </h4>
                          <p className="text-[10px] leading-snug text-slate-400 mt-0.5">
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
              className="glow-button w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-indigo-650/10"
            >
              {submitting ? 'Creating Account...' : 'Register and Join'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
