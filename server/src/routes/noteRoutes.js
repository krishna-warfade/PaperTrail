const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const {
  addNote,
  getNotesForPaper,
  updateNote,
} = require('../controllers/noteController');

router.use(verifyToken);

router.post('/', addNote);
router.get('/paper/:paperId', getNotesForPaper);
router.put('/:id', updateNote);

module.exports = router;