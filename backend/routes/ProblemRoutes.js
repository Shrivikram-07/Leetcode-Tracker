const express = require("express");
const router = express.Router();

const {
    createProblem,
    getProblems,
    getProblem,
    updateProblem,
    deleteProblem
} = require("../controllers/ProblemController");

const authMiddleware = require("../middleware/authMiddleware");

// All problem routes are protected by authMiddleware
router.use(authMiddleware);

// CRUD Routes
router.post("/", createProblem);
router.get("/", getProblems);
router.get("/:id", getProblem);
router.put("/:id", updateProblem);
router.delete("/:id", deleteProblem);

module.exports = router;
