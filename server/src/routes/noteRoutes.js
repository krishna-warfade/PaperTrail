const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware');
const {
  addNote,
  getNotesForPaper,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');

router.use(verifyToken);

router.post('/', addNote);
router.get('/paper/:paperId', getNotesForPaper);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;