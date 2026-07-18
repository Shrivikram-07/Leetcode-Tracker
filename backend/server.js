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
        console.log(`[Request] ${req.method} ${req.originalUrl}  Status: ${res.statusCode}  Time: ${duration}ms - server.js:17`);
    });
    next();
});

/* ---------------- SECURITY MIDDLEWARE ---------------- */
app.use(helmet());

// Trust proxy for reverse proxies (like Render/Vercel)
app.set("trust proxy", 1);

/* ---------------- CORS ---------------- */
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "https://leetcode-tracker-silk.vercel.app"
];

if (process.env.FRONTEND_URL) {
    const urls = process.env.FRONTEND_URL.split(",").map(url => url.trim());
    allowedOrigins.push(...urls);
}

app.use(cors({
    origin: "https://leetcode-tracker-silk.vercel.app",
    credentials: true
}));

/* ---------------- RATE LIMITERS ---------------- */

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { message: "Too many login or registration attempts, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS"
});

// Relaxed rate limiter for dashboard/API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { message: "Too many requests, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip preflight requests
        if (req.method === "OPTIONS") return true;
        
        // Skip auth routes as they have their own strict limiter
        const path = req.originalUrl.split("?")[0];
        if (path === "/api/users/login" || path === "/api/users/register") return true;

        // Skip safe GET requests that can be served from cache
        if (req.method === "GET" && (
            path === "/api/leetcode/profile" ||
            path === "/api/problems" ||
            path === "/api/users/dashboard" ||
            path === "/api/users/profile" ||
            path === "/api/analytics"
        )) {
            return true;
        }
        return false;
    }
});

// Apply rate limiters
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use(apiLimiter);

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
    console.log(`Server running on port ${PORT} - server.js:74`);
});

server.on("error", (err) => {
    console.log("SERVER ERROR: - server.js:78", err);
});