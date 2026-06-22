require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    const users = await User.find().select('name email role');
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`ID: ${user._id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    });
  } catch (err) {
    console.error("Database connection/query error:", err);
  } finally {
    await mongoose.connection.close();
  }
}

listUsers();
