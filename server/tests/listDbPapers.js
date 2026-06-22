require('dotenv').config();
const mongoose = require('mongoose');
const Paper = require('../src/models/Paper');
const connectDB = require('../src/config/db');

async function listPapers() {
  try {
    await connectDB();
    console.log('Fetching papers from database...');
    const papers = await Paper.find({}).sort({ createdAt: -1 });
    
    console.log(`\nFound ${papers.length} paper(s) in database:\n`);
    papers.forEach((p, idx) => {
      console.log(`[Paper ${idx + 1}]`);
      console.log(`- ID: ${p._id}`);
      console.log(`- Title: ${p.title}`);
      console.log(`- URL: ${p.pdfUrl}`);
      console.log(`- Created At: ${p.createdAt}`);
      console.log('---');
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

listPapers();
