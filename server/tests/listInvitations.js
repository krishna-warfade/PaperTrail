require('dotenv').config();
const mongoose = require('mongoose');
const Invitation = require('../src/models/Invitation');

async function listInvitations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    const invitations = await Invitation.find().sort({ createdAt: -1 }).limit(10);
    console.log(`Found ${invitations.length} recent invitations:`);
    invitations.forEach(inv => {
      console.log(`ID: ${inv._id}, Email: ${inv.email}, Role: ${inv.role}, Status: ${inv.status}, CreatedAt: ${inv.createdAt}`);
    });
  } catch (err) {
    console.error("Database connection/query error:", err);
  } finally {
    await mongoose.connection.close();
  }
}

listInvitations();
