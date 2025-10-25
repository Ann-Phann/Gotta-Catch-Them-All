const express = require('express');
const router = express.Router();
const { getUserCollection } = require('../controllers/myCollectionController');

// GET /collection/:userId — get the card collection for a user
router.get('/:userId', getUserCollection);

module.exports = router;