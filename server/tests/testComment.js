const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Project = require('../src/models/Project');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function register(name, email, password, role) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok && res.status !== 400) {
    throw new Error(`Register failed for ${email}: ${res.status} ${await res.text()}`);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  try {
    console.log('--- Starting Comment API Validation Test ---');

    console.log('\n1. Ensuring faculty@test.com exists, then logging in as leader and faculty...');
    await register('Test Faculty', 'faculty@test.com', 'password123', 'FACULTY');
    const leaderAuth = await login('leader@test.com', 'password123');
    const facultyAuth = await login('faculty@test.com', 'password123');
    console.log('Both logins successful.');

    console.log('\n2. Creating a real project as the leader...');
    const projectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${leaderAuth.token}`,
      },
      body: JSON.stringify({
        title: 'Comment Test Project',
        description: 'Created by testComments.js to validate the Comment module',
      }),
    });
    if (!projectRes.ok) {
      throw new Error(`Create project failed: ${projectRes.status} ${await projectRes.text()}`);
    }
    const project = await projectRes.json();
    const projectId = project._id;
    console.log('Project created:', projectId);

    console.log('\n3. Connecting to DB to associate faculty guide with project...');
    await mongoose.connect(process.env.MONGODB_URI);
    await Project.findByIdAndUpdate(projectId, { faculty: facultyAuth._id });
    await mongoose.connection.close();
    console.log('Faculty associated successfully!');

    console.log('\n4. Adding a comment as the faculty guide...');
    const facultyCommentRes = await fetch(`${BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${facultyAuth.token}`,
      },
      body: JSON.stringify({
        projectId,
        content: 'Good start — consider expanding the related work section with 2024-25 papers.',
      }),
    });
    if (!facultyCommentRes.ok) {
      throw new Error(`Faculty comment failed: ${facultyCommentRes.status} ${await facultyCommentRes.text()}`);
    }
    console.log('Faculty comment created successfully!');

    await wait(1200);

    console.log('\n5. Adding a comment as the leader...');
    const leaderCommentRes = await fetch(`${BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${leaderAuth.token}`,
      },
      body: JSON.stringify({
        projectId,
        content: 'Thanks for the feedback, updating the draft now.',
      }),
    });
    if (!leaderCommentRes.ok) {
      throw new Error(`Leader comment failed: ${leaderCommentRes.status} ${await leaderCommentRes.text()}`);
    }
    console.log('Leader comment created successfully!');

    console.log('\n6. Fetching all comments for the project...');
    const listRes = await fetch(`${BASE_URL}/comments/project/${projectId}`, {
      headers: { Authorization: `Bearer ${leaderAuth.token}` },
    });
    if (!listRes.ok) {
      throw new Error(`Get comments failed: ${listRes.status} ${await listRes.text()}`);
    }
    const comments = await listRes.json();
    console.log(`Found ${comments.length} comment(s).`);

    console.log('\n7. Validating sort order (newest first)...');
    if (comments.length < 2) {
      throw new Error(`Expected at least 2 comments, got ${comments.length}`);
    }
    const isDescending = new Date(comments[0].createdAt) >= new Date(comments[1].createdAt);
    if (!isDescending) {
      throw new Error('FAILED: comments are NOT sorted by createdAt descending');
    }
    if (comments[0].authorId.role !== 'LEADER') {
      throw new Error('FAILED: expected the most recent comment to be from the leader');
    }
    console.log('PASSED: comments correctly sorted newest-first.');

    console.log('\n8. Validating populated author name AND role...');
    const facultyEntry = comments.find((c) => c.authorId.role === 'FACULTY');
    if (!facultyEntry) {
      throw new Error('FAILED: could not find the faculty comment in the list');
    }
    if (!facultyEntry.authorId.name) {
      throw new Error('FAILED: authorId.name was not populated');
    }
    console.log(
      `PASSED: faculty comment populated as { name: '${facultyEntry.authorId.name}', role: '${facultyEntry.authorId.role}' }`
    );

    console.log('\n9. Cleaning up test project from DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    await Project.findByIdAndDelete(projectId);
    await mongoose.connection.close();

    console.log('\n--- All Comment API tests PASSED ---');
  } catch (error) {
    console.error('\n*** API Validation Test FAILED ***');
    console.error(error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

runTests();
