import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Shield, Mail, Lock, CheckCircle, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  // Get email/token from URL search parameters (if clicked from email link)
  const urlEmail = searchParams.get('email') || '';
  const urlToken = searchParams.get('token') || '';

  // Get email/message/devToken from route state (if redirected from ForgotPassword page)
  const stateEmail = location.state?.email || '';
  const stateMessage = location.state?.message || '';
  const stateDevToken = location.state?.devToken || '';

  const [email, setEmail] = useState(urlEmail || stateEmail);
  const [token, setToken] = useState(urlToken || stateDevToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState({ 
    type: stateMessage ? 'success' : '', 
    text: stateMessage || '' 
  });
  const [submitting, setSubmitting] = useState(false);

  // If search parameters change, keep state sync
  useEffect(() => {
    if (urlEmail) setEmail(urlEmail);
    if (urlToken) setToken(urlToken);
  }, [urlEmail, urlToken]);

  // If there's a bypass token in the search parameters or state, show it
  useEffect(() => {
    const queryDevToken = searchParams.get('devToken');
    if (queryDevToken) {
      setToken(queryDevToken);
      setMessage({
        type: 'success',
        text: `A 6-digit verification code was generated. (Bypass PIN: ${queryDevToken})`
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        alert('Password reset successfully! You can now sign in with your new password.');
        navigate('/login', { state: { email } });
      } else {
        setMessage({ type: 'error', text: data.message || 'Verification failed. Make sure the code is correct.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network connection failure. Try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const isFromEmailLink = !!urlEmail && !!urlToken;

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-slate-50 dark:bg-slate-955 flex flex-col md:flex-row relative overflow-hidden transition-colors duration-200">
      
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Background Radial Glow */}
      <div className="hidden dark:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="hidden dark:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      {/* Left Column: Form */}
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

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 sm:px-10 rounded-xl shadow-md dark:shadow-2xl">
            <Link
              to="/forgot-password"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-semibold mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Request PIN
            </Link>

            <h2 className="text-2xl font-outfit font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Reset Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
              {isFromEmailLink 
                ? 'Your email and reset link have been verified. Set your new password below.'
                : 'Enter your email, the 6-digit PIN sent to you, and your new credentials.'}
            </p>

            {message.text && (
              <div className={`mb-5 p-4 rounded-lg border text-xs flex items-start gap-3 animate-fadeIn ${
                message.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isFromEmailLink && (
                <>
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
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pin" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      6-Digit PIN Code
                    </label>
                    <input
                      id="pin"
                      type="text"
                      required
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="mt-2 block w-full px-3 py-3 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-bold tracking-widest"
                      placeholder="000000"
                      autoComplete="one-time-code"
                    />
                  </div>
                </>
              )}

              {isFromEmailLink && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <div>
                    <span className="font-bold text-slate-500">Email:</span> {email}
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Reset Code:</span> {token}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="newPassword" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Password
                </label>
                <div className="mt-2 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirm New Password
                </label>
                <div className="mt-2 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
              >
                {submitting ? 'Updating Password...' : 'Verify and Save Password'}
                {!submitting && <CheckCircle className="w-4.5 h-4.5" />}
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
              Manage Projects & Collaborate
            </h1>
            <p className="text-slate-600 dark:text-indigo-100/90 text-xs leading-relaxed">
              PaperTrail brings students, guides, and leaders into one workspace to manage projects, share papers, write notes, and track progress.
            </p>
          </div>

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
        
        <div className="absolute inset-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] dark:opacity-5 pointer-events-none"></div>
      </div>
    </div>
  );
}
