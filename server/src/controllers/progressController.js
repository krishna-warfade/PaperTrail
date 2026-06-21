const ProgressLog = require('../models/progressLog');
const Project = require('../models/Project');

exports.addProgressLog = async (req, res) => {
  try {
    const { projectId, description, date } = req.body;

    if (!projectId || !description) {
      return res.status(400).json({ message: 'projectId and description are required' });
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
      return res.status(403).json({ message: 'Not authorized to log progress for this project' });
    }

    const log = await ProgressLog.create({
      projectId,
      userId: req.user._id,
      description,
      date: date || Date.now(),
    });

    return res.status(201).json(log);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add progress log', error: err.message });
  }
};

exports.getProjectProgress = async (req, res) => {
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
      return res.status(403).json({ message: 'Not authorized to view progress logs for this project' });
    }

    const logs = await ProgressLog.find({ projectId })
      .populate('userId', 'name email')
      .sort({ date: -1 });

    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch progress logs', error: err.message });
  }
};