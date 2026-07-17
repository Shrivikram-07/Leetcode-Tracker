const db = require("../config/db");

// CREATE PROBLEM
const createProblem = (req, res) => {
    try {
        const { title, difficulty, topic, status, leetcode_link, notes } = req.body;
        const userId = req.user.id;

        if (!title || !difficulty || !topic) {
            return res.status(400).json({
                message: "Title, difficulty, and topic are required"
            });
        }

        db.query(
            "SELECT COUNT(*) AS count FROM problems WHERE user_id = ?",
            [userId],
            (err, countResult) => {
                if (err) {
                    console.log("Count Problem Error:", err);
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (countResult && countResult[0] && countResult[0].count >= 15) {
                    return res.status(403).json({
                        message: "You can only track up to 15 custom problems."
                    });
                }

                const sql = `
                    INSERT INTO problems (title, difficulty, topic, status, leetcode_link, notes, user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [title, difficulty, topic, status || "To Do", leetcode_link || null, notes || null, userId],
                    (err, result) => {
                        if (err) {
                            console.log("Create Problem Error:", err);
                            return res.status(500).json({
                                                            message: "Database Error"
                            });
                        }

                        res.status(201).json({
                            message: "Problem created successfully",
                            problemId: result.insertId
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.log("Server Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET ALL PROBLEMS (For the logged-in user)
const getProblems = (req, res) => {
    try {
        const userId = req.user.id;

        db.query(
            "SELECT * FROM problems WHERE user_id = ? ORDER BY created_at DESC",
            [userId],
            (err, results) => {
                if (err) {
                    console.log("Get Problems Error:", err);
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                res.status(200).json(results);
            }
        );
    } catch (error) {
        console.log("Server Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET SINGLE PROBLEM BY ID
const getProblem = (req, res) => {
    try {
        const problemId = req.params.id;
        const userId = req.user.id;

        db.query(
            "SELECT * FROM problems WHERE id = ? AND user_id = ?",
            [problemId, userId],
            (err, result) => {
                if (err) {
                    console.log("Get Problem Error:", err);
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (result.length === 0) {
                    return res.status(404).json({
                        message: "Problem not found or unauthorized"
                    });
                }

                res.status(200).json(result[0]);
            }
        );
    } catch (error) {
        console.log("Server Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// UPDATE PROBLEM
const updateProblem = (req, res) => {
    try {
        const problemId = req.params.id;
        const userId = req.user.id;
        const { title, difficulty, topic, status, leetcode_link, notes } = req.body;

        if (!title || !difficulty || !topic) {
            return res.status(400).json({
                message: "Title, difficulty, and topic are required"
            });
        }

        const sql = `
            UPDATE problems
            SET title = ?, difficulty = ?, topic = ?, status = ?, leetcode_link = ?, notes = ?
            WHERE id = ? AND user_id = ?
        `;

        db.query(
            sql,
            [title, difficulty, topic, status || "To Do", leetcode_link || null, notes || null, problemId, userId],
            (err, result) => {
                if (err) {
                    console.log("Update Problem Error:", err);
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Problem not found or unauthorized"
                    });
                }

                res.status(200).json({
                    message: "Problem updated successfully"
                });
            }
        );
    } catch (error) {
        console.log("Server Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// DELETE PROBLEM
const deleteProblem = (req, res) => {
    try {
        const problemId = req.params.id;
        const userId = req.user.id;

        db.query(
            "DELETE FROM problems WHERE id = ? AND user_id = ?",
            [problemId, userId],
            (err, result) => {
                if (err) {
                    console.log("Delete Problem Error:", err);
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Problem not found or unauthorized"
                    });
                }

                res.status(200).json({
                    message: "Problem deleted successfully"
                });
            }
        );
    } catch (error) {
        console.log("Server Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    createProblem,
    getProblems,
    getProblem,
    updateProblem,
    deleteProblem
};
