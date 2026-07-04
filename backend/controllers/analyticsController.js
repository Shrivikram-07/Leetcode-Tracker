const db = require("../config/db");
const leetcodeService = require("../services/leetcodeService");
const analyticsService = require("../services/analyticsService");

const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const bypassCache = req.query.refresh === "true";

        // Get leetcode username from DB
        db.query(
            "SELECT leetcode_username FROM users WHERE id = ?",
            [userId],
            async (err, result) => {
                if (err) {
                    console.error("Get Analytics DB Error:", err);
                    return res.status(500).json({ message: "Database Error" });
                }

                if (result.length === 0 || !result[0].leetcode_username) {
                    return res.status(404).json({ message: "LeetCode account not connected" });
                }

                const username = result[0].leetcode_username;

                try {
                    // Fetch all data in parallel
                    // Crucial Fix: Fetch acSubmissions instead of contestHistory to feed the consistency & growth scoring engine
                    const [profile, solved, contest, submissionsData, skillData] = await Promise.all([
                        leetcodeService.getProfile(username, bypassCache),
                        leetcodeService.getSolvedStats(username, bypassCache),
                        leetcodeService.getContestData(username, bypassCache),
                        leetcodeService.getAcSubmissions(username, 20, bypassCache),
                        leetcodeService.getSkillStats(username, bypassCache)
                    ]);

                    if (!solved) {
                        return res.status(502).json({ message: "Failed to fetch profile stats from LeetCode API" });
                    }

                    // Generate calculations, passing submissionsData as the fourth parameter
                    const analytics = analyticsService.generateAnalytics(
                        profile,
                        solved,
                        contest,
                        submissionsData,
                        skillData
                    );

                    res.status(200).json({
                        success: true,
                        data: analytics
                    });
                } catch (apiError) {
                    console.error("LeetCode API Error inside Analytics Controller:", apiError);
                    if (apiError.response?.status === 429) {
                        return res.status(429).json({ message: "LeetCode API is temporarily rate limited. Please try again later." });
                    }
                    return res.status(502).json({ message: "Unable to connect to LeetCode" });
                }
            }
        );
    } catch (error) {
        console.error("Get Analytics Server Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getAnalytics
};
