const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const FAKE_PAPER_ID = new mongoose.Types.ObjectId().toString();

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

    console.log('\n1. Logging in as member@test.com...');
    const memberAuth = await login('member@test.com', 'password123');
    const memberToken = memberAuth.token;
    console.log('Login successful! Captured JWT Token.');

    console.log('\n2. Adding a note as the member...');
    const addRes = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        paperId: FAKE_PAPER_ID,
        content: 'This paper uses a transformer architecture — worth citing in our methodology section.',
      }),
    });

    if (!addRes.ok) {
      throw new Error(`Add note failed: ${addRes.status} ${await addRes.text()}`);
    }
    const newNote = await addRes.json();
    console.log('Note created successfully:', newNote);

    console.log('\n3. Fetching notes for the paper...');
    const listRes = await fetch(`${BASE_URL}/notes/paper/${FAKE_PAPER_ID}`, {
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    if (!listRes.ok) {
      throw new Error(`Get notes failed: ${listRes.status} ${await listRes.text()}`);
    }
    const notes = await listRes.json();
    console.log(`Found ${notes.length} note(s). Author populated as:`, notes[0]?.authorId);

    console.log('\n4. Updating the note as the original author (should succeed)...');
    const updateRes = await fetch(`${BASE_URL}/notes/${newNote._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`,
      },
      body: JSON.stringify({ content: 'Updated: also check their evaluation metrics.' }),
    });
    if (!updateRes.ok) {
      throw new Error(`Update note failed: ${updateRes.status} ${await updateRes.text()}`);
    }
    console.log('Note updated successfully:', await updateRes.json());

    console.log('\n5. Logging in as a DIFFERENT user to test ownership protection...');
    const otherAuth = await login('leader@test.com', 'password123');
    const otherToken = otherAuth.token;

    const forbiddenRes = await fetch(`${BASE_URL}/notes/${newNote._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherToken}`,
      },
      body: JSON.stringify({ content: 'Trying to edit someone else\'s note...' }),
    });

    if (forbiddenRes.status === 403) {
      console.log('PASSED: Non-author correctly blocked with 403 Forbidden.');
    } else {
      throw new Error(
        `Ownership check FAILED — expected 403, got ${forbiddenRes.status} ${await forbiddenRes.text()}`
      );
    }

    console.log('\n--- All Notes API tests PASSED ---');
  } catch (error) {
    console.error('\n*** API Validation Test FAILED ***');
    console.error(error.message);
  }
}

runTests();