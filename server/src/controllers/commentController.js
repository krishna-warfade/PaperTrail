const Comment = require('../models/comment');
const Project = require('../models/Project');

exports.addComment = async (req, res) => {
  try {
    const { projectId, content } = req.body;

    if (!projectId || !content) {
      return res.status(400).json({ message: 'projectId and content are required' });
    }

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

    const populatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'name role');

    return res.status(201).json(populatedComment);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

exports.getProjectComments = async (req, res) => {
  try {
    const { projectId } = req.params;

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
      .populate('replies.authorId', 'name role')
      .populate('reactions.userId', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
};

exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    let comment = await Comment.findById(commentId);
    let isOldStyleReply = false;
    let parentComment = null;

    if (!comment) {
      parentComment = await Comment.findOne({ 'replies._id': commentId });
      if (!parentComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      comment = parentComment.replies.id(commentId);
      isOldStyleReply = true;
    }

    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = content;
    comment.isEdited = true;

    if (isOldStyleReply) {
      await parentComment.save();
      await parentComment.populate('replies.authorId', 'name role');
      const updatedReply = parentComment.replies.id(commentId);
      return res.status(200).json(updatedReply);
    } else {
      await comment.save();
      const populatedComment = await Comment.findById(comment._id)
        .populate('authorId', 'name role');
      return res.status(200).json(populatedComment);
    }
  } catch (err) {
    return res.status(500).json({ message: 'Failed to edit comment', error: err.message });
  }
};

const deleteCommentAndReplies = async (commentId) => {
  const children = await Comment.find({ parentId: commentId });
  for (const child of children) {
    await deleteCommentAndReplies(child._id);
  }
  await Comment.findByIdAndDelete(commentId);
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    let comment = await Comment.findById(commentId);
    let isOldStyleReply = false;
    let parentComment = null;

    if (!comment) {
      parentComment = await Comment.findOne({ 'replies._id': commentId });
      if (!parentComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      comment = parentComment.replies.id(commentId);
      isOldStyleReply = true;
    }

    const projectId = parentComment ? parentComment.projectId : comment.projectId;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();
    const isAuthor = comment.authorId.toString() === req.user._id.toString();

    if (!isAuthor && !isLeader && !isFaculty) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    if (isOldStyleReply) {
      parentComment.replies.pull(commentId);
      await parentComment.save();
      
      await deleteCommentAndReplies(commentId);
      
      return res.status(200).json({ message: 'Reply deleted successfully', commentId });
    } else {
      await deleteCommentAndReplies(commentId);
      return res.status(200).json({ message: 'Comment and all replies deleted successfully', commentId });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    let parentComment = await Comment.findById(commentId);
    let projectId;

    if (parentComment) {
      projectId = parentComment.projectId;
    } else {
      const topLevelComment = await Comment.findOne({ 'replies._id': commentId });
      if (!topLevelComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
      parentComment = topLevelComment.replies.id(commentId);
      projectId = topLevelComment.projectId;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isLeader && !isFaculty && !isMember) {
      return res.status(403).json({ message: 'Not authorized to reply to comments in this project' });
    }

    const reply = await Comment.create({
      projectId,
      authorId: req.user._id,
      parentId: commentId,
      content,
    });

    const populatedReply = await Comment.findById(reply._id)
      .populate('authorId', 'name role');

    return res.status(201).json(populatedReply);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add reply', error: err.message });
  }
};

exports.reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    let comment = await Comment.findById(commentId);
    let isOldStyleReply = false;
    let parentComment = null;

    if (!comment) {
      parentComment = await Comment.findOne({ 'replies._id': commentId });
      if (!parentComment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      comment = parentComment.replies.id(commentId);
      isOldStyleReply = true;
    }

    const project = await Project.findById(parentComment ? parentComment.projectId : comment.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isFaculty = project.faculty && project.faculty.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isLeader && !isFaculty && !isMember) {
      return res.status(403).json({ message: 'Not authorized to react in this project' });
    }

    if (!comment.reactions) {
      comment.reactions = [];
    }

    const existingIndex = comment.reactions.findIndex(
      r => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      comment.reactions.splice(existingIndex, 1);
    } else {
      comment.reactions.push({
        userId: req.user._id,
        emoji,
      });
    }

    if (isOldStyleReply) {
      await parentComment.save();
      return res.status(200).json(comment);
    } else {
      await comment.save();
      const populatedComment = await Comment.findById(comment._id)
        .populate('authorId', 'name role')
        .populate('reactions.userId', 'name');
      return res.status(200).json(populatedComment);
    }
  } catch (err) {
    return res.status(500).json({ message: 'Failed to react to comment', error: err.message });
  }
};