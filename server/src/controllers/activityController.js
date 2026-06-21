const mongoose = require('mongoose');
const ProgressLog = require('../models/progressLog');
const Project = require('../models/Project');

exports.getProjectActivity = async (req, res) => {
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
      return res.status(403).json({ message: 'Not authorized to view activity feed for this project' });
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const feed = await ProgressLog.aggregate([
      { $match: { projectId: projectObjectId } },
      {
        $project: {
          type: { $literal: 'PROGRESS' },
          text: '$description',
          userId: '$userId',
          date: '$date',
        },
      },
      {
        $unionWith: {
          coll: 'papers',
          pipeline: [
            { $match: { projectId: projectObjectId } },
            {
              $project: {
                type: { $literal: 'PAPER_UPLOAD' },
                text: '$title',
                userId: '$uploadedBy',
                date: '$createdAt',
              },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: 'comments',
          pipeline: [
            { $match: { projectId: projectObjectId } },
            {
              $project: {
                type: { $literal: 'COMMENT' },
                text: '$content',
                userId: '$authorId',
                date: '$createdAt',
              },
            },
          ],
        },
      },
      { $sort: { date: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          type: 1,
          text: 1,
          date: 1,
          'user.name': 1,
          'user.role': 1,
        },
      },
    ]);

    return res.status(200).json(feed);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch activity feed', error: err.message });
  }
};