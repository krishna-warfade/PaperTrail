const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(
      `Login failed: ${res.status} ${await res.text()}`
    );
  }

  return res.json();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  try {
    console.log('=== Activity Feed Validation Test ===');

    // LOGIN
    console.log('\n1. Logging in...');
    const auth = await login(
      'leader@test.com',
      'password123'
    );

    const token = auth.token;
    console.log('Login successful.');

    // CREATE PROJECT
    console.log('\n2. Creating project...');
    const projectRes = await fetch(
      `${BASE_URL}/projects`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Activity Feed Test Project',
          description:
            'Project created for activity feed validation',
        }),
      }
    );

    if (!projectRes.ok) {
      throw new Error(
        `Create project failed: ${projectRes.status}`
      );
    }

    const project = await projectRes.json();
    const projectId = project._id;

    console.log('Project created:', projectId);

    // CREATE PROGRESS LOG
    console.log('\n3. Creating progress log...');
    const progressRes = await fetch(
      `${BASE_URL}/progress`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          description:
            'Created literature review folder',
        }),
      }
    );

    if (!progressRes.ok) {
      throw new Error(
        `Progress log creation failed`
      );
    }

    await wait(1000);

    // CREATE COMMENT
    console.log('\n4. Creating comment...');
    const commentRes = await fetch(
      `${BASE_URL}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          content:
            'This is a test comment for activity feed.',
        }),
      }
    );

    if (!commentRes.ok) {
      throw new Error(
        `Comment creation failed: ${commentRes.status}`
      );
    }

    await wait(1000);

    // FETCH ACTIVITY FEED
    console.log('\n5. Fetching activity feed...');
    const feedRes = await fetch(
      `${BASE_URL}/activity/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!feedRes.ok) {
      throw new Error(
        `Fetch activity feed failed: ${feedRes.status}`
      );
    }

    const feed = await feedRes.json();

    console.log(
      `Fetched ${feed.length} activity item(s)`
    );

    // VALIDATE RESPONSE
    console.log('\n6. Validating feed structure...');

    if (!Array.isArray(feed)) {
      throw new Error(
        'FAILED: response is not an array'
      );
    }

    if (feed.length === 0) {
      throw new Error(
        'FAILED: activity feed is empty'
      );
    }

    console.log(
      'PASSED: feed returned successfully.'
    );

    // VALIDATE SORT ORDER
    console.log('\n7. Validating date sorting...');

    for (let i = 0; i < feed.length - 1; i++) {
      const current = new Date(feed[i].date);
      const next = new Date(feed[i + 1].date);

      if (current < next) {
        throw new Error(
          'FAILED: feed is not sorted newest-first'
        );
      }
    }

    console.log(
      'PASSED: feed sorted by date descending.'
    );

    // VALIDATE TYPES
    console.log('\n8. Validating activity types...');

    const types = feed.map((item) => item.type);

    if (!types.includes('PROGRESS')) {
      throw new Error(
        'FAILED: PROGRESS activity missing'
      );
    }

    if (!types.includes('COMMENT')) {
      throw new Error(
        'FAILED: COMMENT activity missing'
      );
    }

    console.log(
      'PASSED: activity types found:',
      [...new Set(types)]
    );

    // VALIDATE USER POPULATION
    console.log('\n9. Validating user info...');

    const item = feed[0];

    if (
      !item.user ||
      !item.user.name ||
      !item.user.role
    ) {
      throw new Error(
        'FAILED: user lookup/population missing'
      );
    }

    console.log(
      'PASSED: user populated:',
      item.user.name,
      item.user.role
    );

    // VALIDATE REQUIRED FIELDS
    console.log('\n10. Validating schema...');

    feed.forEach((entry) => {
      if (
        !entry.type ||
        !entry.text ||
        !entry.date
      ) {
        throw new Error(
          'FAILED: missing required fields'
        );
      }
    });

    console.log(
      'PASSED: all entries contain required fields.'
    );

    console.log(
      '\n=== ALL ACTIVITY FEED TESTS PASSED ==='
    );
  } catch (err) {
    console.error(
      '\n*** ACTIVITY FEED TEST FAILED ***'
    );
    console.error(err.message);
  }
}

runTests();