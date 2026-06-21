const Comment = require('../models/comment');
const Project = require('../models/Project');

exports.addComment = async (req, res) => {
  try {
    const { projectId, content } = req.body;

    if (!projectId || !content) {
      return res.status(400).json({ message: 'projectId and content are required' });
    }

    // Check project authorization
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isLeader && !isFaculty && !isMember) {
      return res.status(403).json({ message: 'Not authorized to add comment to this project' });
    }

    const comment = await Comment.create({
      projectId,
      authorId: req.user._id,
      content,
    });

    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

exports.getProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check project authorization
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isLeader && !isFaculty && !isMember) {
      return res.status(403).json({ message: 'Not authorized to view comments for this project' });
    }

    const comments = await Comment.find({ projectId })
      .populate('authorId', 'name role')
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
};