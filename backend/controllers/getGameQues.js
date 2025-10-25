/* eslint-disable */
const connection = require('../db'); // import the sql connection

// GET questions FROM database
const getGameQuestions = async (req, res) => {
    try {
        const [rows] = await connection.query(
            // --- CRITICAL CHANGE: Added 'correct_answer' to the SELECT statement ---
            "SELECT question_id, question_text, option_a, option_b, option_c, option_d, correct_answer FROM Questions ORDER BY RAND() LIMIT 5"
        );
        res.json(rows);

    } catch (error) {
        console.error('Failed to fetch questions: ', error);
        res.status(500).json({ error: 'Failed to fetch questions' })
    }

};

// CHECK answers FROM FRONTEND
const checkGameQuestion = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'You need to log in to play game' });
    }

    const user_id = req.session.user.user_id;
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ error: 'Invalid Answers' });
    }

    try {
        const question_id = answers.map(q => q.question_id);
        const [rows] = await connection.query(`SELECT question_id, correct_answer FROM Questions WHERE question_id In (?)`, [question_id]);

        let correctCount = 0;
        for (let answerObj of answers) {
            const correct = rows.find(row => row.question_id === answerObj.question_id);
            if (correct && correct.correct_answer === answerObj.user_answer) {
                correctCount++;
            }
        }

        const pointsToAdd = correctCount * 50;

        await connection.query(
            'UPDATE User SET current_points = current_points + ? WHERE user_id = ?',
            [pointsToAdd, user_id]
        );

        req.session.user.current_points += pointsToAdd;

        res.json({
            message: 'Answers submitted',
            correct: correctCount,
            totalAddedPoints: pointsToAdd,
            newTotalPoints: req.session.user.current_points
        });

    } catch (error) {
        console.error('Failed to fetch questions: ', error);
        res.status(500).json({ error: 'Failed to fetch questions' })
    }
};

module.exports = { getGameQuestions, checkGameQuestion };