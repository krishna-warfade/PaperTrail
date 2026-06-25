const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const {
  addProgressLog,
  getProjectProgress,
  reactToProgress,
  editProgressLog,
} = require('../controllers/progressController');

router.use(verifyToken);

router.post('/', addProgressLog);
router.get('/project/:projectId', getProjectProgress);
router.post('/:progressId/react', reactToProgress);
router.put('/:progressId', editProgressLog);

module.exports = router;