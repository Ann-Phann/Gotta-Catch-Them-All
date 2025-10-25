const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route: Add a new user
router.post('/add-user', adminController.addUser);

// Route: Delete a user by ID
router.delete('/delete-user/:id', adminController.deleteUser);

// Route: List all users
router.get('/list-users', adminController.listUsers);

// Route: Edit user details by ID
router.put('/edit-user/:id', adminController.editUser);

module.exports = router;