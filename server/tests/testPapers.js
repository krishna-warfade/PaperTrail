const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function testPaperUpload() {
  try {
    console.log('--- Paper Upload Test ---\n');

    console.log('1. Logging in as leader...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'leader@test.com', password: 'password123' }),
    });
    if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
    const { token } = await loginRes.json();
    console.log('Login successful.');

    console.log('\n2. Fetching projects...');
    const projectsRes = await fetch(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const projects = await projectsRes.json();
    if (projects.length === 0) throw new Error('No projects found.');
    const projectId = projects[0]._id;
    console.log(`Using project: ${projects[0].title} (${projectId})`);

    const testPdfPath = path.join(__dirname, 'test-paper.pdf');

    // Structurally valid minimal 1-page PDF
    const base64Pdf = 'JVBERi0xLjEKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMDkgMDAwMDAgbgowMDAwMDAwMDU2IDAwMDAwIG4KMDAwMDAwMDAxMTEgMDAwMDAgbgp0cmFpbGVyPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PnN0YXJ0eHJlZgoxNzIKJSVFT0Y=';
    fs.writeFileSync(testPdfPath, Buffer.from(base64Pdf, 'base64'));
    console.log('\n3. Created test PDF file.');

    console.log('\n4. Uploading paper to Cloudinary...');
    const formData = new FormData();
    formData.append('title', 'Machine Learning in Research');
    formData.append('authors', 'Krishna Warfade, Team Member');
    formData.append('year', '2026');
    formData.append('keywords', 'AI, Machine Learning, Research');
    formData.append('projectId', projectId);

    const fileBuffer = fs.readFileSync(testPdfPath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('pdf', blob, 'test-paper.pdf');

    const uploadRes = await fetch(`${BASE_URL}/papers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Upload failed: ${uploadRes.status} ${errText}`);
    }

    const paper = await uploadRes.json();
    console.log('Paper uploaded successfully!');
    console.log(`- Title: ${paper.title}`);
    console.log(`- Authors: ${paper.authors.join(', ')}`);
    console.log(`- Year: ${paper.year}`);
    console.log(`- Keywords: ${paper.keywords.join(', ')}`);
    console.log(`- PDF URL: ${paper.pdfUrl}`);
    console.log(`- Paper ID: ${paper._id}`);

    console.log('\n5. Listing project papers...');
    const listRes = await fetch(`${BASE_URL}/papers/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const papers = await listRes.json();
    console.log(`Found ${papers.length} paper(s) in project.`);

    console.log(`\n6. Deleting paper ${paper._id}...`);
    const deleteRes = await fetch(`${BASE_URL}/papers/${paper._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      throw new Error(`Delete failed: ${deleteRes.status} ${errText}`);
    }

    const deleteData = await deleteRes.json();
    console.log(deleteData.message);

    fs.unlinkSync(testPdfPath);

    console.log('\n--- Paper Upload Test PASSED ---');
  } catch (error) {
    console.error('\n*** Test FAILED ***');
    console.error(error.message);
  }
}

testPaperUpload();
