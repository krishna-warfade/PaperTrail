const express = require('express');
const router = express.Router();
const { sendInvitation, acceptInvitation, verifyInvitationToken } = require('../controllers/invitationController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/verify/:token', verifyInvitationToken);

router.use(verifyToken);

router.post('/', sendInvitation);
router.post('/accept', acceptInvitation);

module.exports = router;
