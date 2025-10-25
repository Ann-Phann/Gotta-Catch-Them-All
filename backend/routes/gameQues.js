const express = require('express');
const router = express.Router();

// declare controllers
const { getGameQuestions, checkGameQuestion } = require("../controllers/getGameQues");

// when user get into /game url --> get questions first
router.get('/questions', getGameQuestions);

// Route to check the answer for a specific question
router.post('/check', checkGameQuestion);

module.exports = router;

