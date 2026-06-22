const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function testInvitations() {
  try {
    console.log('--- Invitation System Test ---\n');

    console.log('1. Logging in as leader...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'leader@test.com', password: 'password123' })
    });

    if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
    const { token } = await loginRes.json();
    console.log('Login successful.');

    console.log('\n2. Fetching projects...');
    const projectsRes = await fetch(`${BASE_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projects = await projectsRes.json();

    if (projects.length === 0) throw new Error('No projects found. Create one first.');
    const projectId = projects[0]._id;
    console.log(`Using project: ${projects[0].title} (${projectId})`);

    const targetEmail = process.env.EMAIL_USER || 'test@example.com';

    console.log(`\n3. Sending invitation email to ${targetEmail}...`);
    const inviteRes = await fetch(`${BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: targetEmail,
        projectId,
        role: 'MEMBER'
      })
    });

    if (!inviteRes.ok) {
      const errText = await inviteRes.text();
      throw new Error(`Send invitation failed: ${inviteRes.status} ${errText}`);
    }

    const inviteData = await inviteRes.json();
    console.log('Invitation sent successfully!');
    console.log(`- Token: ${inviteData.invitation.token.substring(0, 20)}...`);
    console.log(`- Status: ${inviteData.invitation.status}`);
    console.log(`- To: ${inviteData.invitation.email}`);

    console.log('\n--- Invitation System Test PASSED ---');
    console.log(`\nCheck ${targetEmail} inbox for the invitation email!`);
  } catch (error) {
    console.error('\n*** Test FAILED ***');
    console.error(error.message);
  }
}

testInvitations();
