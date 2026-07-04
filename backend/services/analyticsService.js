/**
 * AI-powered Coding Analytics Engine (Algorithmic Insights)
 * Calculates details, scores, growth, and recommendations from LeetCode data.
 */

const calculateDifficultyBalance = (solved) => {
    const easy = solved?.easySolved || 0;
    const medium = solved?.mediumSolved || 0;
    const hard = solved?.hardSolved || 0;
    const total = easy + medium + hard;

    if (total === 0) {
        return {
            easyPct: 0,
            mediumPct: 0,
            hardPct: 0,
            level: "Needs Improvement",
            explanation: "No problems solved yet. Start solving problems of different difficulties to build balance."
        };
    }

    const easyPct = (easy / total) * 100;
    const mediumPct = (medium / total) * 100;
    const hardPct = (hard / total) * 100;

    let level = "Good";
    let explanation = "Your difficulty balance is stable. Try focusing slightly more on medium and hard problems.";

    // Optimal balance is roughly 25-45% Easy, 40-60% Medium, 10-30% Hard
    if (easyPct >= 20 && easyPct <= 45 && mediumPct >= 40 && mediumPct <= 60 && hardPct >= 10 && hardPct <= 30) {
        level = "Excellent";
        explanation = "Perfect balance! You are practicing a great mix of core concepts, algorithmic depth, and challenging implementations.";
    } else if (easyPct > 65 || total < 10) {
        level = "Needs Improvement";
        explanation = "Your practice is heavily tilted towards Easy problems. Try taking on Medium-level problems to push your boundaries.";
    } else if (hardPct > 45) {
        level = "Excellent"; // Heavy on hard is great for competitive programming
        explanation = "Incredible effort on Hard problems. Ensure you maintain speed and precision on core Medium-level questions.";
    }

    return {
        easyPct: Math.round(easyPct),
        mediumPct: Math.round(mediumPct),
        hardPct: Math.round(hardPct),
        level,
        explanation
    };
};

const calculateTopicStrength = (skillData) => {
    // Normalizing skill categories
    const advanced = skillData?.data?.advanced || skillData?.advanced || [];
    const intermediate = skillData?.data?.intermediate || skillData?.intermediate || [];
    const fundamental = skillData?.data?.fundamental || skillData?.fundamental || [];

    const topics = [];
    const processSkills = (arr) => {
        if (!Array.isArray(arr)) return;
        arr.forEach(item => {
            const name = item.tagName || item.tag || item.name;
            const count = item.problemsSolved || item.count || 0;
            if (name) {
                topics.push({ name, count });
            }
        });
    };

    processSkills(advanced);
    processSkills(intermediate);
    processSkills(fundamental);

    if (topics.length === 0) {
        return {
            strongestTopic: "N/A",
            weakestTopic: "N/A",
            averageTopic: "N/A",
            strongAreas: [],
            weakAreas: []
        };
    }

    // Sort by solved count descending
    topics.sort((a, b) => b.count - a.count);

    const strongestTopic = topics[0]?.name || "N/A";
    const weakestTopic = topics[topics.length - 1]?.name || "N/A";

    // Average topic: find topic closest to mean solved count
    const totalCount = topics.reduce((sum, t) => sum + t.count, 0);
    const mean = totalCount / topics.length;
    let closestTopic = topics[0];
    let minDiff = Math.abs(topics[0].count - mean);

    topics.forEach(t => {
        const diff = Math.abs(t.count - mean);
        if (diff < minDiff) {
            minDiff = diff;
            closestTopic = t;
        }
    });

    const averageTopic = closestTopic?.name || "N/A";

    const strongAreas = topics.slice(0, 5).map(t => t.name);
    
    // Bottom topics (Weakest) are either topics with lowest count
    // or common critical interview topics if they have low coverage.
    // Let's filter out topics with count > 0 for weak areas, or just take the end.
    const weakAreas = [...topics].reverse().slice(0, 5).map(t => t.name);

    return {
        strongestTopic,
        weakestTopic,
        averageTopic,
        strongAreas,
        weakAreas,
        allTopics: topics
    };
};

