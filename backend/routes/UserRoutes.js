const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile
} = require("../controllers/UserControllers");

const authMiddleware = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Test Route
router.get("/test", (req, res) => {
    res.send("User Routes Working");
});

// Protected Profile Route
router.get("/profile", authMiddleware, getUserProfile);

// Protected Dashboard Route
router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: `Welcome ${req.user.email}`,
        userId: req.user.id
    });
});

module.exports = router;
