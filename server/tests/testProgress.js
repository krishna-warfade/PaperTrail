const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Project = require('../src/models/Project');
const ProgressLog = require('../src/models/progressLog');

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

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  try {
    console.log('--- Starting Progress Log API Validation Test ---');

    console.log('\n1. Logging in as leader@test.com...');
    const leaderAuth = await login('leader@test.com', 'password123');
    const leaderToken = leaderAuth.token;
    console.log('Login successful! Captured JWT Token.');

    console.log('\n2. Creating a real project (so we have a valid projectId)...');
    const projectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${leaderToken}`,
      },
      body: JSON.stringify({
        title: 'Progress Log Test Project',
        description: 'Created by testProgress.js to validate the Progress Log module',
      }),
    });
    if (!projectRes.ok) {
      throw new Error(`Create project failed: ${projectRes.status} ${await projectRes.text()}`);
    }
    const project = await projectRes.json();
    const projectId = project._id;
    console.log('Project created:', projectId);

    console.log('\n3. Adding first progress log entry...');
    const log1Res = await fetch(`${BASE_URL}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${leaderToken}`,
      },
      body: JSON.stringify({
        projectId,
        description: 'Set up the literature review folder and assigned papers to read.',
      }),
    });
    if (!log1Res.ok) {
      throw new Error(`Add first progress log failed: ${log1Res.status} ${await log1Res.text()}`);
    }
    const log1 = await log1Res.json();
    console.log('First log created:', log1.description);

    await wait(1500);
    console.log('\n4. Adding second progress log entry...');
    const log2Res = await fetch(`${BASE_URL}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${leaderToken}`,
      },
      body: JSON.stringify({
        projectId,
        description: 'Finished reading 3 papers, drafted the methodology outline.',
      }),
    });
    if (!log2Res.ok) {
      throw new Error(`Add second progress log failed: ${log2Res.status} ${await log2Res.text()}`);
    }
    const log2 = await log2Res.json();
    console.log('Second log created:', log2.description);

    console.log('\n5. Fetching progress history for the project...');
    const historyRes = await fetch(`${BASE_URL}/progress/project/${projectId}`, {
      headers: { Authorization: `Bearer ${leaderToken}` },
    });
    if (!historyRes.ok) {
      throw new Error(`Get progress history failed: ${historyRes.status} ${await historyRes.text()}`);
    }
    const history = await historyRes.json();
    console.log(`Found ${history.length} log(s).`);

    console.log('\n6. Validating sort order (should be newest first)...');
    if (history.length < 2) {
      throw new Error(`Expected at least 2 logs, got ${history.length}`);
    }
    const isDescending = new Date(history[0].date) >= new Date(history[1].date);
    if (!isDescending) {
      throw new Error('FAILED: logs are NOT sorted by date descending');
    }
    if (history[0]._id !== log2._id) {
      throw new Error('FAILED: the most recently created log should be first in the list');
    }
    console.log('PASSED: logs are correctly sorted newest-first.');

    console.log('\n7. Validating populated user info...');
    if (!history[0].userId || !history[0].userId.name || !history[0].userId.email) {
      throw new Error('FAILED: userId was not populated with name/email');
    }
    console.log('PASSED: userId populated as:', history[0].userId);

    console.log('\n8. Cleaning up test data from DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    await ProgressLog.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);
    await mongoose.connection.close();
    console.log('Database cleanup complete.');

    console.log('\n--- All Progress Log API tests PASSED ---');
  } catch (error) {
    console.error('\n*** API Validation Test FAILED ***');
    console.error(error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

runTests();
