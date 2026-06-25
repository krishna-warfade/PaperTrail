import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, AlertCircle, CheckCircle, Loader, UserPlus, ArrowRight, Sun, Moon } from 'lucide-react';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user, apiFetch, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [processing, setProcessing] = useState(false);
  const [calledAccept, setCalledAccept] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!token) return;
    setStatus('verifying');
    try {
      const res = await fetch(`/api/invitations/verify/${token}`);
      const data = await res.json();
      if (res.ok) {
        if (data.registered) {
          navigate('/login', {
            state: {
              email: data.email,
              from: { pathname: `/accept-invite?token=${token}` }
            }
          });
        } else {
          navigate('/register', {
            state: {
              email: data.email,
              role: data.role,
              from: { pathname: `/accept-invite?token=${token}` }
            }
          });
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Invalid or expired invitation token.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Failed to connect to verification server.');
    }
  };

  const handleAccept = async () => {
    if (!token || !user) return;
    setProcessing(true);
    setStatus('processing');
    try {
      const res = await apiFetch('/api/invitations/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully joined the research workspace!');
        setTimeout(() => {
          navigate(`/`);
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to accept invitation.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Failed to accept the invitation.');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setStatus('error');
      setMessage('Invalid URL. No invitation token found.');
      return;
    }

    if (!user) {
      handleVerify();
      return;
    }

    if (!calledAccept) {
      setCalledAccept(true);
      handleAccept();
    }
  }, [user, authLoading, token, calledAccept]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-955 flex flex-col items-center justify-center text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Loader className="w-7 h-7 animate-spin text-indigo-600" />
        <p className="mt-4 font-outfit text-xs text-slate-500 dark:text-slate-400">Verifying login session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200 dot-grid">
      
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="hidden dark:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="hidden dark:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-650 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/10">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-outfit text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Paper<span className="text-indigo-600 dark:text-indigo-400">Trail</span>
          </span>
        </div>
        <h2 className="mt-6 text-center font-outfit text-3xl font-bold tracking-tight text-slate-905 dark:text-white">
          Workspace Invitation
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-indigo-500/10 py-8 px-6 sm:px-10 rounded-xl shadow-md dark:shadow-2xl text-center">
          {status === 'verifying' && (
            <div className="py-6 flex flex-col items-center">
              <Loader className="w-7 h-7 animate-spin text-indigo-605" />
              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Verifying invitation status...</p>
            </div>
          )}

          {status === 'processing' && (
            <div className="py-6 flex flex-col items-center">
              <Loader className="w-7 h-7 animate-spin text-indigo-605" />
              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Processing invitation & joining project...</p>
            </div>
          )}

          {status === 'not-logged-in' && (
            <div className="py-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-405 border border-indigo-500/20 mb-4">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="font-outfit text-md font-bold text-slate-800 dark:text-slate-200">Session Required</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed font-medium">
                You must login or register using the email address where you received the invitation.
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  to="/login"
                  state={{ from: { pathname: `/accept-invite?token=${token}` } }}
                  className="glow-button w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 rounded-lg text-sm font-semibold text-white transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Sign In to Accept
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  state={{ from: { pathname: `/accept-invite?token=${token}` } }}
                  className="w-full flex items-center justify-center py-3 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-305 hover:text-indigo-650 dark:hover:text-white transition-all cursor-pointer"
                >
                  Register Account
                </Link>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4 animate-scaleIn">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200 dark:border-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-outfit text-md font-bold text-slate-800 dark:text-slate-200">Welcome Aboard!</h3>
              <p className="text-emerald-650 dark:text-emerald-450 text-xs mt-2 font-medium">{message}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-4 font-semibold">Redirecting you to the project hub...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-4 animate-scaleIn">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-650 dark:text-red-400 mb-4">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-outfit text-md font-bold text-slate-800 dark:text-slate-200">Verification Failed</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed font-medium">{message}</p>

              {user && (
                <button
                  onClick={logout}
                  className="mt-6 w-full flex items-center justify-center py-2.5 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-950 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-650 dark:hover:text-white transition-all cursor-pointer"
                >
                  Sign Out of {user.email}
                </button>
              )}

              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-650 dark:text-slate-300 dark:hover:text-white underline decoration-slate-300 dark:decoration-slate-800 hover:decoration-indigo-605 dark:hover:decoration-white transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
