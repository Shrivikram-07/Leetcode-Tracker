require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("./config/db");

const app = express();

/* ---------------- REQUEST LOGGING MIDDLEWARE ---------------- */
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[Request] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${duration}ms`);
    });
    next();
});

/* ---------------- SECURITY MIDDLEWARE ---------------- */
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(limiter);

/* ---------------- CORS ---------------- */
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

/* ---------------- BODY PARSER ---------------- */
app.use(express.json());

/* ---------------- ROUTES ---------------- */
const userRoutes = require("./routes/UserRoutes");
const problemRoutes = require("./routes/ProblemRoutes");
const leetcodeRoutes = require("./routes/LeetcodeRoutes");
const analyticsRoutes = require("./routes/AnalyticsRoutes");

app.use("/api/users", userRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/analytics", analyticsRoutes);

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
    res.send("Backend Working");
});

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} - server.js:61`);
});

server.on("error", (err) => {
    console.log("SERVER ERROR: - server.js:65", err);
});