import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, BookOpen, Users, MessageSquare, Plus, Trash2,
  ExternalLink, MessageCircle, FileText, Search, Filter,
  UserPlus, Send, Loader, AlertCircle, CheckCircle,
  Edit2, X, PlusCircle, Sparkles
} from 'lucide-react';

export default function ProjectWorkspace() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user, apiFetch } = useAuth();

  const [project, setProject] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState({ type: '', text: '' });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthors, setUploadAuthors] = useState('');
  const [uploadYear, setUploadYear] = useState('');
  const [uploadKeywords, setUploadKeywords] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPaper, setSelectedPaper] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');


  const fetchData = async () => {
    try {
      const projRes = await apiFetch(`/api/projects/${projectId}`);
      if (!projRes.ok) {
        const data = await projRes.json();
        throw new Error(data.message || 'Failed to fetch project');
      }
      const projData = await projRes.json();
      setProject(projData);

      const papersRes = await apiFetch(`/api/papers/project/${projectId}`);
      if (papersRes.ok) {
        const papersData = await papersRes.json();
        setPapers(papersData);
      }
    } catch (err) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMessage({ type: '', text: '' });
    try {
      const res = await apiFetch('/api/invitations', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, projectId, role: inviteRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteMessage({ type: 'success', text: 'Invitation email dispatched successfully!' });
        setInviteEmail('');
      } else {
        setInviteMessage({ type: 'error', text: data.message || 'Invitation failed' });
      }
    } catch (err) {
      setInviteMessage({ type: 'error', text: 'Failed to connect to the invitation service.' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUploadPaper = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a PDF file first.');
      return;
    }
    setUploadLoading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('authors', uploadAuthors);
    formData.append('year', uploadYear);
    formData.append('keywords', uploadKeywords);
    formData.append('projectId', projectId);
    formData.append('pdf', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/papers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setPapers([data, ...papers]);
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadAuthors('');
        setUploadYear('');
        setUploadKeywords('');
        setSelectedFile(null);
      } else {
        setUploadError(data.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError('Network error uploading paper.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeletePaper = async (paperId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this research paper?')) return;
    try {
      const res = await apiFetch(`/api/papers/${paperId}`, { method: 'DELETE' });
      if (res.ok) {
        setPapers(papers.filter(p => p._id !== paperId));
        if (selectedPaper?._id === paperId) setSelectedPaper(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete paper');
      }
    } catch (err) {
      alert('Delete operation failed.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) return;
    try {
      const res = await apiFetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProject({
          ...project,
          members: project.members.filter(m => m._id !== memberId)
        });
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to remove member');
      }
    } catch (err) {
      alert('Network error. Failed to remove member.');
    }
  };

  const handleOpenNotes = async (paper) => {
    setSelectedPaper(paper);
    setNotesLoading(true);
    setEditingNoteId(null);
    try {
      const res = await apiFetch(`/api/notes/paper/${paper._id}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    try {
      const res = await apiFetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ paperId: selectedPaper._id, content: newNoteContent }),
      });
      const data = await res.json();
      if (res.ok) {
        const populatedNote = {
          ...data,
          authorId: { _id: user._id, name: user.name, email: user.email }
        };
        setNotes([populatedNote, ...notes]);
        setNewNoteContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingNoteContent.trim()) return;
    try {
      const res = await apiFetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: editingNoteContent }),
      });
      if (res.ok) {
        setNotes(notes.map(n => n._id === noteId ? { ...n, content: editingNoteContent } : n));
        setEditingNoteId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this discussion note?')) return;
    try {
      const res = await apiFetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotes(notes.filter(n => n._id !== noteId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete note');
      }
    } catch (err) {
      alert('Delete operation failed.');
    }
  };


  const filteredPapers = papers.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.authors && p.authors.some(a => a.toLowerCase().includes(q))) ||
      (p.keywords && p.keywords.some(k => k.toLowerCase().includes(q)))
    );
  });

  const isLeader = project?.leader?._id === user?._id || project?.leader === user?._id;
  const isFaculty = project?.faculty?._id === user?._id || project?.faculty === user?._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="mt-4 font-outfit text-sm">Syncing collaborative vault...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="font-outfit text-xl font-bold">Workspace Loading Failed</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-sm">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-955 flex flex-col relative overflow-hidden text-slate-100 dot-grid">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      <header className="bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-all text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <span className="font-outfit text-sm font-bold tracking-tight text-white max-w-[200px] sm:max-w-xs truncate">
              {project?.title}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-grow flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 items-start relative z-10">
        <aside className="w-64 bg-slate-900 border border-slate-800/80 rounded-lg p-4 hidden md:flex flex-col gap-1 sticky top-22">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${activeTab === 'overview'
              ? 'bg-indigo-650/10 border-indigo-500/30 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 hover:border-slate-800/80'
              }`}
          >
            <Users className="w-4 h-4" />
            Workspace & Collaborators
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${activeTab === 'papers'
              ? 'bg-indigo-650/10 border-indigo-500/30 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 hover:border-slate-800/80'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            Research Papers ({papers.length})
          </button>
        </aside>

        <div className="md:hidden w-full flex overflow-x-auto gap-2 mb-4 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 shrink-0 py-2 px-4 rounded-lg text-xs font-semibold transition-all border ${activeTab === 'overview' ? 'bg-indigo-650/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`flex items-center gap-2 shrink-0 py-2 px-4 rounded-lg text-xs font-semibold transition-all border ${activeTab === 'papers' ? 'bg-indigo-650/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}
          >
            Papers ({papers.length})
          </button>
        </div>

        <main className="flex-1 min-w-0">

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-indigo-500/10 p-6 rounded-lg shadow-lg">
                <h2 className="font-outfit text-lg font-bold text-white mb-2">Project Brief</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{project?.description}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 bg-slate-900 border border-indigo-500/10 p-6 rounded-lg shadow-lg">
                  <h2 className="font-outfit text-lg font-bold text-white mb-4">Collaborative Roster</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20 text-xs">
                          {project?.leader?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{project?.leader?.name}</p>
                          <p className="text-xs text-slate-400">{project?.leader?.email}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        LEADER
                      </span>
                    </div>

                    {project?.faculty ? (
                      <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-amber-500 font-bold border border-amber-500/20 text-xs">
                            {project?.faculty?.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{project?.faculty?.name}</p>
                            <p className="text-xs text-slate-400">{project?.faculty?.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          FACULTY GUIDE
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 border border-slate-800 border-dashed rounded-lg text-slate-500 text-xs">
                        No Academic Faculty Guide associated yet.
                      </div>
                    )}

                    {project?.members && project.members.length > 0 ? (
                      project.members.map((member) => (
                        <div key={member._id} className="flex items-center justify-between p-3 bg-slate-955 border border-slate-800/80 rounded-lg animate-fadeIn">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20 text-xs">
                              {member.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{member.name}</p>
                              <p className="text-xs text-slate-400">{member.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              MEMBER
                            </span>
                            {(isLeader || isFaculty) && (
                              <button
                                onClick={() => handleRemoveMember(member._id)}
                                className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded transition-all cursor-pointer"
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No team members registered. Leader can invite members using the panel.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 border border-indigo-500/10 p-6 rounded-lg shadow-lg">
                  <h2 className="font-outfit text-lg font-bold text-white mb-2 flex items-center gap-1.5">
                    <UserPlus className="w-4.5 h-4.5 text-indigo-400" />
                    Invite Collaborator
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Invitees receive an email containing a secure verification link to accept and connect.
                  </p>

                  {isLeader ? (
                    <form onSubmit={handleSendInvite} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="collaborator@university.edu"
                          className="mt-2 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-400">
                          Academic Role
                        </label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="mt-2 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold cursor-pointer"
                        >
                          <option value="MEMBER">Research Assistant (Member)</option>
                          <option value="FACULTY">Faculty Advisor (Guide)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={inviteLoading}
                        className="glow-button w-full flex justify-center items-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        {inviteLoading ? 'Sending...' : 'Send Invitation Link'}
                        {!inviteLoading && <Send className="w-3.5 h-3.5" />}
                      </button>

                      {inviteMessage.text && (
                        <div className={`mt-4 p-3 rounded-lg border text-xs flex items-start gap-2.5 ${inviteMessage.type === 'success'
                          ? 'bg-emerald-955/20 border-emerald-900/30 text-emerald-350'
                          : 'bg-red-955/20 border-red-900/30 text-red-300'
                          }`}>
                          {inviteMessage.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          )}
                          <span>{inviteMessage.text}</span>
                        </div>
                      )}
                    </form>
                  ) : (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 text-xs leading-relaxed text-center">
                      Only the Project Leader is authorized to issue team workspace invitations.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'papers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, keyword..."
                    className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-205 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-semibold"
                  />
                </div>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="glow-button w-full sm:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shrink-0 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <Plus className="w-4 h-4" />
                  Upload Publication
                </button>
              </div>

              {filteredPapers.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center mb-4 text-indigo-400">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="font-outfit text-md font-bold text-slate-200">No Publications Logged</h3>
                  <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                    {searchQuery
                      ? 'No papers match your active filter settings.'
                      : 'Upload and attach research papers or reference PDFs to catalog reference materials.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredPapers.map((paper) => (
                    <div
                      key={paper._id}
                      onClick={() => handleOpenNotes(paper)}
                      className={`flat-card p-5 rounded-lg cursor-pointer flex flex-col justify-between transition-all duration-150 shadow-lg ${selectedPaper?._id === paper._id
                        ? 'border-indigo-500 bg-slate-900/80 ring-2 ring-indigo-500/20'
                        : ''
                        }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                            <FileText className="w-4 h-4" />
                          </div>

                          <div className="flex items-center gap-1">
                            <a
                              href={paper.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                              title="Open PDF"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {(isLeader || paper.uploadedBy?._id === user?._id || paper.uploadedBy === user?._id) && (
                              <button
                                onClick={(e) => handleDeletePaper(paper._id, e)}
                                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/5 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="font-outfit text-sm font-bold text-white line-clamp-2 hover:text-indigo-400 transition-colors">
                          {paper.title}
                        </h3>

                        {paper.authors && paper.authors.length > 0 && (
                          <p className="text-[10px] text-slate-400 mt-1 truncate">
                            By {paper.authors.join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[9px] font-semibold">
                        <div className="flex flex-wrap gap-1">
                          {paper.year && (
                            <span className="bg-slate-950 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {paper.year}
                            </span>
                          )}
                          {paper.keywords && paper.keywords.slice(0, 3).map((keyword, i) => (
                            <span key={i} className="bg-indigo-500/5 border border-indigo-500/10 text-indigo-400/85 px-1.5 py-0.5 rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-indigo-400" />
                          View Notes & Drawers
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {selectedPaper && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedPaper(null)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800/80 flex flex-col h-full shadow-2xl animate-slideLeft">

              <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Document Details
                </span>
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="p-1 text-slate-450 hover:text-indigo-400 rounded-lg hover:bg-slate-950 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                <div>
                  <h3 className="font-outfit text-md font-bold text-white leading-snug">
                    {selectedPaper.title}
                  </h3>

                  {selectedPaper.authors && selectedPaper.authors.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2">
                      Authors: <span className="text-slate-300">{selectedPaper.authors.join(', ')}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedPaper.year && (
                      <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px] font-semibold">
                        Published: {selectedPaper.year}
                      </span>
                    )}
                    {selectedPaper.keywords && selectedPaper.keywords.map((key, i) => (
                      <span key={i} className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[9px] font-semibold">
                        {key}
                      </span>
                    ))}
                  </div>

                  <a
                    href={selectedPaper.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-5 bg-slate-950 border border-slate-800 hover:border-indigo-500/30 text-slate-305 hover:text-indigo-400 font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer"
                  >
                    Read Document PDF
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <hr className="border-slate-800/80" />

                <div>
                  <h4 className="font-outfit text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Reference Notes
                  </h4>

                  <form onSubmit={handleAddNote} className="mb-6 flex gap-2">
                    <input
                      type="text"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write workspace annotation or research note..."
                      className="flex-grow px-3 py-2 bg-slate-955 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-medium"
                    />
                    <button
                      type="submit"
                      className="glow-button p-2.5 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 text-white rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>

                  {notesLoading ? (
                    <div className="flex items-center justify-center py-6 text-slate-500">
                      <Loader className="w-5 h-5 animate-spin text-indigo-400 mr-2" />
                      <span className="text-xs font-medium">Accessing annotations...</span>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                      No annotations attached yet. Start the literature analysis.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => {
                        const isNoteAuthor = note.authorId?._id === user?._id || note.authorId === user?._id;
                        const isEditing = editingNoteId === note._id;

                        return (
                          <div key={note._id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs leading-relaxed animate-fadeIn">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-slate-300">
                                {note.authorId?.name || 'Researcher'}
                              </span>
                              <span className="text-[9px] text-slate-500 font-medium">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {isEditing ? (
                              <div className="mt-2 space-y-2">
                                <textarea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                  rows={2}
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setEditingNoteId(null)}
                                    className="px-2.5 py-1 bg-slate-900 text-[10px] text-slate-400 rounded-md border border-slate-805 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdateNote(note._id)}
                                    className="glow-button px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 text-[10px] text-white font-semibold rounded-md cursor-pointer"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start gap-3">
                                <p className="text-slate-300 font-medium whitespace-pre-wrap">{note.content}</p>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isNoteAuthor && (
                                    <button
                                      onClick={() => {
                                        setEditingNoteId(note._id);
                                        setEditingNoteContent(note.content);
                                      }}
                                      className="p-1 text-slate-500 hover:text-indigo-400 rounded hover:bg-slate-900 cursor-pointer"
                                      title="Edit Note"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                  {(isNoteAuthor || isLeader) && (
                                    <button
                                      onClick={() => handleDeleteNote(note._id)}
                                      className="p-1 text-slate-500 hover:text-red-405 rounded hover:bg-red-500/5 cursor-pointer"
                                      title="Delete Note"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => !uploadLoading && setShowUploadModal(false)}
          ></div>

          <div className="bg-slate-900 border border-indigo-500/10 w-full max-w-lg p-6 rounded-xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="font-outfit text-lg font-bold text-white mb-1">
              Add Publication & PDF
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Upload research files. They will be stored securely on Cloudinary.
            </p>

            {uploadError && (
              <div className="mb-4 bg-red-955/20 border border-red-900/30 text-red-200 p-3 rounded-lg flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadPaper} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Publication Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-205 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  placeholder="e.g. Attention Is All You Need"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Authors (comma separated)
                  </label>
                  <input
                    type="text"
                    value={uploadAuthors}
                    onChange={(e) => setUploadAuthors(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-205 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                    placeholder="e.g. Vaswani, Shazeer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={uploadYear}
                    onChange={(e) => setUploadYear(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-lg text-slate-205 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                    placeholder="e.g. 2017"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadKeywords}
                  onChange={(e) => setUploadKeywords(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-205 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  placeholder="e.g. Transformers, NLP, Deep Learning"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select PDF File
                </label>
                <div className="border border-dashed border-slate-800 rounded-lg p-4 bg-slate-950/40 text-center hover:bg-slate-955/60 cursor-pointer relative">
                  <input
                    type="file"
                    required
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <PlusCircle className="w-7 h-7 text-indigo-400 mb-2" />
                    <span className="text-[11px] font-bold text-slate-300">
                      {selectedFile ? selectedFile.name : 'Choose a PDF from files'}
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1 font-semibold">PDF Files only (Max 10MB)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-805/80">
                <button
                  type="button"
                  disabled={uploadLoading}
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-855 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="glow-button px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-550 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                >
                  {uploadLoading ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    'Add Document'
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
