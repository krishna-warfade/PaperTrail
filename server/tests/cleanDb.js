const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Paper = require('../src/models/Paper');
const Note = require('../src/models/Note');
const Invitation = require('../src/models/Invitation');
const ProgressLog = require('../src/models/progressLog');
const Comment = require('../src/models/comment');

async function cleanDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!\n');

    console.log('--- Wiping Test Projects and Associated Data ---');

    // Find all projects with "test" in title
    const testProjects = await Project.find({
      $or: [
        { title: { $regex: /test/i } },
        { title: { $regex: /automated/i } }
      ]
    });

    const testProjectIds = testProjects.map(p => p._id);
    console.log(`Found ${testProjects.length} test project(s) to remove.`);

    if (testProjectIds.length > 0) {
      // Delete progress logs
      const progressResult = await ProgressLog.deleteMany({ projectId: { $in: testProjectIds } });
      console.log(`- Deleted ${progressResult.deletedCount} progress log(s).`);

      // Delete comments
      const commentResult = await Comment.deleteMany({ projectId: { $in: testProjectIds } });
      console.log(`- Deleted ${commentResult.deletedCount} comment(s).`);

      // Delete notes
      const noteResult = await Note.deleteMany({
        $or: [
          { projectId: { $in: testProjectIds } },
          { paperId: { $in: await Paper.find({ projectId: { $in: testProjectIds } }).distinct('_id') } }
        ]
      });
      console.log(`- Deleted ${noteResult.deletedCount} note(s).`);

      // Delete papers
      const paperResult = await Paper.deleteMany({ projectId: { $in: testProjectIds } });
      console.log(`- Deleted ${paperResult.deletedCount} paper(s).`);

      // Delete invitations
      const inviteResult = await Invitation.deleteMany({ projectId: { $in: testProjectIds } });
      console.log(`- Deleted ${inviteResult.deletedCount} invitation(s).`);

      // Delete projects
      const projectResult = await Project.deleteMany({ _id: { $in: testProjectIds } });
      console.log(`- Deleted ${projectResult.deletedCount} project(s).`);
    }

    console.log('\n--- Wiping Temporary and Test Users ---');

    const userResult = await User.deleteMany({
      $and: [
        {
          $or: [
            { email: { $regex: /new_test_user/i } },
            { email: { $regex: /example\.com/i } },
            { name: { $regex: /temp/i } }
          ]
        },
        { email: { $nin: ['leader@test.com', 'member@test.com', 'faculty@test.com'] } }
      ]
    });
    console.log(`- Deleted ${userResult.deletedCount} temporary user(s).`);

    console.log('\n--- Cleaning Dangling Data (Dangling from Deleted/Missing Projects) ---');
    const existingProjectIds = await Project.find().distinct('_id');

    const danglingProgress = await ProgressLog.deleteMany({ projectId: { $nin: existingProjectIds } });
    console.log(`- Deleted ${danglingProgress.deletedCount} dangling progress log(s).`);

    const danglingComments = await Comment.deleteMany({ projectId: { $nin: existingProjectIds } });
    console.log(`- Deleted ${danglingComments.deletedCount} dangling comment(s).`);

    const danglingPapers = await Paper.deleteMany({ projectId: { $nin: existingProjectIds } });
    console.log(`- Deleted ${danglingPapers.deletedCount} dangling paper(s).`);

    const danglingInvites = await Invitation.deleteMany({ projectId: { $nin: existingProjectIds } });
    console.log(`- Deleted ${danglingInvites.deletedCount} dangling invitation(s).`);

    const existingPaperIds = await Paper.find().distinct('_id');
    const danglingNotes = await Note.deleteMany({ paperId: { $nin: existingPaperIds } });
    console.log(`- Deleted ${danglingNotes.deletedCount} dangling note(s).`);

    console.log('\nDatabase cleanup finished successfully!');
  } catch (err) {
    console.error('Error cleaning database:', err);
  } finally {
    await mongoose.connection.close();
  }
}

cleanDatabase();
