import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Folder, Users, BookOpen, AlertCircle, Loader, FolderOpen, User } from 'lucide-react';

export default function Dashboard() {
  const { user, apiFetch } = useAuth();
  const { projects, setProjects, loading, error } = useOutletContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

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
        return 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border-indigo-500/20';
      case 'FACULTY':
        return 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  const getUserWorkspaceRole = (project) => {
    if (project.leader._id === user?._id || project.leader === user?._id) return 'LEADER';
    if (project.faculty?._id === user?._id || project.faculty === user?._id) return 'FACULTY';
    return 'MEMBER';
  };

  const totalPapers = projects.reduce((sum, p) => sum + (p.paperCount || 0), 0);

  const uniqueCollaborators = projects.reduce((acc, p) => {
    if (p.members) p.members.forEach(m => acc.add(m.toString()));
    const leaderId = p.leader?._id || p.leader;
    if (leaderId) acc.add(leaderId.toString());
    const facultyId = p.faculty?._id || p.faculty;
    if (facultyId) acc.add(facultyId.toString());
    return acc;
  }, new Set());
  if (user?._id) uniqueCollaborators.delete(user._id.toString());
  const totalCollaborators = uniqueCollaborators.size;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 dot-grid overflow-y-auto">
      
      {/* Background Radial Glows (only in dark mode) */}
      <div className="hidden dark:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="hidden dark:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      {error && (
        <div className="mb-6 bg-red-100/50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg flex items-start gap-3 text-xs">
          <AlertCircle className="w-4.5 h-4.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Research Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Collaboratively review publications, coordinate feedback, and organize project milestones.
          </p>
        </div>

        {user?.role === 'LEADER' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="glow-button flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-755 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all shrink-0 cursor-pointer shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Projects</p>
              <h3 className="font-outfit text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{projects.length}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-650 dark:text-violet-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Collaborators</p>
              <h3 className="font-outfit text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalCollaborators}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-lg flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shared Documents</p>
              <h3 className="font-outfit text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalPapers}</h3>
            </div>
          </div>
        </div>

        {/* Projects / Empty State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader className="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-4 font-outfit text-xs text-slate-500 dark:text-slate-400">Syncing research indexes...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-10 sm:p-16 rounded-xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto shadow-sm dark:shadow-xl">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">No active projects</h3>
            <p className="text-slate-550 dark:text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
              {user?.role === 'LEADER'
                ? 'Create a research project to begin adding collaborators and managing document archives.'
                : 'You are not assigned to any projects. Have your guide or lead scientist invite you.'}
            </p>
            {user?.role === 'LEADER' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="glow-button mt-6 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-600/10"
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
                  className="bg-white/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md p-6 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-lg dark:hover:shadow-2xl hover:border-indigo-500/30 dark:hover:border-slate-700/60 transition-all duration-200 relative group cursor-pointer text-left h-full"
                >
                  <div className="flex-grow">
                    {/* Top Row: Title in a green badge + Status/Role on the right */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4.5">
                      <div className="bg-emerald-500/10 border border-emerald-500/25 dark:border-emerald-500/35 px-3.5 py-2 rounded-xl text-emerald-650 dark:text-emerald-400 text-sm md:text-base font-medium font-outfit whitespace-normal break-words leading-snug w-fit" title={proj.title}>
                        {proj.title}
                      </div>
                      <span className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shrink-0 w-fit">
                        {projectRole}
                      </span>
                    </div>

                    {/* Middle Row: Description */}
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed line-clamp-3 font-medium mb-6">
                      {proj.description}
                    </p>
                  </div>

                  {/* Bottom Metadata */}
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 mt-auto pt-4 border-t border-slate-200/60 dark:border-slate-800/50">
                    <div className="flex items-center justify-between font-bold">
                      <span>v1.0 · {new Date(proj.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {proj.faculty && (
                        <span className="font-medium text-slate-500 dark:text-slate-400">Guide: {proj.faculty.name}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-slate-655 dark:text-slate-350 pt-1 font-semibold">
                      <span>Published by {proj.leader.name}</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-500" />
                        {proj.paperCount || 0} Paper(s)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 dark:bg-slate-955/80 backdrop-blur-xs"
            onClick={() => !creating && setIsModalOpen(false)}
          ></div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/10 w-full max-w-md p-6 rounded-xl shadow-2xl relative z-10">
            <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-1">
              Create Research Project
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Establish a central hub for files, notes, and progress.
            </p>

            {createError && (
              <div className="mb-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-200 p-3 rounded-lg flex items-start gap-2.5 text-xs animate-fadeIn">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  placeholder="e.g. LLM Reasoning Paradigms"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Project Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  placeholder="Outline the scopes, research goals, and methods..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="glow-button px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  {creating ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
