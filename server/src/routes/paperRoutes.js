const express = require('express');
const router = express.Router();
const { uploadPaper, getProjectPapers, deletePaper } = require('../controllers/paperController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(verifyToken);

router.post('/', upload.single('pdf'), uploadPaper);
router.get('/project/:projectId', getProjectPapers);
router.delete('/:id', deletePaper);

module.exports = router;
