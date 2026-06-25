import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowLeft, BookOpen, Users, MessageSquare, Plus, Trash2,
  ExternalLink, MessageCircle, FileText, Search, Filter,
  UserPlus, Send, Loader, AlertCircle, CheckCircle,
  Edit2, X, PlusCircle, Sparkles, ClipboardList, Activity,
  Calendar, Clock, Sun, Moon, PieChart
} from 'lucide-react';

export default function ProjectWorkspace() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { fetchProjects } = useOutletContext();
  const { user, apiFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
  const [selectedFilterType, setSelectedFilterType] = useState('all');
  const [selectedFilterValue, setSelectedFilterValue] = useState('All');

  const [selectedPaper, setSelectedPaper] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const [progressLogs, setProgressLogs] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [newProgressDesc, setNewProgressDesc] = useState('');
  const [editingProgressId, setEditingProgressId] = useState(null);
  const [editingProgressDesc, setEditingProgressDesc] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [activeCommentReactionPickerId, setActiveCommentReactionPickerId] = useState(null);
  const [activeProgressReactionPickerId, setActiveProgressReactionPickerId] = useState(null);

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);


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

  const handleDeleteProject = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete this project? This will permanently remove all related papers, discussion notes, progress logs, and comments. This action cannot be undone.')) return;

    const confirmText = window.prompt('Please type "DELETE" to confirm project deletion:');
    if (confirmText !== 'DELETE') {
      alert('Project deletion cancelled.');
      return;
    }

    try {
      const res = await apiFetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Project deleted successfully.');
        await fetchProjects();
        navigate('/');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete project.');
      }
    } catch (err) {
      alert('Network error. Failed to delete project.');
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

  const fetchProgressLogs = async () => {
    setProgressLoading(true);
    try {
      const res = await apiFetch(`/api/progress/project/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProgressLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch progress logs:", err);
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await apiFetch(`/api/comments/project/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const res = await apiFetch(`/api/activity/project/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleAddProgressLog = async (e) => {
    e.preventDefault();
    if (!newProgressDesc.trim()) return;
    try {
      const body = {
        projectId,
        description: newProgressDesc,
      };
      const res = await apiFetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        const populatedLog = {
          ...data,
          userId: { _id: user._id, name: user.name, email: user.email }
        };
        setProgressLogs([populatedLog, ...progressLogs]);
        setNewProgressDesc('');
      } else {
        alert(data.message || 'Failed to add progress log');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProgress = async (progressId, e) => {
    if (e) e.preventDefault();
    if (!editingProgressDesc.trim()) return;
    try {
      const res = await apiFetch(`/api/progress/${progressId}`, {
        method: 'PUT',
        body: JSON.stringify({ description: editingProgressDesc }),
      });

      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok) {
        setProgressLogs(progressLogs.map(p => p._id === progressId ? data : p));
        setEditingProgressId(null);
        setEditingProgressDesc('');
      } else {
        alert(data.message || `Failed to edit progress log (Status: ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection error: Failed to edit progress log. Please ensure the backend server is running.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;
    try {
      const res = await apiFetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify({ projectId, content: newCommentContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments([data, ...comments]);
        setNewCommentContent('');
      } else {
        alert(data.message || 'Failed to add comment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (commentId, e) => {
    if (e) e.preventDefault();
    if (!editingCommentContent.trim()) return;
    try {
      const res = await apiFetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: editingCommentContent }),
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok) {
        setComments(comments.map(c => {
          if (c._id === commentId) {
            return data;
          }
          if (c.replies && c.replies.some(r => r._id === commentId)) {
            return {
              ...c,
              replies: c.replies.map(r => r._id === commentId ? { ...r, ...data } : r)
            };
          }
          return c;
        }));
        setEditingCommentId(null);
        setEditingCommentContent('');
      } else {
        alert(data.message || `Failed to edit comment (Status: ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection error: Failed to edit comment. Please ensure the backend server is running.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await apiFetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok) {
        // Collect all IDs to remove (the deleted comment and all its recursive descendants)
        const getDescendants = (id) => {
          let descendants = [id];
          comments.forEach(c => {
            if (c.parentId === id) {
              descendants = [...descendants, ...getDescendants(c._id)];
            }
          });
          return descendants;
        };
        const idsToRemove = getDescendants(commentId);

        setComments(comments
          .filter(c => !idsToRemove.includes(c._id))
          .map(c => ({
            ...c,
            replies: c.replies ? c.replies.filter(r => !idsToRemove.includes(r._id)) : []
          }))
        );
      } else {
        alert(data.message || `Failed to delete comment (Status: ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection error: Failed to delete comment. Please ensure the backend server is running.');
    }
  };

  const handleReplyComment = async (commentId, e) => {
    if (e) e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      const res = await apiFetch(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content: replyContent }),
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok) {
        setComments([data, ...comments]);
        setReplyingCommentId(null);
        setReplyContent('');
      } else {
        alert(data.message || `Failed to post reply (Status: ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection error: Failed to post reply. Please ensure the backend server is running.');
    }
  };

  const handleReactComment = async (commentId, emoji) => {
    try {
      const res = await apiFetch(`/api/comments/${commentId}/react`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok) {
        setComments(comments.map(c => {
          if (c._id === commentId) {
            return data;
          }
          if (c.replies && c.replies.some(r => r._id === commentId)) {
            return {
              ...c,
              replies: c.replies.map(r => r._id === commentId ? { ...r, reactions: data.reactions } : r)
            };
          }
          return c;
        }));
      } else {
        alert(data.message || `Failed to react to comment (Status: ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection error: Failed to react to comment. Please ensure the backend server is running.');
    }
  };

  const handleReactProgress = async (progressId, emoji) => {
    try {
      const res = await apiFetch(`/api/progress/${progressId}/react`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok) {
        setProgressLogs(progressLogs.map(p => p._id === progressId ? data : p));
      } else {
        alert(data.message || `Failed to react to progress log (Status: ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection error: Failed to react to progress log. Please ensure the backend server is running.');
    }
  };

  const getGroupedReactions = (reactions = []) => {
    const groups = {};
    reactions.forEach(r => {
      const emoji = r.emoji;
      if (!groups[emoji]) {
        groups[emoji] = {
          emoji,
          count: 0,
          userIds: [],
          names: [],
        };
      }
      groups[emoji].count += 1;
      const uId = r.userId?._id || r.userId;
      const name = r.userId?.name || (r.userId?._id ? 'User' : '');
      if (uId) {
        groups[emoji].userIds.push(uId.toString());
      }
      if (name) {
        groups[emoji].names.push(name);
      }
    });
    return Object.values(groups);
  };

  const buildCommentTree = (flatComments) => {
    const map = {};
    const roots = [];
    
    flatComments.forEach(c => {
      const oldReplies = c.replies ? c.replies.map(r => ({
        ...r,
        parentId: c._id,
        replies: [], // Initialize empty replies array for nesting under old-style replies
      })) : [];

      map[c._id] = { 
        ...c, 
        replies: oldReplies
      };

      // Expose old-style replies in the map so they can be referenced as parents by flat replies
      oldReplies.forEach(r => {
        map[r._id] = r;
      });
    });
    
    flatComments.forEach(c => {
      const mapped = map[c._id];
      if (c.parentId) {
        const parent = map[c.parentId];
        if (parent) {
          if (!parent.replies.some(r => r._id === mapped._id)) {
            parent.replies.push(mapped);
          }
        } else {
          roots.push(mapped);
        }
      } else {
        roots.push(mapped);
      }
    });

    const sortReplies = (node) => {
      if (node.replies) {
        node.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        node.replies.forEach(sortReplies);
      }
    };
    roots.forEach(sortReplies);
    
    return roots;
  };

  const renderCommentNode = (node, depth = 0) => {
    const name = node.authorId?.name || 'Researcher';
    const authorId = node.authorId?._id || node.authorId;
    let role = 'MEMBER';
    if (project?.leader?._id === authorId || project?.leader === authorId) {
      role = 'LEADER';
    } else if (project?.faculty?._id === authorId || project?.faculty === authorId) {
      role = 'FACULTY';
    }
    const initials = name.slice(0, 2).toUpperCase();
    const timeStr = new Date(node.isEdited ? node.updatedAt : node.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let roleBadgeColor = 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-500/20';
    if (role === 'LEADER') {
      roleBadgeColor = 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border-indigo-500/20';
    } else if (role === 'FACULTY') {
      roleBadgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }

    const isProjectLeader = project?.leader?._id === user?._id || project?.leader === user?._id;
    const isProjectFaculty = project?.faculty?._id === user?._id || project?.faculty === user?._id;
    const isAuthor = node.authorId?._id === user?._id || node.authorId === user?._id;

    return (
      <div key={node._id} className={`${depth === 0 ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-lg shadow-sm' : ''} flex flex-col gap-4 animate-fadeIn`}>
        <div className="flex items-start gap-4 w-full">
          <div className={`${depth > 0 ? 'w-7 h-7 text-[10px] rounded-md' : 'w-9 h-9 text-xs rounded-lg'} bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <div className="flex items-center gap-2">
                <h4 className={`${depth > 0 ? 'text-xs' : 'text-sm'} font-semibold text-slate-805 dark:text-white truncate`}>{name}</h4>
                <span className={`${depth > 0 ? 'text-[7px] px-1' : 'text-[8px] px-1.5 py-0.5'} font-bold tracking-wider rounded border ${roleBadgeColor}`}>
                  {role}
                </span>
                {node.isEdited && (
                  <span className="text-[8px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10 uppercase tracking-wider select-none">
                    Edited
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {timeStr}
                </span>
                {(isAuthor || isProjectLeader || isProjectFaculty) && (
                  <div className="flex items-center gap-1.5 border-l border-slate-100 dark:border-slate-800 pl-2.5">
                    {isAuthor && (
                      <button
                        onClick={() => {
                          setEditingCommentId(node._id);
                          setEditingCommentContent(node.content);
                          setReplyingCommentId(null);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:text-slate-555 dark:hover:text-indigo-400 rounded hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-all"
                        title="Edit Comment"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(node._id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-500/5 cursor-pointer transition-all"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {editingCommentId === node._id ? (
              <form onSubmit={(e) => handleEditComment(node._id, e)} className="mt-2 space-y-2.5 animate-fadeIn">
                <textarea
                  value={editingCommentContent}
                  onChange={(e) => setEditingCommentContent(e.target.value)}
                  rows={3}
                  className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-medium"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setEditingCommentId(null); setEditingCommentContent(''); }}
                    className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium whitespace-pre-wrap">{node.content}</p>
            )}

            {/* Actions Row */}
            {editingCommentId !== node._id && (
              <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2 border-t border-slate-50 dark:border-slate-850/20">
                <button
                  onClick={() => {
                    setReplyingCommentId(replyingCommentId === node._id ? null : node._id);
                    setReplyContent('');
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-650 dark:text-slate-450 dark:hover:text-indigo-400 cursor-pointer transition-all pr-2 border-r border-slate-100 dark:border-slate-850/20"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Reply
                </button>

                {/* Grouped Reactions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {getGroupedReactions(node.reactions).map((group) => {
                    const hasReacted = group.userIds.includes(user?._id?.toString());
                    return (
                      <button
                        key={group.emoji}
                        onClick={() => handleReactComment(node._id, group.emoji)}
                        className={`relative px-2 py-0.5 rounded-full border text-[9px] font-extrabold flex items-center gap-1 transition-all cursor-pointer group ${hasReacted
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-855'
                          }`}
                      >
                        <span>{group.emoji}</span>
                        <span>{group.count}</span>

                        {/* Custom Styled Tooltip */}
                        {group.names.length > 0 && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 text-[9px] font-semibold px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50 pointer-events-none animate-fadeIn border border-slate-800 dark:border-slate-700">
                            {group.names.join(', ')}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Add Reaction Button */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setActiveCommentReactionPickerId(activeCommentReactionPickerId === node._id ? null : node._id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-center"
                      title="Add Reaction"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    {activeCommentReactionPickerId === node._id && (
                      <div className="absolute left-0 bottom-full mb-1.5 z-50 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-1 rounded-full shadow-lg flex items-center gap-1 animate-fadeIn">
                        {['👍', '❤️', '🔥', '👏', '💡'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              handleReactComment(node._id, emoji);
                              setActiveCommentReactionPickerId(null);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-150 dark:hover:bg-slate-800 text-xs transition-all cursor-pointer scale-100 hover:scale-120"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {replyingCommentId === node._id && (
              <form onSubmit={(e) => handleReplyComment(node._id, e)} className="mt-3 flex gap-2.5 items-end animate-fadeIn">
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={1}
                    className="block w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-medium resize-none"
                  />
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setReplyingCommentId(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Recursive Nested Replies Thread */}
        {node.replies && node.replies.length > 0 && (
          <div className="pl-4 sm:pl-6 border-l border-slate-100 dark:border-slate-800/80 space-y-4 ml-3.5 sm:ml-4">
            {node.replies.map((childReply) => renderCommentNode(childReply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setSelectedMemberFilter(null);
    if (activeTab === 'progress') {
      fetchProgressLogs();
    } else if (activeTab === 'comments') {
      fetchComments();
    } else if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab, projectId]);


  const filteredPapers = papers.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      p.title.toLowerCase().includes(q) ||
      (p.authors && p.authors.some(a => a.toLowerCase().includes(q))) ||
      (p.keywords && p.keywords.some(k => k.toLowerCase().includes(q)))
    );
    if (!matchesSearch) return false;

    if (selectedFilterType === 'all' || !selectedFilterValue || selectedFilterValue === 'All') {
      return true;
    }
    if (selectedFilterType === 'year') {
      return p.year === Number(selectedFilterValue);
    }
    if (selectedFilterType === 'keyword') {
      return p.keywords && p.keywords.includes(selectedFilterValue);
    }
    if (selectedFilterType === 'author') {
      return p.authors && p.authors.includes(selectedFilterValue);
    }
    return true;
  });

  const uniqueYears = [...new Set(papers.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
  const uniqueKeywords = [...new Set(papers.flatMap(p => p.keywords || []).filter(Boolean))].sort();
  const uniqueAuthors = [...new Set(papers.flatMap(p => p.authors || []).filter(Boolean))].sort();

  const isLeader = project?.leader?._id === user?._id || project?.leader === user?._id;
  const isFaculty = project?.faculty?._id === user?._id || project?.faculty === user?._id;

  const getTeamContributionStats = () => {
    const stats = [];
    const totalLogs = progressLogs.length;

    const addOrUpdateUser = (userObj, role) => {
      if (!userObj) return;
      const uId = userObj._id?.toString() || userObj.toString();

      const count = progressLogs.filter(log => {
        const logUserId = log.userId?._id || log.userId;
        return (logUserId?._id?.toString() || logUserId?.toString()) === uId;
      }).length;

      const percentage = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;

      if (stats.some(s => s._id === uId)) return;

      stats.push({
        _id: uId,
        name: userObj.name || 'Researcher',
        email: userObj.email || '',
        role: role,
        count,
        percentage
      });
    };

    if (project?.leader) {
      addOrUpdateUser(project.leader, 'Leader');
    }

    if (project?.members) {
      project.members.forEach(m => addOrUpdateUser(m, 'Member'));
    }

    if (project?.faculty) {
      addOrUpdateUser(project.faculty, 'Faculty');
    }

    progressLogs.forEach(log => {
      if (log.userId) {
        const logUser = log.userId;
        const uId = logUser._id?.toString() || logUser.toString();
        if (!stats.some(s => s._id === uId)) {
          addOrUpdateUser(logUser, 'Contributor');
        }
      }
    });

    return stats.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };

  const filteredProgressLogs = selectedMemberFilter
    ? progressLogs.filter(log => {
      const logUserId = log.userId?._id || log.userId;
      return (logUserId?._id?.toString() || logUserId?.toString()) === selectedMemberFilter;
    })
    : progressLogs;

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-24 text-slate-900 dark:text-slate-100">
        <Loader className="w-8 h-8 animate-spin text-indigo-650" />
        <p className="mt-4 font-outfit text-xs text-slate-500 dark:text-slate-400">Syncing collaborative workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <h2 className="font-outfit text-md font-bold text-slate-900 dark:text-white">Workspace Loading Failed</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 max-w-xs">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 dot-grid flex flex-col h-full overflow-y-auto">

      <div className="hidden dark:block absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="hidden dark:block absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md z-20 pt-2 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">

        <div className="flex overflow-x-auto gap-1.5 sm:gap-2 pb-1 scrollbar-thin scrollbar-none shrink-0 -mx-1 px-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 sm:gap-2.5 shrink-0 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border cursor-pointer ${activeTab === 'overview'
                ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-150 dark:border-indigo-500/30 text-indigo-650 dark:text-indigo-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-550 dark:text-indigo-400" />
            <span className="hidden sm:inline">Workspace & Collaborators</span>
            <span className="sm:hidden">Team</span>
          </button>

          <button
            onClick={() => setActiveTab('papers')}
            className={`flex items-center gap-1.5 sm:gap-2.5 shrink-0 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border cursor-pointer ${activeTab === 'papers'
                ? 'bg-indigo-50 dark:bg-indigo-955/30 border-indigo-150 dark:border-indigo-500/30 text-indigo-650 dark:text-indigo-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-550 dark:text-indigo-400" />
            <span className="hidden sm:inline">Research Papers ({papers.length})</span>
            <span className="sm:hidden">Papers ({papers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-1.5 sm:gap-2.5 shrink-0 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border cursor-pointer ${activeTab === 'progress'
                ? 'bg-indigo-50 dark:bg-indigo-955/30 border-indigo-150 dark:border-indigo-500/30 text-indigo-650 dark:text-indigo-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-550 dark:text-indigo-400" />
            <span className="hidden sm:inline">Progress Logs</span>
            <span className="sm:hidden">Progress</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-1.5 sm:gap-2.5 shrink-0 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border cursor-pointer ${activeTab === 'comments'
                ? 'bg-indigo-50 dark:bg-indigo-955/30 border-indigo-150 dark:border-indigo-500/30 text-indigo-650 dark:text-indigo-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-550 dark:text-indigo-400" />
            <span className="hidden sm:inline">Project Comments</span>
            <span className="sm:hidden">Comments</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-1.5 sm:gap-2.5 shrink-0 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border cursor-pointer ${activeTab === 'activity'
                ? 'bg-indigo-50 dark:bg-indigo-955/30 border-indigo-150 dark:border-indigo-500/30 text-indigo-655 dark:text-indigo-400 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-550 dark:text-indigo-400" />
            <span className="hidden sm:inline">Activity Feed</span>
            <span className="sm:hidden">Activity</span>
          </button>
        </div>

        <div className="px-1 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3 shrink-0">
          <div className="min-w-0">
            <h1 className="font-outfit text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {project?.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 max-w-4xl leading-relaxed line-clamp-2">
              {project?.description}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 self-start md:self-auto">
            {project?.faculty && (
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-650 dark:text-indigo-405">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse animate-fadeIn"></span>
                Guide: {project.faculty.name}
              </div>
            )}
            {(isLeader || isFaculty) && (
              <button
                onClick={handleDeleteProject}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-955/20 text-red-655 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-955/40 transition-all cursor-pointer shadow-sm shrink-0"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Project
              </button>
            )}
          </div>
        </div>

      </div>

      <main className="flex-1 min-w-0">

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/10 p-6 rounded-lg shadow-sm">
                <h2 className="font-outfit text-lg font-bold text-slate-905 dark:text-white mb-4">Collaborative Roster</h2>
                <div className="space-y-4">

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 text-xs shadow-2xs">
                        {project?.leader?.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{project?.leader?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{project?.leader?.email}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20">
                      LEADER
                    </span>
                  </div>

                  {project?.faculty ? (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold border border-amber-500/20 text-xs shadow-2xs">
                          {project?.faculty?.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{project?.faculty?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{project?.faculty?.email}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        FACULTY GUIDE
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg text-slate-500 text-xs bg-slate-50/50 dark:bg-transparent">
                      No Academic Faculty Guide associated yet.
                    </div>
                  )}

                  {project?.members && project.members.length > 0 ? (
                    project.members.map((member) => (
                      <div key={member._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-lg shadow-2xs animate-fadeIn">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 dark:text-emerald-450 font-bold border border-emerald-500/20 text-xs shadow-2xs">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{member.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20">
                            MEMBER
                          </span>
                          {(isLeader || isFaculty) && (
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded transition-all cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                      No team members registered. Leader can invite members using the panel.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/10 p-6 rounded-lg shadow-sm">
                <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <UserPlus className="w-4.5 h-4.5 text-indigo-650 dark:text-indigo-400" />
                  Invite Collaborator
                </h2>
                <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed mb-6">
                  Invitees receive an email containing a secure verification link to accept and connect.
                </p>

                {isLeader ? (
                  <form onSubmit={handleSendInvite} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="collaborator@university.edu"
                        className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-405 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-550 dark:text-slate-400">
                        Academic Role
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold cursor-pointer"
                      >
                        <option value="MEMBER">Research Assistant (Member)</option>
                        <option value="FACULTY">Faculty Advisor (Guide)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="glow-button w-full flex justify-center items-center gap-1.5 py-2.5 px-4 bg-indigo-650 hover:bg-indigo-755 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 text-white font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      {inviteLoading ? 'Sending...' : 'Send Invitation Link'}
                      {!inviteLoading && <Send className="w-3.5 h-3.5" />}
                    </button>

                    {inviteMessage.text && (
                      <div className={`mt-4 p-3 rounded-lg border text-xs flex items-start gap-2.5 ${inviteMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-955/20 border-emerald-250 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-350'
                        : 'bg-red-50 dark:bg-red-955/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                        {inviteMessage.type === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-550 dark:text-red-400 shrink-0 mt-0.5" />
                        )}
                        <span>{inviteMessage.text}</span>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 text-xs leading-relaxed text-center font-medium">
                    Only the Project Leader is authorized to issue team workspace invitations.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'papers' && (
          <div className="space-y-6 animate-fadeIn">

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-xs rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, keyword..."
                  className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-205 placeholder-slate-450 dark:placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-semibold shadow-2xs"
                />
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="glow-button w-full sm:w-auto flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shrink-0 cursor-pointer shadow-md shadow-indigo-600/10"
              >
                <Plus className="w-4 h-4" />
                Upload Publication
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-2 animate-fadeIn">
                <button
                  onClick={() => {
                    setSelectedFilterType('all');
                    setSelectedFilterValue('All');
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide transition-all cursor-pointer border ${selectedFilterType === 'all'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-600 border-transparent shadow-sm font-black'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setSelectedFilterType('author');
                    setSelectedFilterValue('All');
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide transition-all cursor-pointer border ${selectedFilterType === 'author'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-600 border-transparent shadow-sm font-black'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  Author
                </button>
                <button
                  onClick={() => {
                    setSelectedFilterType('keyword');
                    setSelectedFilterValue('All');
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide transition-all cursor-pointer border ${selectedFilterType === 'keyword'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-600 border-transparent shadow-sm font-black'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  Keywords
                </button>
                <button
                  onClick={() => {
                    setSelectedFilterType('year');
                    setSelectedFilterValue('All');
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide transition-all cursor-pointer border ${selectedFilterType === 'year'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-600 border-transparent shadow-sm font-black'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  Year
                </button>
              </div>

              {selectedFilterType !== 'all' && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                  <button
                    onClick={() => setSelectedFilterValue('All')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide transition-all cursor-pointer ${selectedFilterValue === 'All'
                        ? 'bg-indigo-600 text-white dark:bg-indigo-600 shadow'
                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                  >
                    All
                  </button>

                  {selectedFilterType === 'year' && uniqueYears.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedFilterValue(String(y))}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide transition-all cursor-pointer ${selectedFilterValue === String(y)
                          ? 'bg-indigo-600 text-white dark:bg-indigo-600 shadow'
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {y}
                    </button>
                  ))}

                  {selectedFilterType === 'keyword' && uniqueKeywords.map((kw) => (
                    <button
                      key={kw}
                      onClick={() => setSelectedFilterValue(kw)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide transition-all cursor-pointer ${selectedFilterValue === kw
                          ? 'bg-indigo-600 text-white dark:bg-indigo-600 shadow'
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {kw}
                    </button>
                  ))}

                  {selectedFilterType === 'author' && uniqueAuthors.map((auth) => (
                    <button
                      key={auth}
                      onClick={() => setSelectedFilterValue(auth)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide transition-all cursor-pointer ${selectedFilterValue === auth
                          ? 'bg-indigo-600 text-white dark:bg-indigo-600 shadow'
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      {auth}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredPapers.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center mb-4 text-indigo-555 dark:text-indigo-400">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-outfit text-md font-bold text-slate-700 dark:text-slate-200">No Publications Logged</h3>
                <p className="text-slate-405 dark:text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                  {searchQuery || selectedFilterValue !== 'All'
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
                    className={`flat-card p-5 rounded-lg cursor-pointer flex flex-col justify-between transition-all duration-150 shadow-sm ${selectedPaper?._id === paper._id
                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-slate-900/80 ring-2 ring-indigo-500/20 shadow-md'
                        : 'bg-white dark:bg-slate-900/80 border-slate-205 dark:border-slate-800'
                      }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className="bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-indigo-900 dark:text-indigo-200 font-bold px-3 py-1.5 rounded-lg text-xs leading-snug truncate max-w-[82%] hover:underline transition-all cursor-pointer shadow-2xs"
                          onClick={(e) => { e.stopPropagation(); handleOpenNotes(paper); }}
                        >
                          {paper.title}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={paper.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-slate-450 hover:text-indigo-650 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                            title="Open PDF"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {(isLeader || paper.uploadedBy?._id === user?._id || paper.uploadedBy === user?._id) && (
                            <button
                              onClick={(e) => handleDeletePaper(paper._id, e)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-500/5 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {paper.authors && paper.authors.length > 0 && (
                        <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold truncate">
                          By {paper.authors.join(', ')}
                        </p>
                      )}

                      {paper.keywords && paper.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {paper.keywords.slice(0, 4).map((keyword, i) => (
                            <span
                              key={i}
                              className="bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 text-slate-550 dark:text-slate-400 text-[9px] px-2 py-0.5 rounded font-semibold"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-850/70 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                        <span>
                          Year: {paper.year || 'N/A'} &middot; Added: {new Date(paper.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          Published by: {paper.uploadedBy?.name || 'Unknown'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-650 dark:text-indigo-400 pt-1.5 border-t border-slate-50 dark:border-slate-850/30">
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5" />
                          View Notes & Drawers
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/10 p-6 rounded-lg shadow-sm">
                  <h2 className="font-outfit text-lg font-bold text-slate-905 dark:text-white mb-2 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Progress Logs
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Log your daily tasks, achievements, and technical milestones for the project.
                  </p>

                  <form onSubmit={handleAddProgressLog} className="mt-6 space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-550 dark:text-slate-400">
                        Progress Description
                      </label>
                      <input
                        type="text"
                        required
                        value={newProgressDesc}
                        onChange={(e) => setNewProgressDesc(e.target.value)}
                        placeholder="e.g. Implemented Mongoose models and verified references"
                        className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="glow-button flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      <Plus className="w-4 h-4" />
                      Log Progress Entry
                    </button>
                  </form>
                </div>

                {selectedMemberFilter && (
                  <div className="flex items-center justify-between bg-indigo-500/5 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 px-4 py-3 rounded-lg animate-fadeIn shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Showing progress logs for <span className="font-bold text-indigo-600 dark:text-indigo-400">{getTeamContributionStats().find(s => s._id === selectedMemberFilter)?.name || 'Researcher'}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedMemberFilter(null)}
                      className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-0"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}

                {progressLoading ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
                    <Loader className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Retrieving progress logs...</p>
                  </div>
                ) : filteredProgressLogs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center text-center shadow-sm animate-fadeIn">
                    <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                      <ClipboardList className="w-5.5 h-5.5" />
                    </div>
                    <h3 className="font-outfit text-md font-bold text-slate-705 dark:text-slate-200">No Progress Logged</h3>
                    <p className="text-slate-450 dark:text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                      {selectedMemberFilter ? 'No entries match this specific member filter.' : 'Start cataloging milestones by entering a progress description above.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProgressLogs.map((log) => {
                      const name = log.userId?.name || 'Researcher';
                      const initials = name.slice(0, 2).toUpperCase();
                      const dateStr = new Date(log.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const isAuthor = log.userId?._id === user?._id || log.userId === user?._id;

                      const logAuthorId = log.userId?._id || log.userId;
                      let logRole = 'MEMBER';
                      if (project?.leader?._id === logAuthorId || project?.leader === logAuthorId) {
                        logRole = 'LEADER';
                      } else if (project?.faculty?._id === logAuthorId || project?.faculty === logAuthorId) {
                        logRole = 'FACULTY';
                      }

                      let logRoleBadgeColor = 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-500/20';
                      if (logRole === 'LEADER') {
                        logRoleBadgeColor = 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border-indigo-500/20';
                      } else if (logRole === 'FACULTY') {
                        logRoleBadgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                      }

                      return (
                        <div key={log._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-lg shadow-sm flex items-start gap-4 animate-fadeIn">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-955 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 shrink-0 text-xs">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                              <div className="flex items-center gap-2 animate-fadeIn">
                                <h4 className="text-sm font-semibold text-slate-855 dark:text-white truncate">{name}</h4>
                                <span className={`text-[8px] px-1.5 py-0.5 font-bold tracking-wider rounded border ${logRoleBadgeColor}`}>
                                  {logRole}
                                </span>
                                {log.isEdited && (
                                  <span className="text-[8px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-500/5 px-1.5 py-0.5 rounded border border-indigo-500/10 uppercase tracking-wider select-none animate-fadeIn">
                                    Edited
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-405 dark:text-slate-500" />
                                  {dateStr}
                                </span>

                                {/* Add Reaction Button besides the timestamp */}
                                <div className="relative border-l border-slate-100 dark:border-slate-800 pl-2.5">
                                  <button
                                    onClick={() => {
                                      setActiveProgressReactionPickerId(activeProgressReactionPickerId === log._id ? null : log._id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-center"
                                    title="Add Reaction"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                  {activeProgressReactionPickerId === log._id && (
                                    <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-1 rounded-full shadow-lg flex items-center gap-1 animate-fadeIn">
                                      {['👍', '❤️', '🔥', '👏', '💡'].map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => {
                                            handleReactProgress(log._id, emoji);
                                            setActiveProgressReactionPickerId(null);
                                          }}
                                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-150 dark:hover:bg-slate-800 text-xs transition-all cursor-pointer scale-100 hover:scale-120"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Edit Button for Author */}
                                {isAuthor && (
                                  <div className="flex items-center border-l border-slate-100 dark:border-slate-800 pl-2.5">
                                    <button
                                      onClick={() => {
                                        setEditingProgressId(log._id);
                                        setEditingProgressDesc(log.description);
                                      }}
                                      className="p-1 text-slate-400 hover:text-indigo-600 dark:text-slate-555 dark:hover:text-indigo-400 rounded hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-all"
                                      title="Edit Log"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {editingProgressId === log._id ? (
                              <form onSubmit={(e) => handleEditProgress(log._id, e)} className="mt-2 space-y-2.5 animate-fadeIn">
                                <textarea
                                  value={editingProgressDesc}
                                  onChange={(e) => setEditingProgressDesc(e.target.value)}
                                  rows={2}
                                  className="block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs font-medium"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => { setEditingProgressId(null); setEditingProgressDesc(''); }}
                                    className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-3 py-1.5 text-[11px] font-semibold bg-indigo-650 hover:bg-indigo-755 text-white rounded-lg transition-all cursor-pointer shadow-sm"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="text-slate-600 dark:text-slate-305 text-xs leading-relaxed font-medium whitespace-pre-wrap">{log.description}</p>
                            )}

                             {/* Reactions Section */}
                             {log.reactions && log.reactions.length > 0 && (
                               <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-50 dark:border-slate-850/20 animate-fadeIn">
                                 {getGroupedReactions(log.reactions).map((group) => {
                                   const hasReacted = group.userIds.includes(user?._id?.toString());
                                   return (
                                     <button
                                       key={group.emoji}
                                       onClick={() => handleReactProgress(log._id, group.emoji)}
                                       className={`relative px-2 py-0.5 rounded-full border text-[9px] font-extrabold flex items-center gap-1 transition-all cursor-pointer group ${hasReacted
                                           ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs'
                                           : 'bg-slate-50 dark:bg-slate-950 border-slate-205 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-855'
                                         }`}
                                     >
                                       <span>{group.emoji}</span>
                                       <span>{group.count}</span>

                                       {/* Custom Styled Tooltip */}
                                       {group.names.length > 0 && (
                                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 text-[9px] font-semibold px-2.5 py-1 rounded shadow-md whitespace-nowrap z-50 pointer-events-none animate-fadeIn border border-slate-800 dark:border-slate-700">
                                           {group.names.join(', ')}
                                           {/* Arrow */}
                                           <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                                         </div>
                                       )}
                                     </button>
                                   );
                                 })}
                               </div>
                             )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="lg:col-span-1 animate-fadeIn">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-lg shadow-sm lg:sticky lg:top-32 space-y-4">
                  <div>
                    <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Team Contribution
                    </h3>
                    <p className="text-slate-450 dark:text-slate-450 text-[10px] leading-relaxed mt-1">
                      Updates logged by each collaborator. Click a card to filter entries.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {getTeamContributionStats().map((member) => {
                      const initials = member.name.slice(0, 2).toUpperCase();
                      const isSelected = selectedMemberFilter === member._id;

                      let roleBadge = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800';
                      if (member.role === 'Leader') roleBadge = 'bg-indigo-50 text-indigo-650 border-indigo-200/50 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-900/50';
                      if (member.role === 'Faculty') roleBadge = 'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-955 dark:text-amber-450 dark:border-amber-900/50';
                      if (member.role === 'Member') roleBadge = 'bg-emerald-50 text-emerald-650 border-emerald-200/50 dark:bg-emerald-955 dark:text-emerald-450 dark:border-emerald-900/50';

                      return (
                        <div
                          key={member._id}
                          onClick={() => {
                            setSelectedMemberFilter(isSelected ? null : member._id);
                          }}
                          className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col gap-2 group ${isSelected
                              ? 'bg-indigo-50/40 dark:bg-slate-850/80 border-indigo-500 dark:border-indigo-550 ring-2 ring-indigo-500/20'
                              : 'bg-slate-50/50 dark:bg-slate-955/20 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/40 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${isSelected
                                  ? 'bg-indigo-650 text-white border-transparent'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                }`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-805 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {member.name}
                                </p>
                                <p className="text-[10px] text-slate-450 dark:text-slate-500 truncate mt-0.5 font-medium">
                                  {member.count} updates ({member.percentage}%)
                                </p>
                              </div>
                            </div>
                            <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${roleBadge}`}>
                              {member.role.toUpperCase()}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isSelected
                                  ? 'bg-indigo-600 dark:bg-indigo-500'
                                  : 'bg-indigo-600/60 dark:bg-indigo-500/50'
                                }`}
                              style={{ width: `${member.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedMemberFilter && (
                    <button
                      onClick={() => setSelectedMemberFilter(null)}
                      className="w-full py-1.5 border border-slate-205 dark:border-slate-800 hover:border-indigo-600/30 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 text-[10px] font-bold tracking-wide rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-all cursor-pointer"
                    >
                      Reset Filter & Show All
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/10 p-6 rounded-lg shadow-sm">
              <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-605 dark:text-indigo-400" />
                Project Comments
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                Participate in a project-wide discussion thread. All messages are stored permanently.
              </p>

              <form onSubmit={handleAddComment} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-550 dark:text-slate-400 mb-2">
                    New Discussion Post
                  </label>
                  <textarea
                    required
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder="Share updates, links, thoughts, or ask team questions..."
                    rows={3}
                    className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-805 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="glow-button flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Comment
                </button>
              </form>
            </div>

            {commentsLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
                <Loader className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-xs">Accessing project comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                  <MessageSquare className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-outfit text-md font-bold text-slate-705 dark:text-slate-200">No Comments Posted</h3>
                <p className="text-slate-450 dark:text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                  Be the first to post a discussion message or project query above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {buildCommentTree(comments).map((rootComment) => renderCommentNode(rootComment, 0))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-indigo-500/10 p-6 rounded-lg shadow-sm">
              <h2 className="font-outfit text-lg font-bold text-slate-905 dark:text-white mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Project Activity Feed
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                A real-time overview of document uploads, log updates, and discussion posts.
              </p>
            </div>

            {activitiesLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-202 p-12 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
                <Loader className="w-8 h-8 animate-spin text-indigo-550 dark:text-indigo-455 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-xs">Loading unified feed...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-lg flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-outfit text-md font-bold text-slate-705 dark:text-slate-200">No Recent Activity</h3>
                <p className="text-slate-450 dark:text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed">
                  Perform actions like uploading papers, posting comments, or logging progress to populate the activity stream.
                </p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800/80 ml-4 pl-6 space-y-6">
                {activities.map((activity) => {
                  const name = activity.user?.name || 'Researcher';
                  const role = activity.user?.role || 'MEMBER';
                  const initials = name.slice(0, 2).toUpperCase();
                  const dateStr = new Date(activity.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  let badgeLabel = '';
                  let badgeStyle = '';
                  let actionText = '';
                  let detailText = activity.text;
                  let typeIcon = null;

                  if (activity.type === 'PROGRESS') {
                    badgeLabel = 'PROGRESS';
                    badgeStyle = 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border-emerald-500/20';
                    actionText = 'logged progress';
                    typeIcon = <ClipboardList className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
                  } else if (activity.type === 'PAPER_UPLOAD') {
                    badgeLabel = 'PAPER UPLOAD';
                    badgeStyle = 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border-blue-500/20';
                    actionText = 'uploaded a research paper';
                    typeIcon = <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-450" />;
                  } else if (activity.type === 'COMMENT') {
                    badgeLabel = 'COMMENT';
                    badgeStyle = 'bg-violet-500/10 text-violet-650 dark:text-violet-400 border-violet-500/20';
                    actionText = 'posted a project comment';
                    typeIcon = <MessageSquare className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />;
                  }

                  return (
                    <div key={activity._id} className="relative animate-fadeIn">
                      {/* Timeline Circle */}
                      <div className="absolute -left-10 top-0.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 w-8 h-8 rounded-full flex items-center justify-center z-10 shadow-sm">
                        {typeIcon}
                      </div>

                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-lg shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-white">{name}</span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-400 font-medium">({role.toLowerCase()})</span>
                            <span className="text-slate-500 dark:text-slate-400">{actionText}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                              {badgeLabel}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{dateStr}</span>
                          </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-xs italic leading-relaxed whitespace-pre-wrap">
                          "{detailText}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {selectedPaper && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedPaper(null)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <div className="w-screen max-w-full sm:max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800/80 flex flex-col h-full shadow-2xl animate-slideLeft">

              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Document Details
                </span>
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-950 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                <div>
                  <h3 className="font-outfit text-md font-bold text-slate-850 dark:text-white leading-snug">
                    {selectedPaper.title}
                  </h3>

                  {selectedPaper.authors && selectedPaper.authors.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Authors: <span className="text-slate-700 dark:text-slate-300">{selectedPaper.authors.join(', ')}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedPaper.year && (
                      <span className="bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-805 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[9px] font-semibold">
                        Published: {selectedPaper.year}
                      </span>
                    )}
                    {selectedPaper.keywords && selectedPaper.keywords.map((key, i) => (
                      <span key={i} className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[9px] font-semibold">
                        {key}
                      </span>
                    ))}
                  </div>

                  <a
                    href={selectedPaper.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 text-slate-700 dark:text-slate-305 hover:text-indigo-650 dark:hover:text-indigo-400 font-semibold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer"
                  >
                    Read Document PDF
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <hr className="border-slate-100 dark:border-slate-805/85" />

                <div>
                  <h4 className="font-outfit text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Reference Notes
                  </h4>

                  <form onSubmit={handleAddNote} className="mb-6 flex gap-2">
                    <input
                      type="text"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write workspace annotation or research note..."
                      className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-medium"
                    />
                    <button
                      type="submit"
                      className="glow-button p-2.5 bg-indigo-600 hover:bg-indigo-755 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 text-white rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>

                  {notesLoading ? (
                    <div className="flex items-center justify-center py-6 text-slate-400 dark:text-slate-500">
                      <Loader className="w-5 h-5 animate-spin text-indigo-650 dark:text-indigo-400 mr-2" />
                      <span className="text-xs font-medium">Accessing annotations...</span>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-450 dark:text-slate-550 text-xs font-medium bg-slate-50/20">
                      No annotations attached yet. Start the literature analysis.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => {
                        const isNoteAuthor = note.authorId?._id === user?._id || note.authorId === user?._id;
                        const isEditing = editingNoteId === note._id;

                        return (
                          <div key={note._id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs leading-relaxed animate-fadeIn">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                {note.authorId?.name || 'Researcher'}
                              </span>
                              <span className="text-[9px] text-slate-405 dark:text-slate-500 font-semibold">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {isEditing ? (
                              <div className="mt-2 space-y-2">
                                <textarea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                  rows={2}
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setEditingNoteId(null)}
                                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-800 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdateNote(note._id)}
                                    className="glow-button px-2.5 py-1 bg-indigo-605 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 text-[10px] text-white font-semibold rounded-md cursor-pointer shadow-2xs"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start gap-3">
                                <p className="text-slate-600 dark:text-slate-300 font-medium whitespace-pre-wrap">{note.content}</p>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isNoteAuthor && (
                                    <button
                                      onClick={() => {
                                        setEditingNoteId(note._id);
                                        setEditingNoteContent(note.content);
                                      }}
                                      className="p-1 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 rounded hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                                      title="Edit Note"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                  {(isNoteAuthor || isLeader) && (
                                    <button
                                      onClick={() => handleDeleteNote(note._id)}
                                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-500/5 cursor-pointer"
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
            className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs"
            onClick={() => !uploadLoading && setShowUploadModal(false)}
          ></div>

          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-indigo-500/10 w-full max-w-lg p-6 rounded-xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-1">
              Add Publication & PDF
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Upload research files. They will be stored securely on Cloudinary.
            </p>

            {uploadError && (
              <div className="mb-4 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-250 p-3 rounded-lg flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadPaper} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Publication Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-205 placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  placeholder="e.g. Attention Is All You Need"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Authors (comma separated)
                  </label>
                  <input
                    type="text"
                    value={uploadAuthors}
                    onChange={(e) => setUploadAuthors(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-205 placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                    placeholder="e.g. Vaswani, Shazeer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={uploadYear}
                    onChange={(e) => setUploadYear(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-205 placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                    placeholder="e.g. 2017"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={uploadKeywords}
                  onChange={(e) => setUploadKeywords(e.target.value)}
                  className="mt-2 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-900 dark:text-slate-205 placeholder-slate-450 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
                  placeholder="e.g. Transformers, NLP, Deep Learning"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Select PDF File
                </label>
                <div className="border border-dashed border-slate-300 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-950/40 text-center hover:bg-slate-100 dark:hover:bg-slate-955/60 cursor-pointer relative transition-colors shadow-2xs">
                  <input
                    type="file"
                    required
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <PlusCircle className="w-7 h-7 text-indigo-550 dark:text-indigo-400 mb-2" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {selectedFile ? selectedFile.name : 'Choose a PDF from files'}
                    </span>
                    <span className="text-[9px] text-slate-405 dark:text-slate-500 mt-1 font-semibold">PDF Files only (Max 10MB)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-805">
                <button
                  type="button"
                  disabled={uploadLoading}
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="glow-button px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-650 dark:hover:from-indigo-500 dark:hover:to-violet-550 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
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
