const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  removeMember
} = require('../controllers/projectController');
const { verifyToken, authorize } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', authorize('LEADER'), createProject);

router.get('/', getProjects);

router.get('/:id', getProjectById);

router.delete('/:projectId/members/:memberId', removeMember);

module.exports = router;
