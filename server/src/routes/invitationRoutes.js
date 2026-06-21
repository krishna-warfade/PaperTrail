const express = require('express');
const router = express.Router();
const { sendInvitation, acceptInvitation } = require('../controllers/invitationController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/', sendInvitation);
router.post('/accept', acceptInvitation);

module.exports = router;
