const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getProfile, logoutUser, checkLogin, getUser } = require('../controllers/authRouteController');
// register router
router.post('/register', registerUser);

// register router
router.post('/login', loginUser);

// profile router
router.get('/profile', getProfile);

//logout router
router.post('/logout', logoutUser);

// checkLogin router
router.get('/checkLogin', checkLogin);

// get User
router.get('/getUser', getUser);

module.exports = router;
