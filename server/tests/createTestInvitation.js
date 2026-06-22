require('dotenv').config();
const mongoose = require('mongoose');
const Invitation = require('../src/models/Invitation');
const Project = require('../src/models/Project');
const User = require('../src/models/User');
const crypto = require('crypto');

async function createTestInvite() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find any project
    const project = await Project.findOne();
    if (!project) {
      console.error("No project found to invite to!");
      return;
    }

    const testEmail = `new_test_user_${Date.now()}@example.com`;
    const token = crypto.randomBytes(32).toString('hex');

    const invitation = await Invitation.create({
      email: testEmail,
      projectId: project._id,
      role: 'MEMBER',
      token,
    });

    console.log(`\nCreated pending invitation:`);
    console.log(`Email: ${testEmail}`);
    console.log(`Project: ${project.title}`);
    console.log(`URL: http://localhost:3000/accept-invite?token=${token}`);
  } catch (err) {
    console.error("Error creating invitation:", err);
  } finally {
    await mongoose.connection.close();
  }
}

createTestInvite();
