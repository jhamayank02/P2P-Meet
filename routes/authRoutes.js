const express = require('express');
const { login, register, checkIsLoggedIn } = require('../controllers/auth');
const router = express.Router();

router.post('/login', login);

router.post('/register', register);

router.get('/check-is-logged-in', checkIsLoggedIn);

module.exports = router;