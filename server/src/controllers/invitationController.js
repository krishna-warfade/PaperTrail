const crypto = require('crypto');
const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const User = require('../models/User');
const sendMail = require('../config/mailer');

const sendInvitation = async (req, res) => {
  try {
    const { email, projectId, role } = req.body;

    if (!email || !projectId || !role) {
      return res.status(400).json({ message: 'email, projectId, and role are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project leader can send invitations' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    const invitation = await Invitation.create({
      email: email.toLowerCase(),
      projectId,
      role,
      token,
    });

    const inviteLink = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;

    await sendMail(
      email,
      `Invitation to join project: ${project.title}`,
      `
        <h3>You have been invited to join "${project.title}"</h3>
        <p>Role: <strong>${role}</strong></p>
        <p>Click below to accept:</p>
        <a href="${inviteLink}" style="padding:10px 20px;background:#4F46E5;color:white;text-decoration:none;border-radius:5px;">Accept Invitation</a>
      `
    );

    res.status(200).json({ message: 'Invitation sent successfully', invitation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const invitation = await Invitation.findOne({ token });
    if (!invitation) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ message: 'This invitation is not for your email' });
    }

    const project = await Project.findById(invitation.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project no longer exists' });
    }

    if (invitation.role === 'MEMBER') {
      if (!project.members.includes(req.user._id)) {
        project.members.push(req.user._id);
      }
    } else if (invitation.role === 'FACULTY') {
      project.faculty = req.user._id;
    }

    if (req.user.role !== invitation.role && req.user.role !== 'LEADER') {
      await User.findByIdAndUpdate(req.user._id, { role: invitation.role });
    }

    await project.save();
    invitation.status = 'ACCEPTED';
    await invitation.save();

    res.status(200).json({ message: 'Successfully joined the project', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendInvitation, acceptInvitation };
