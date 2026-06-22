const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const { getProjectActivity } = require('../controllers/activityController');

router.use(verifyToken);

router.get('/project/:projectId', getProjectActivity);

module.exports = router;