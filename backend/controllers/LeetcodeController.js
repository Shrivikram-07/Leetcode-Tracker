const db = require("../config/db");
const leetcodeService = require("../services/leetcodeService");

// CONNECT LEETCODE ACCOUNT
const connectAccount = async (req, res) => {
    try {
        const { leetcode_username } = req.body;
        const userId = req.user.id;

        if (!leetcode_username) {
            return res.status(400).json({ message: "LeetCode username is required" });
        }

        // Verify username using external API, bypassing cache
        const profileData = await leetcodeService.getProfile(leetcode_username, true);
        
        if (!profileData) {
            return res.status(404).json({ message: "LeetCode username not found or invalid" });
        }

        // Update database
        db.query(
            "UPDATE users SET leetcode_username = ? WHERE id = ?",
            [leetcode_username, userId],
            (err, result) => {
                if (err) {
                    console.error("Connect Account DB Error:", err);
                    return res.status(500).json({ message: "Database Error" });
                }

                res.status(200).json({ message: "LeetCode account connected successfully!" });
            }
        );
    } catch (error) {
        console.error("Connect Account Server Error:", error);
        if (error.response?.status === 429) {
            return res.status(429).json({ message: "LeetCode API is temporarily rate limited. Please try again later." });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

// GET SYNCED PROFILE DATA
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const bypassCache = req.query.refresh === "true";

        // Get leetcode username from DB
        db.query(
            "SELECT leetcode_username FROM users WHERE id = ?",
            [userId],
            async (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Database Error" });
                }

                if (result.length === 0 || !result[0].leetcode_username) {
                    return res.status(404).json({ message: "LeetCode account not connected" });
                }

                const username = result[0].leetcode_username;

                try {
                    // Fetch data in parallel including submissions (Task 3 Fix)
                    const [profile, solved, contest, history, submissionsData] = await Promise.all([
                        leetcodeService.getProfile(username, bypassCache),
                        leetcodeService.getSolvedStats(username, bypassCache),
                        leetcodeService.getContestData(username, bypassCache),
                        leetcodeService.getContestHistory(username, bypassCache),
                        leetcodeService.getAcSubmissions(username, 20, bypassCache)
                    ]);

                    let acceptanceRate = 0;
                    if (solved && solved.acSubmissionNum && solved.totalSubmissionNum) {
                        const acAll = solved.acSubmissionNum.find(x => x.difficulty === "All")?.submissions || 0;
                        const totalAll = solved.totalSubmissionNum.find(x => x.difficulty === "All")?.submissions || 0;
                        if (totalAll > 0) {
                            acceptanceRate = (acAll / totalAll) * 100;
                        }
                    }
                    if (profile) {
                        profile.acceptanceRate = acceptanceRate;
                    }

                    res.status(200).json({
                        success: true,
                        data: {
                            profile,
                            solved,
                            contest,
                            history,
                            submissions: submissionsData?.submission || []
                        }
                    });
                } catch (apiError) {
                    console.error("LeetCode Profile Fetch Error:", apiError);
                    if (apiError.response?.status === 429) {
                        return res.status(429).json({ message: "LeetCode API is temporarily rate limited. Please try again later." });
                    }
                    return res.status(502).json({ message: "Unable to connect to LeetCode" });
                }
            }
        );
    } catch (error) {
        console.error("Get Synced Profile Server Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// IMPORT SOLVED PROBLEMS
const importProblems = async (req, res) => {
    try {
        const userId = req.user.id;

        db.query(
            "SELECT leetcode_username FROM users WHERE id = ?",
            [userId],
            async (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "Database Error" });
                }

                if (!result.length || !result[0].leetcode_username) {
                    return res.status(404).json({ message: "LeetCode account not connected" });
                }

                const username = result[0].leetcode_username;

                // STEP 1: Fetch from LeetCode (always bypass cache to get the absolute latest)
                let submissionsData;
                try {
                    submissionsData = await leetcodeService.getAcSubmissions(username, 20, true);
                } catch (apiErr) {
                    console.error("LeetCode API Error during import:", apiErr);
                    if (apiErr.response?.status === 429) {
                        return res.status(429).json({
                            message: "LeetCode API is temporarily rate limited. Please try again later."
                        });
                    }
                    return res.status(500).json({
                        message: "Failed to fetch submissions from LeetCode"
                    });
                }

                const submissions = submissionsData?.submission || [];

                if (!submissions.length) {
                    return res.status(400).json({
                        message: "No submissions found (check username or API response)"
                    });
                }

                // STEP 2: Deduplicate
                const uniqueMap = new Map();
                for (const sub of submissions) {
                    if (sub?.title && !uniqueMap.has(sub.title)) {
                        uniqueMap.set(sub.title, sub);
                    }
                }

                const problemsToImport = [...uniqueMap.values()];

                // STEP 3: Fetch existing DB data
                db.query(
                    "SELECT id, title, status FROM problems WHERE user_id = ?",
                    [userId],
                    async (err, existingProblems) => {
                        if (err) {
                            return res.status(500).json({
                                message: "Database Error fetching problems"
                            });
                        }

                        const existingMap = new Map(
                            existingProblems.map(p => [p.title, p])
                        );

                        let newImports = 0;
                        let updatedImports = 0;
                        let addedTitles = [];
                        let updatedTitles = [];
                        const tasks = [];

                        // STEP 4: Sync logic
                        for (const p of problemsToImport) {
                            const title = p.title;
                            const titleSlug = p.titleSlug || title.toLowerCase().replace(/\s+/g, "-");
                            const link = `https://leetcode.com/problems/${titleSlug}/`;
                            const existing = existingMap.get(title);

                            if (existing) {
                                if (existing.status !== "Solved") {
                                    tasks.push(
                                        new Promise((resolve) => {
                                            db.query(
                                                "UPDATE problems SET status = 'Solved' WHERE id = ?",
                                                [existing.id],
                                                () => {
                                                    updatedImports++;
                                                    updatedTitles.push(title);
                                                    resolve();
                                                }
                                            );
                                        })
                                    );
                                }
                            } else {
                                tasks.push(
                                    new Promise((resolve) => {
                                        db.query(
                                            `INSERT INTO problems 
                                            (title, difficulty, topic, status, leetcode_link, user_id)
                                            VALUES (?, ?, ?, ?, ?, ?)`,
                                            [
                                                title,
                                                "Unknown",
                                                "Unknown",
                                                "Solved",
                                                link,
                                                userId
                                            ],
                                            () => {
                                                newImports++;
                                                addedTitles.push(title);
                                                resolve();
                                            }
                                        );
                                    })
                                );
                            }
                        }

                        await Promise.all(tasks);

                        return res.status(200).json({
                            message: "Import complete!",
                            added: newImports,
                            updated: updatedImports,
                            addedTitles,
                            updatedTitles
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Import Problems Error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// CHANGE LEETCODE ACCOUNT
const changeAccount = async (req, res) => {
    try {
        const { leetcode_username } = req.body;
        const userId = req.user.id;

        if (!leetcode_username) {
            return res.status(400).json({ message: "LeetCode username is required" });
        }

        // Verify username using external API, bypassing cache
        const profileData = await leetcodeService.getProfile(leetcode_username, true);
        
        if (!profileData) {
            return res.status(404).json({ message: "LeetCode username not found or invalid" });
        }

        // Get old username to clear cache
        db.query(
            "SELECT leetcode_username FROM users WHERE id = ?",
            [userId],
            (err, selectResult) => {
                if (err) {
                    console.error("Change Account Select DB Error:", err);
                    return res.status(500).json({ message: "Database Error" });
                }

                const oldUsername = selectResult[0]?.leetcode_username;

                // Update database
                db.query(
                    "UPDATE users SET leetcode_username = ? WHERE id = ?",
                    [leetcode_username, userId],
                    (err, result) => {
                        if (err) {
                            console.error("Change Account DB Error:", err);
                            return res.status(500).json({ message: "Database Error" });
                        }

                        // Clear cache for old and new username
                        if (oldUsername) {
                            leetcodeService.clearCache(oldUsername);
                        }
                        leetcodeService.clearCache(leetcode_username);

                        res.status(200).json({ message: "LeetCode username changed successfully!" });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Change Account Server Error:", error);
        if (error.response?.status === 429) {
            return res.status(429).json({ message: "LeetCode API is temporarily rate limited. Please try again later." });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    connectAccount,
    getProfile,
    importProblems,
    changeAccount
};
