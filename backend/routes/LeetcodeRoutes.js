const express = require("express");
const router = express.Router();

const {
    connectAccount,
    getProfile,
    importProblems,
    changeAccount
} = require("../controllers/LeetcodeController");

const authMiddleware = require("../middleware/authMiddleware");

// Connect LeetCode Account
router.post("/connect", authMiddleware, connectAccount);

// Change LeetCode Account Username
router.put("/change", authMiddleware, changeAccount);

// Get synced profile data (Profile, Solved, Contest, History)
router.get("/profile", authMiddleware, getProfile);

// Import solved problems from LeetCode
router.post("/import", authMiddleware, importProblems);

module.exports = router;