const calculateConsistencyScore = (profile, solved, submissions) => {
    let score = 0;
    
    const streak = profile?.streak || 0;
    const totalSolved = solved?.solvedProblem || 0;
    const acceptanceRate = profile?.acceptanceRate || 50;

    // 1. Streak Factor (Max 25 pts)
    // 5 points per day of streak, max 25 (5 days)
    const streakPts = Math.min(streak * 5, 25);
    score += streakPts;

    // 2. Volume Factor (Max 20 pts)
    // 1 point per 5 problems solved, max 20 (100 problems)
    const volumePts = Math.min((totalSolved / 5), 20);
    score += volumePts;

    // 3. Recent Activity Factor (Max 20 pts)
    // Based on accepted submissions count in last 30 days
    // Since we receive the latest 20 submissions, let's count how many occurred in the last 7 days
    const recentSubmissions = submissions?.submission || [];
    const oneWeekAgo = Date.now() / 1000 - (7 * 24 * 60 * 60);
    const recentCount = recentSubmissions.filter(sub => {
        const timestamp = Number(sub.timestamp);
        return timestamp >= oneWeekAgo;
    }).length;
    const recentPts = Math.min(recentCount * 2.5, 20); // 2.5 pts per accepted submission in last week
    score += recentPts;

    // 4. Acceptance Rate Quality Factor (Max 15 pts)
    // Standard reasonable acceptance rate ranges between 40% and 75%
    let acceptancePts = 10;
    if (acceptanceRate >= 50 && acceptanceRate <= 70) {
        acceptancePts = 15;
    } else if (acceptanceRate > 70) {
        acceptancePts = 12; // Extremely high acceptance rate might indicate lack of challenging problems
    } else if (acceptanceRate < 40) {
        acceptancePts = 7;
    }
    score += acceptancePts;

    // 5. Submission Consistency (Calendar/Frequency Factor) (Max 20 pts)
    // Estimate consistency based on the average gap between submissions
    let frequencyPts = 10;
    if (recentSubmissions.length >= 2) {
        const timestamps = recentSubmissions.map(s => Number(s.timestamp)).sort((a, b) => b - a);
        const gaps = [];
        for (let i = 0; i < timestamps.length - 1; i++) {
            gaps.push((timestamps[i] - timestamps[i+1]) / (24 * 60 * 60)); // gap in days
        }
        const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
        if (avgGap <= 1) frequencyPts = 20;
        else if (avgGap <= 3) frequencyPts = 15;
        else if (avgGap <= 7) frequencyPts = 10;
        else frequencyPts = 5;
    }
    score += frequencyPts;

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    
    let level = "Needs Improvement";
    if (finalScore >= 80) level = "Excellent";
    else if (finalScore >= 60) level = "Good";
    else if (finalScore >= 40) level = "Average";

    return {
        score: finalScore,
        level
    };
};

const calculateInterviewReadiness = (solved, topicStrength, contest) => {
    let score = 0;

    const medium = solved?.mediumSolved || 0;
    const hard = solved?.hardSolved || 0;
    const topicCount = topicStrength?.allTopics?.length || 0;
    const contestRating = contest?.contestRating || 0;

    // 1. Medium Solved (Max 35 pts)
    // 1 pt per medium problem, max 35 (35 problems)
    const mediumPts = Math.min(medium, 35);
    score += mediumPts;

    // 2. Hard Solved (Max 25 pts)
    // 2.5 pts per hard problem, max 25 (10 problems)
    const hardPts = Math.min(hard * 2.5, 25);
    score += hardPts;

    // 3. Topic Diversity (Max 20 pts)
    // 2 pts per unique topic category solved, max 20 (10 categories)
    const diversityPts = Math.min(topicCount * 2, 20);
    score += diversityPts;

    // 4. Contest Rating / Participation (Max 20 pts)
    let contestPts = 0;
    if (contestRating > 0) {
        if (contestRating >= 1800) contestPts = 20; // Guardian level
        else if (contestRating >= 1600) contestPts = 16; // Knight level
        else if (contestRating >= 1400) contestPts = 12; // Above average
        else contestPts = 8;
    } else if (contest?.contestAttend > 0) {
        contestPts = 5; // Attended but no rating yet
    }
    score += contestPts;

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    let level = "Beginner";
    if (finalScore >= 85) level = "FAANG Ready";
    else if (finalScore >= 65) level = "Interview Ready";
    else if (finalScore >= 40) level = "Intermediate";

    return {
        score: finalScore,
        level
    };
};

const calculateGrowthPrediction = (solved, submissions) => {
    const current = solved?.solvedProblem || 0;
    const recentSubmissions = submissions?.submission || [];

    // Calculate pace (problems per day)
    let pace = 0.5; // Default: 1 problem every 2 days
    
    if (recentSubmissions.length >= 5) {
        const timestamps = recentSubmissions.map(s => Number(s.timestamp)).sort((a, b) => a - b);
        const oldest = timestamps[0];
        const newest = timestamps[timestamps.length - 1];
        const diffDays = (newest - oldest) / (24 * 60 * 60);

        if (diffDays > 0.1) {
            pace = recentSubmissions.length / diffDays;
        }
    }
    
    // Safety boundaries for calculated pace
    pace = Math.max(0.1, Math.min(10, pace)); // Min 1 problem every 10 days, max 10/day

    const formatDays = (target) => {
        if (current >= target) return "Already Achieved";
        
        const daysRequired = (target - current) / pace;
        if (daysRequired < 1) return "1 day";
        if (daysRequired < 30) return `${Math.round(daysRequired)} days`;
        
        const months = daysRequired / 30;
        if (months < 12) {
            const roundedMonths = Math.round(months * 10) / 10;
            return `${roundedMonths} ${roundedMonths === 1 ? "month" : "months"}`;
        }
        
        const years = Math.round((months / 12) * 10) / 10;
        return `${years} ${years === 1 ? "year" : "years"}`;
    };

    return {
        dailyPace: Number(pace.toFixed(2)),
        timeTo100: formatDays(100),
        timeTo250: formatDays(250),
        timeTo500: formatDays(500),
        timeTo1000: formatDays(1000)
    };
};

