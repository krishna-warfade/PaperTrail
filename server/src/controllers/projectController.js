const Project = require('../models/Project');
const Paper = require('../models/Paper');

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please add a title and description' });
    }

    const project = await Project.create({
      title,
      description,
      leader: req.user._id,
      members: []
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { leader: req.user._id },
        { faculty: req.user._id },
        { members: req.user._id }
      ]
    }).populate('leader', 'name email')
      .populate('faculty', 'name email')
      .lean();

    const projectsWithCount = await Promise.all(
      projects.map(async (project) => {
        const paperCount = await Paper.countDocuments({ projectId: project._id });
        return {
          ...project,
          paperCount
        };
      })
    );

    res.json(projectsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('leader', 'name email')
      .populate('faculty', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader._id.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty._id.toString() === req.user._id.toString();
    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isLeader && !isFaculty && !isMember) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();

    if (!isLeader && !isFaculty) {
      return res.status(403).json({ message: 'Only the project leader or faculty guide can remove team members' });
    }

    const memberIndex = project.members.indexOf(memberId);
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Member is not part of this project' });
    }

    project.members.splice(memberIndex, 1);
    await project.save();

    res.status(200).json({ message: 'Team member removed successfully', projectId, memberId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  removeMember
};
