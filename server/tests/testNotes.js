const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Paper = require('../src/models/Paper');
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

async function runTests() {
  try {
    console.log('--- Starting Notes API Validation Test ---');

    console.log('\n1. Logging in users...');
    const memberAuth = await login('member@test.com', 'password123');
    const leaderAuth = await login('leader@test.com', 'password123');
    console.log('Logins successful!');

    console.log('\n2. Creating a test project as leader...');
    const projectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${leaderAuth.token}`,
      },
      body: JSON.stringify({
        title: 'Notes Test Project',
        description: 'Project to validate Notes endpoints',
      }),
    });
    if (!projectRes.ok) {
      throw new Error(`Project creation failed: ${projectRes.status}`);
    }
    const project = await projectRes.json();
    const projectId = project._id;

    console.log('\n3. Connecting to database to seed member and paper...');
    await mongoose.connect(process.env.MONGODB_URI);

    await Project.findByIdAndUpdate(projectId, { $addToSet: { members: memberAuth._id } });

    const paper = await Paper.create({
      title: 'Notes Test Paper',
      authors: ['Test Author'],
      year: 2026,
      projectId,
      uploadedBy: leaderAuth._id,
      pdfUrl: 'https://res.cloudinary.com/dummy.pdf'
    });
    const paperId = paper._id.toString();
    console.log('Seeded paper ID:', paperId);

    console.log('\n4. Adding a note as the member...');
    const addRes = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberAuth.token}`,
      },
      body: JSON.stringify({
        paperId,
        content: 'This is a test note on a valid paper.',
      }),
    });
    if (!addRes.ok) {
      throw new Error(`Add note failed: ${addRes.status} ${await addRes.text()}`);
    }
    const newNote = await addRes.json();
    console.log('Note created successfully:', newNote.content);

    console.log('\n5. Fetching notes for the paper...');
    const listRes = await fetch(`${BASE_URL}/notes/paper/${paperId}`, {
      headers: { Authorization: `Bearer ${memberAuth.token}` },
    });
    if (!listRes.ok) {
      throw new Error(`Get notes failed: ${listRes.status} ${await listRes.text()}`);
    }
    const notes = await listRes.json();
    console.log(`Found ${notes.length} note(s).`);

    console.log('\n6. Updating the note as the original author (should succeed)...');
    const updateRes = await fetch(`${BASE_URL}/notes/${newNote._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberAuth.token}`,
      },
      body: JSON.stringify({ content: 'Updated content of the test note.' }),
    });
    if (!updateRes.ok) {
      throw new Error(`Update note failed: ${updateRes.status} ${await updateRes.text()}`);
    }
    console.log('Note updated successfully!');

    console.log('\n7. Trying to edit someone else\'s note (should fail with 403)...');
    const forbiddenRes = await fetch(`${BASE_URL}/notes/${newNote._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${leaderAuth.token}`,
      },
      body: JSON.stringify({ content: 'Malicious edit attempt.' }),
    });
    if (forbiddenRes.status === 403) {
      console.log('PASSED: Non-author correctly blocked.');
    } else {
      throw new Error(`Expected 403, got ${forbiddenRes.status}`);
    }

    console.log('\n8. Deleting note as project leader (should succeed)...');
    const deleteRes = await fetch(`${BASE_URL}/notes/${newNote._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${leaderAuth.token}` },
    });
    if (deleteRes.ok) {
      console.log('Note deleted successfully by project leader!');
    } else {
      throw new Error(`Delete note failed: ${deleteRes.status} ${await deleteRes.text()}`);
    }

    console.log('\n9. Cleaning up test data from DB...');
    await Paper.findByIdAndDelete(paperId);
    await Project.findByIdAndDelete(projectId);
    await mongoose.connection.close();

    console.log('\n--- All Notes API tests PASSED ---');
  } catch (error) {
    console.error('\n*** API Validation Test FAILED ***');
    console.error(error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
}

runTests();