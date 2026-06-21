import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, LogOut, Folder, Users, BookOpen, AlertCircle, Loader, FolderOpen, User, Shield } from 'lucide-react';

export default function Dashboard() {
  const { user, logout, apiFetch } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

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
    fetchProjects();
  }, []);

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
      } else {
        setCreateError(data.message || 'Failed to create project');
      }
    } catch (err) {
      setCreateError('Network error. Try again.');
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'LEADER':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'FACULTY':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getUserWorkspaceRole = (project) => {
    if (project.leader._id === user?._id || project.leader === user?._id) return 'LEADER';
    if (project.faculty?._id === user?._id || project.faculty === user?._id) return 'FACULTY';
    return 'MEMBER';
  };

  const totalPapers = projects.reduce((sum, p) => sum + (p.paperCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden dot-grid">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      <header className="bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-600/10">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight text-white">
              Paper<span className="text-indigo-400">Trail</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">{user?.name}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user?.role}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {error && (
          <div className="mb-6 bg-red-950/20 border border-red-900/30 text-red-200 p-4 rounded-lg flex items-start gap-3 text-xs">
            <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-outfit text-3xl font-bold text-white tracking-tight">
              Research Workspace
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Collaboratively review publications, coordinate feedback, and organize project milestones.
            </p>
          </div>

          {user?.role === 'LEADER' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="glow-button flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shrink-0 cursor-pointer shadow-md shadow-indigo-600/10"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Projects</p>
              <h3 className="font-outfit text-2xl font-bold text-white mt-0.5">{projects.length}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Role</p>
              <h3 className="font-outfit text-xl font-bold text-white mt-0.5 capitalize">{user?.role?.toLowerCase()}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shared Documents</p>
              <h3 className="font-outfit text-2xl font-bold text-white mt-0.5">{totalPapers}</h3>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader className="w-7 h-7 animate-spin text-zinc-400" />
            <p className="mt-4 font-outfit text-xs text-zinc-500">Syncing research indexes...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800/80 p-10 sm:p-16 rounded-xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto shadow-xl">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="font-outfit text-lg font-bold text-slate-200">No active projects</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
              {user?.role === 'LEADER'
                ? 'Create a research project to begin adding collaborators and managing document archives.'
                : 'You are not assigned to any projects. Have your guide or lead scientist invite you.'}
            </p>
            {user?.role === 'LEADER' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="glow-button mt-6 inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <Plus className="w-4 h-4" />
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const projectRole = getUserWorkspaceRole(proj);
              return (
                <div
                  key={proj._id}
                  onClick={() => navigate(`/project/${proj._id}`)}
                  className="flat-card p-6 rounded-lg cursor-pointer flex flex-col justify-between transition-all duration-150 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${getRoleBadgeColor(projectRole)}`}>
                        {projectRole}
                      </span>
                      {proj.faculty && (
                        <span className="text-[9px] text-slate-350 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          Guide: {proj.faculty.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-outfit text-md font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mt-2 line-clamp-3">
                      {proj.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Lead: {proj.leader.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      {proj.paperCount || 0} Paper(s)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-955/80 backdrop-blur-xs"
            onClick={() => !creating && setIsModalOpen(false)}
          ></div>

          <div className="bg-slate-900 border border-indigo-500/10 w-full max-w-md p-6 rounded-xl shadow-2xl relative z-10">
            <h3 className="font-outfit text-lg font-bold text-white mb-1">
              Create Research Project
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Establish a central hub for files, notes, and progress.
            </p>

            {createError && (
              <div className="mb-4 bg-red-950/20 border border-red-900/30 text-red-200 p-3 rounded-lg flex items-start gap-2.5 text-xs animate-fadeIn">
                <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  placeholder="e.g. LLM Reasoning Paradigms"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Project Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  placeholder="Summarize the core hypothesis, guidelines, and objectives..."
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="glow-button px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
