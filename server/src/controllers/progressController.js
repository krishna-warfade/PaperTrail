const ProgressLog = require('../models/progressLog');
const Project = require('../models/Project');

exports.addProgressLog = async (req, res) => {
  try {
    const { projectId, description } = req.body;

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
      date: Date.now(), // Always use current server timestamp to prevent tampering
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
      .populate('reactions.userId', 'name')
      .sort({ date: -1 });

    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch progress logs', error: err.message });
  }
};

exports.reactToProgress = async (req, res) => {
  try {
    const { progressId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const log = await ProgressLog.findById(progressId);
    if (!log) {
      return res.status(404).json({ message: 'Progress log not found' });
    }

    // Check project authorization
    const project = await Project.findById(log.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isLeader && !isFaculty && !isMember) {
      return res.status(403).json({ message: 'Not authorized to react in this project' });
    }

    if (!log.reactions) {
      log.reactions = [];
    }

    const existingIndex = log.reactions.findIndex(
      r => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      log.reactions.splice(existingIndex, 1);
    } else {
      log.reactions.push({
        userId: req.user._id,
        emoji,
      });
    }

    await log.save();

    const populatedLog = await ProgressLog.findById(log._id)
      .populate('userId', 'name email')
      .populate('reactions.userId', 'name');

    return res.status(200).json(populatedLog);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to react to progress log', error: err.message });
  }
};

exports.editProgressLog = async (req, res) => {
  try {
    const { progressId } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const log = await ProgressLog.findById(progressId);
    if (!log) {
      return res.status(404).json({ message: 'Progress log not found' });
    }

    if (log.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this progress log' });
    }

    log.description = description;
    log.isEdited = true;
    log.date = Date.now(); // Update timestamp to the edit time
    await log.save();

    const populatedLog = await ProgressLog.findById(log._id)
      .populate('userId', 'name email');

    return res.status(200).json(populatedLog);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to edit progress log', error: err.message });
  }
};