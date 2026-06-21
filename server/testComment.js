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
  // 201 = created fresh, 400 = already exists — both are fine for our purposes,
  // we just need the account to exist before we try logging in.
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

    console.log('\n3. Adding a comment as the faculty guide...');
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
    console.log('Faculty comment created.');

    await wait(1200);

    console.log('\n4. Adding a comment as the leader (any member can comment, not just faculty)...');
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
    console.log('Leader comment created.');

    console.log('\n5. Fetching all comments for the project...');
    const listRes = await fetch(`${BASE_URL}/comments/project/${projectId}`, {
      headers: { Authorization: `Bearer ${leaderAuth.token}` },
    });
    if (!listRes.ok) {
      throw new Error(`Get comments failed: ${listRes.status} ${await listRes.text()}`);
    }
    const comments = await listRes.json();
    console.log(`Found ${comments.length} comment(s).`);

    console.log('\n6. Validating sort order (newest first)...');
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

    console.log('\n7. Validating populated author name AND role (required by the spec)...');
    const facultyEntry = comments.find((c) => c.authorId.role === 'FACULTY');
    if (!facultyEntry) {
      throw new Error('FAILED: could not find the faculty comment in the list');
    }
    if (!facultyEntry.authorId.name) {
      throw new Error('FAILED: authorId.name was not populated');
    }
    console.log(
      `PASSED: faculty comment populated as { name: '${facultyEntry.authorId.name}', role: '${facultyEntry.authorId.role}' } — frontend can now show a Faculty badge.`
    );

    console.log('\n--- All Comment API tests PASSED ---');
  } catch (error) {
    console.error('\n*** API Validation Test FAILED ***');
    console.error(error.message);
  }
}

runTests();