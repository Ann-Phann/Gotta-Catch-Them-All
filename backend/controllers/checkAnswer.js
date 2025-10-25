// const connection = require("../db");

// const checkAnswer = (req, res) => {
//     // destruct the request body from the client
//     const { question_id, selected_option } = req.body;

//     // check and output error if missing information
//     if (!question_id || !selected_option) {
//         return res.status(400).json({error: "Missing question id or selected option"});
//     }

//     // then get the correct answer
//     // Prepares a parameterized SQL query to get the correct answer for the specific question
//     const query = "SELECT correct_answer FROM Questions WHERE question_id = ?";
//     return connection.query(query, [question_id], (error, results) => {
//         // run this after runing the query
//         if (error) {
//             return res.status(500).json({ error: "DB error in getting correct answer" });
//         }

//         // check if the id is in the database
//         if (results.length === 0) {
//             return res.status(404).json({ error: "Question not found" });
//         }

//         // check if match
//         if (results[0].correct_answer === selected_option) {
//             res.json({ correct: true });
//         } else {
//             res.json({ correct: false });
//         }
//     });

// };

// module.exports = { checkAnswer };
