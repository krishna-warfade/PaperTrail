const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authControllers');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', verifyToken, (req, res) => {
    res.json(req.user);
});

module.exports = router;
