const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const {
  addComment,
  getProjectComments,
  editComment,
  deleteComment,
  addReply,
  reactToComment,
} = require('../controllers/commentController');

router.use(verifyToken);

router.post('/', addComment);
router.get('/project/:projectId', getProjectComments);
router.put('/:commentId', editComment);
router.delete('/:commentId', deleteComment);
router.post('/:commentId/reply', addReply);
router.post('/:commentId/react', reactToComment);

module.exports = router;