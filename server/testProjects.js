const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  try {
    console.log('--- Starting Projects API Validation Test ---');

    console.log('\n1. Logging in as leader@test.com...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'leader@test.com',
        password: 'password123'
      })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
    }

    const authData = await loginRes.json();
    const token = authData.token;
    console.log('Login successful! Captured JWT Token.');

    console.log('\n2. Creating a new project...');
    const projectRes = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Automated Test Research Project',
        description: 'Testing the Project Management endpoints for PaperTrail'
      })
    });

    if (!projectRes.ok) {
      throw new Error(`Create project failed: ${projectRes.status} ${await projectRes.text()}`);
    }

    const newProject = await projectRes.json();
    console.log('Project created successfully:', newProject);

    console.log('\n3. Retrieving list of user projects...');
    const listRes = await fetch(`${BASE_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!listRes.ok) {
      throw new Error(`Get projects list failed: ${listRes.status} ${await listRes.text()}`);
    }

    const projects = await listRes.json();
    console.log(`Successfully retrieved project list! Found ${projects.length} project(s).`);

    const projectId = newProject._id;
    console.log(`\n4. Fetching detailed data for Project ID: ${projectId}...`);
    const detailsRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!detailsRes.ok) {
      throw new Error(`Get project details failed: ${detailsRes.status} ${await detailsRes.text()}`);
    }

    const projectDetails = await detailsRes.json();
    console.log('Retrieved Project Details (with populated leader information):');
    console.log(`- Title: ${projectDetails.title}`);
    console.log(`- Leader Name: ${projectDetails.leader.name}`);
    console.log(`- Leader Email: ${projectDetails.leader.email}`);
    console.log(`- Members Count: ${projectDetails.members.length}`);

  } catch (error) {
    console.error('\n*** API Validation Test FAILED ***');
    console.error(error.message);
  }
}

runTests();
