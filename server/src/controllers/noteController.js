const Note = require('../models/Note');
const Paper = require('../models/Paper');
const Project = require('../models/Project');

exports.addNote = async (req, res) => {
  try {
    const { paperId, content } = req.body;

    if (!paperId || !content) {
      return res.status(400).json({ message: 'paperId and content are required' });
    }

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const project = await Project.findById(paper.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isLeader && !isFaculty && !isMember) {
      return res.status(403).json({ message: 'Not authorized to add notes for this project' });
    }

    const note = await Note.create({
      paperId,
      authorId: req.user._id,
      content,
    });

    return res.status(201).json(note);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add note', error: err.message });
  }
};

exports.getNotesForPaper = async (req, res) => {
  try {
    const { paperId } = req.params;

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const project = await Project.findById(paper.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isLeader && !isFaculty && !isMember) {
      return res.status(403).json({ message: 'Not authorized to view notes for this project' });
    }

    const notes = await Note.find({ paperId })
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notes', error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own notes' });
    }

    note.content = content ?? note.content;
    await note.save();

    return res.status(200).json(note);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update note', error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const isAuthor = note.authorId.toString() === req.user._id.toString();

    let isLeader = false;
    const paper = await Paper.findById(note.paperId);
    if (paper) {
      const project = await Project.findById(paper.projectId);
      if (project && project.leader.toString() === req.user._id.toString()) {
        isLeader = true;
      }
    }

    if (!isAuthor && !isLeader) {
      return res.status(403).json({ message: 'You are not authorized to delete this note' });
    }

    await Note.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete note', error: err.message });
  }
};