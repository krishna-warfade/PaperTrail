import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield, Folder, FolderOpen, Plus, Sun, Moon, LogOut,
  AlertCircle, X, ShieldAlert, Menu
} from 'lucide-react';

export default function PortalLayout() {
  const { user, logout, apiFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { id: activeProjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    return localStorage.getItem('sidebar-expanded') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', isSidebarExpanded);
  }, [isSidebarExpanded]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const fetchProjects = async () => {
    try {
      const res = await apiFetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to fetch projects');
      }
    } catch (err) {
      setError('Connection failed. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await apiFetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });
      const data = await res.json();
      if (res.ok) {
        setProjects([data, ...projects]);
        setIsModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        navigate(`/project/${data._id}`);
      } else {
        setCreateError(data.message || 'Failed to create project');
      }
    } catch (err) {
      setCreateError('Network error. Try again.');
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const sidebarContent = (isExpanded) => (
    <>
      <div className={`flex items-center ${isExpanded ? 'justify-between px-4' : 'justify-center px-2'} py-5 border-b border-slate-101 dark:border-slate-800/60 shrink-0 overflow-hidden`}>
        {isExpanded ? (
          <>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-650 dark:bg-indigo-650 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/15 shrink-0">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-outfit text-xl font-bold tracking-tight text-slate-905 dark:text-white whitespace-nowrap">
                Paper<span className="text-indigo-650 dark:text-indigo-400">Trail</span>
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarExpanded(false)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
              title="Collapse Sidebar"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsSidebarExpanded(true)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer shrink-0"
            title="Expand Sidebar"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto flex flex-col pt-4 overflow-hidden">

        {isExpanded && (
          <div className="flex items-center justify-between px-4 mb-2 shrink-0">
            <span className="font-outfit text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
              My Projects
            </span>
            {user?.role === 'LEADER' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 rounded transition-colors cursor-pointer shrink-0"
                title="Create New Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className={`px-5 py-4 flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-2 text-xs text-slate-400`}>
            <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-indigo-600 animate-spin shrink-0"></div>
            {isExpanded && <span className="whitespace-nowrap">Loading...</span>}
          </div>
        ) : error ? (
          <div className={`px-5 py-3 text-[10px] text-red-550 bg-red-50 dark:bg-red-955/20 border-y border-red-100 dark:border-red-900/30 flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-1.5 overflow-hidden`}>
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            {isExpanded && <span className="truncate">{error}</span>}
          </div>
        ) : projects.length === 0 ? (
          isExpanded && (
            <div className="px-5 py-4 text-xs text-slate-455 italic whitespace-nowrap">
              No projects.
            </div>
          )
        ) : (
          <nav className="px-2 space-y-1.5 overflow-y-auto">
            {projects.map((project) => {
              const isActive = activeProjectId === project._id;
              return (
                <NavLink
                  key={project._id}
                  to={`/project/${project._id}`}
                  title={!isExpanded ? project.title : undefined}
                  className={({ isActive }) => `
                    flex items-center ${isExpanded ? 'justify-between w-full h-auto py-2 px-3.5 mx-0' : 'justify-center w-8 h-8 p-0 mx-auto'} rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer overflow-hidden
                    ${isActive
                      ? `bg-indigo-50 dark:bg-indigo-955/40 text-indigo-600 dark:text-indigo-400 ${isExpanded ? 'border-l-2' : ''} border-indigo-600 dark:border-indigo-400`
                      : `text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850/50 hover:text-slate-900 dark:hover:text-white ${isExpanded ? 'border-l-2' : ''} border-transparent`
                    }
                  `}
                >
                  <div className={`flex items-center ${isExpanded ? 'justify-start gap-2.5' : 'justify-center gap-0'} min-w-0 flex-1`}>
                    {isActive ? (
                      <FolderOpen className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Folder className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
                    )}
                    {isExpanded && <span className="whitespace-normal break-words flex-1 text-left">{project.title}</span>}
                  </div>
                  {isExpanded && project.paperCount > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ml-2 ${isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/45 text-indigo-700 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-805 text-slate-500'
                      }`}>
                      {project.paperCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>

      <div className={`p-2 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shrink-0 space-y-3 overflow-hidden flex flex-col ${isExpanded ? 'items-stretch' : 'items-center'}`}>

        <div className={`flex items-center ${isExpanded ? 'justify-between p-2 bg-white dark:bg-slate-955 border-slate-200 dark:border-slate-805 shadow-sm' : 'justify-center p-0 bg-transparent border-transparent shadow-none'} rounded-lg border overflow-hidden transition-all duration-200 ${isExpanded ? 'w-full' : 'w-8'}`}>
          {isExpanded && (
            <span className="text-[11px] font-bold text-slate-605 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-805 text-slate-700 dark:text-slate-350 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-indigo-400" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className={`flex flex-col gap-2 ${isExpanded ? 'p-2 bg-white dark:bg-slate-955 border-slate-205 dark:border-slate-805 shadow-sm items-stretch w-full' : 'p-0 bg-transparent border-transparent shadow-none items-center w-8'} rounded-lg border overflow-hidden transition-all duration-200`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-xs shadow-inner shrink-0" title={`${user?.name} (${user?.role})`}>
              {getInitials(user?.name)}
            </div>
            {isExpanded && (
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-855 dark:text-white truncate whitespace-nowrap">{user?.name}</p>
                <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-655 dark:text-indigo-450 border border-indigo-500/10 mt-0.5 inline-block whitespace-nowrap">
                  {user?.role}
                </span>
              </div>
            )}
          </div>

          {isExpanded && (
            <button
              onClick={logout}
              className="w-full mt-1 py-1.5 px-1 bg-slate-50 hover:bg-red-500/5 dark:bg-slate-900 dark:hover:bg-red-955/20 text-slate-500 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 border border-slate-205 dark:border-slate-800 hover:border-red-200/50 dark:hover:border-red-900/40 rounded flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap overflow-hidden"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-955 overflow-hidden transition-colors duration-200">

      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 -ml-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-650 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/15">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-outfit text-lg font-bold tracking-tight text-slate-905 dark:text-white">
            Paper<span className="text-indigo-650 dark:text-indigo-400">Trail</span>
          </span>
        </Link>

        <div className="w-9" />
      </div>

      <div
        className={`md:hidden fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs z-40 transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full z-50 shadow-2xl transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="absolute top-4 right-3 p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer z-10"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>

        {sidebarContent(true)}
      </aside>

      <aside className={`hidden md:flex ${isSidebarExpanded ? 'w-64' : 'w-16'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between h-full shrink-0 transition-all duration-300 ease-in-out z-30 fixed left-0 top-0 shadow-md`}>
        {sidebarContent(isSidebarExpanded)}
      </aside>

      <div className={`flex-1 pl-0 ${isSidebarExpanded ? 'md:pl-64' : 'md:pl-16'} h-full overflow-y-auto flex flex-col relative transition-all duration-300`}>
        <Outlet context={{ projects, setProjects, fetchProjects, loading, error }} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-955/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Create New Project
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewTitle('');
                  setNewDesc('');
                  setCreateError('');
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-450 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-lg flex items-start gap-2.5 text-xs animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-905 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-semibold"
                  placeholder="e.g. NLP Academic Research Hub"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-lg text-slate-905 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-semibold resize-none"
                  placeholder="Summarise key research goals and milestones..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewTitle('');
                    setNewDesc('');
                    setCreateError('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 rounded-lg shadow disabled:opacity-50 transition-all cursor-pointer"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
