const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, result) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (result.length > 0) {
                    return res.status(400).json({
                        message: "Email already exists"
                    });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const sql =
                    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

                db.query(
                    sql,
                    [username, email, hashedPassword],
                    (err, result) => {

                        if (err) {
                            console.log(err);

                            return res.status(500).json({
                                message: "Database Error"
                            });
                        }

                        res.status(201).json({
                            message: "User Registered Successfully"
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// LOGIN USER
const loginUser = (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Database Error"
                });
            }

            if (result.length === 0) {
                return res.status(400).json({
                    message: "User not found"
                });
            }

            const user = result[0];

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(400).json({
                    message: "Invalid Password"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.status(200).json({
                message: "Login Successful",
                token
            });
        }
    );
};

// GET USER PROFILE
const getUserProfile = (req, res) => {
    try {
        const userId = req.user.id;

        db.query(
            "SELECT id, username, email, leetcode_username, created_at FROM users WHERE id = ?",
            [userId],
            (err, result) => {
                if (err) {
                    console.log("Get Profile Error:", err);
                    return res.status(500).json({
                        message: "Database Error"
                    });
                }

                if (result.length === 0) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                res.status(200).json({
                    message: "Profile fetched successfully",
                    user: result[0]
                });
            }
        );
    } catch (error) {
        console.log("Profile Server Error:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};