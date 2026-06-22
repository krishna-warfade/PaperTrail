const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const { addComment, getProjectComments } = require('../controllers/commentController');

router.use(verifyToken);

router.post('/', addComment);
router.get('/project/:projectId', getProjectComments);

module.exports = router;