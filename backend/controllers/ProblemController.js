const db = require("../config/db");

const mapDifficulty = (diff) => {
    if (!diff) return "Easy";
    const d = diff.toLowerCase();
    if (d === "easy") return "Easy";
    if (d === "medium") return "Medium";
    if (d === "hard") return "Hard";
    return "Easy";
};

const sanitizeTopic = (topic) => {
    if (!topic) return "General";
    let cleaned = topic.trim().replace(/^#+/, ""); // strip leading #
    if (!cleaned || cleaned.toLowerCase() === "unknown") {
        return "General";
    }
    return cleaned;
};

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

        const finalTitle = title.trim();
        const finalDifficulty = mapDifficulty(difficulty);
        const finalTopic = sanitizeTopic(topic);
        const finalStatus = status ? status.trim() : "Not Started";

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
                    return res.status(400).json({
                        message: "You have reached the maximum limit of 15 tracked problems. Delete an existing problem before adding a new one."
                    });
                }

                const sql = `
                    INSERT INTO problems (title, difficulty, topic, status, leetcode_link, notes, user_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [finalTitle, finalDifficulty, finalTopic, finalStatus, leetcode_link || null, notes || null, userId],
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

                const sanitizedResults = results.map(p => ({
                    ...p,
                    difficulty: mapDifficulty(p.difficulty),
                    topic: sanitizeTopic(p.topic),
                    status: p.status === "To Do" ? "Not Started" : (p.status === "Attempting" ? "Attempted" : (p.status || "Not Started"))
                }));

                res.status(200).json(sanitizedResults);
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

                const p = result[0];
                const sanitized = {
                    ...p,
                    difficulty: mapDifficulty(p.difficulty),
                    topic: sanitizeTopic(p.topic),
                    status: p.status === "To Do" ? "Not Started" : (p.status === "Attempting" ? "Attempted" : (p.status || "Not Started"))
                };

                res.status(200).json(sanitized);
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

        const finalTitle = title.trim();
        const finalDifficulty = mapDifficulty(difficulty);
        const finalTopic = sanitizeTopic(topic);
        const finalStatus = status ? status.trim() : "Not Started";
        const mappedStatus = finalStatus === "To Do" ? "Not Started" : (finalStatus === "Attempting" ? "Attempted" : finalStatus);

        const sql = `
            UPDATE problems
            SET title = ?, difficulty = ?, topic = ?, status = ?, leetcode_link = ?, notes = ?
            WHERE id = ? AND user_id = ?
        `;

        db.query(
            sql,
            [finalTitle, finalDifficulty, finalTopic, mappedStatus, leetcode_link || null, notes || null, problemId, userId],
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