const determineCodingHabits = (balance) => {
    const { easyPct, mediumPct, hardPct } = balance;
    
    if (easyPct > 60) return "Easy-heavy";
    if (mediumPct > 55) return "Medium-heavy";
    if (hardPct > 30) return "Hard-heavy";
    return "Balanced";
};

const calculatePerformanceGrade = (consistency, readiness) => {
    const avgScore = (consistency + readiness) / 2;

    if (avgScore >= 90) return "A+";
    if (avgScore >= 80) return "A";
    if (avgScore >= 70) return "B+";
    if (avgScore >= 55) return "B";
    return "C";
};

const generateRecommendations = (balance, topicStrength, consistency, readiness) => {
    const list = [];

    // 1. Balance based
    if (balance.level === "Needs Improvement") {
        list.push({
            id: "increase-difficulty",
            category: "balance",
            title: "Push past comfort zone",
            description: "Your practice is heavily focused on Easy problems. Start tackling Medium difficulty questions, especially in areas you feel comfortable with."
        });
    }

    // 2. Consistency based
    if (consistency.score < 50) {
        list.push({
            id: "daily-commitment",
            category: "consistency",
            title: "Establish a daily habit",
            description: "Consistency is key to algorithm retention. Commit to solving at least 1 problem every single day to build muscle memory."
        });
    } else if (consistency.score < 75) {
        list.push({
            id: "improve-streak",
            category: "consistency",
            title: "Extend your streak",
            description: "Maintain a stable 7-day solve streak. Solving even simple daily challenge questions helps keep your mind sharp."
        });
    }

    // 3. Topic coverage based
    const allTopics = topicStrength?.allTopics || [];
    const topicNames = allTopics.map(t => t.name.toLowerCase());
    
    const dpIndex = topicNames.indexOf("dynamic programming");
    const dpCount = dpIndex !== -1 ? allTopics[dpIndex].count : 0;
    
    const graphIndex = topicNames.findIndex(name => name.includes("graph") || name.includes("union find") || name.includes("shortest path"));
    const graphCount = graphIndex !== -1 ? allTopics[graphIndex].count : 0;

    if (dpCount < 3) {
        list.push({
            id: "focus-dp",
            category: "topics",
            title: "Master Dynamic Programming",
            description: "DP is a major interview topic. Learn 1D and 2D grid DP patterns to boost your confidence in problem-solving optimization."
        });
    }

    if (graphCount < 3) {
        list.push({
            id: "focus-graph",
            category: "topics",
            title: "Strengthen Graph algorithms",
            description: "Graph traversals (BFS, DFS, Dijkstra) are tested frequently. Practice grid traversal and adjacency list problems."
        });
    }

    // 4. Contest recommendation
    if (readiness.score < 80) {
        list.push({
            id: "join-contests",
            category: "contest",
            title: "Participate in Weekly Contests",
            description: "Simulate real interview pressure by doing LeetCode Weekly or Biweekly contests. Focus on solving the first 2 questions under time limits."
        });
    }

    // 5. Default recommendations if list is short
    if (list.length < 3) {
        list.push({
            id: "mock-interviews",
            category: "interview",
            title: "Conduct Mock Interviews",
            description: "Practice explaining your code out loud while solving Medium-level problems to prepare for interactive interview settings."
        });
    }

    return list;
};

// Orchestrate all calculations
const generateAnalytics = (profile, solved, contest, history, skillData) => {
    const difficultyBalance = calculateDifficultyBalance(solved);
    const topicStrength = calculateTopicStrength(skillData);
    const consistency = calculateConsistencyScore(profile, solved, history);
    const readiness = calculateInterviewReadiness(solved, topicStrength, contest);
    const growth = calculateGrowthPrediction(solved, history);
    const habits = determineCodingHabits(difficultyBalance);
    const grade = calculatePerformanceGrade(consistency.score, readiness.score);
    const recommendations = generateRecommendations(difficultyBalance, topicStrength, consistency, readiness);

    return {
        difficultyBalance,
        topicStrength: {
            strongestTopic: topicStrength.strongestTopic,
            weakestTopic: topicStrength.weakestTopic,
            averageTopic: topicStrength.averageTopic
        },
        strongAreas: topicStrength.strongAreas,
        weakAreas: topicStrength.weakAreas,
        consistency,
        readiness,
        growth,
        habits,
        grade,
        recommendations
    };
};

module.exports = {
    generateAnalytics
};
