const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const { addProgressLog, getProjectProgress } = require('../controllers/progressController');

router.use(verifyToken);

router.post('/', addProgressLog);
router.get('/project/:projectId', getProjectProgress);

module.exports = router;