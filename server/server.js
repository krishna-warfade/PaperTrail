require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const invitationRoutes = require('./src/routes/invitationRoutes');
const paperRoutes = require('./src/routes/paperRoutes');
const noteRoutes = require('./src/routes/noteRoutes');

const progressRoutes = require('./src/routes/progressRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const activityRoutes = require('./src/routes/activityRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/notes', noteRoutes);

app.use('/api/progress', progressRoutes);  
app.use('/api/comments', commentRoutes);  
app.use('/api/activity', activityRoutes);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
