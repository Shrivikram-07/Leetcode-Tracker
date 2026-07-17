const axios = require("axios");

const API_BASE_URL = process.env.LEETCODE_API_BASE_URL || "https://alfa-leetcode-api.onrender.com";

// Server-side cache in-memory Map
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Axios wrapper with retry capability and exponential backoff
const axiosWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
    const start = Date.now();
    try {
        const response = await axios({ url, ...options });
        const duration = Date.now() - start;
        console.log(`[LeetCode API Call] SUCCESS - URL: ${url} - Status: ${response.status} - Time: ${duration}ms`);
        return response;
    } catch (error) {
        const duration = Date.now() - start;
        const status = error.response?.status;
        console.error(`[LeetCode API Call] ERROR - URL: ${url} - Status: ${status || 'network error'} - Message: ${error.message} - Time: ${duration}ms`);
        
        const isTransient = status === 429 || (status >= 500 && status <= 504) || !status;
        if (isTransient && retries > 0) {
            console.warn(`[Retry] Transient failure on ${url} (${status || 'network error'}). Retrying in ${backoff}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return axiosWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw error;
    }
};

// Caching helper
const getCachedOrFetch = async (cacheKey, bypassCache, fetchFn) => {
    const now = Date.now();
    const cached = cache.get(cacheKey);
    
    if (!bypassCache && cached && (now - cached.timestamp < CACHE_TTL)) {
        console.log(`[Cache Hit] Key: ${cacheKey}`);
        return cached.data;
    }
    
    console.log(`[Cache Miss/Expired/Bypassed] Key: ${cacheKey}. Fetching new data...`);
    const data = await fetchFn();
    
    if (data !== null) {
        cache.set(cacheKey, {
            timestamp: now,
            data: data
        });
    }
    return data;
};

const leetcodeService = {
    getProfile: async (username, bypassCache = false) => {
        return getCachedOrFetch(`profile:${username}`, bypassCache, async () => {
            try {
                const response = await axiosWithRetry(`${API_BASE_URL}/${username}`);
                if (response.data?.errors) return null;
                return response.data;
            } catch (error) {
                if (error.response?.status === 404) return null;
                throw error;
            }
        });
    },

    getSolvedStats: async (username, bypassCache = false) => {
        return getCachedOrFetch(`solved:${username}`, bypassCache, async () => {
            try {
                const response = await axiosWithRetry(`${API_BASE_URL}/${username}/solved`);
                return response.data;
            } catch (error) {
                if (error.response?.status === 404) return null;
                throw error;
            }
        });
    },

    getContestData: async (username, bypassCache = false) => {
        return getCachedOrFetch(`contest:${username}`, bypassCache, async () => {
            try {
                const response = await axiosWithRetry(`${API_BASE_URL}/${username}/contest`);
                return response.data;
            } catch (error) {
                if (error.response?.status === 404) return null;
                throw error;
            }
        });
    },

    getContestHistory: async (username, bypassCache = false) => {
        return getCachedOrFetch(`contestHistory:${username}`, bypassCache, async () => {
            try {
                const response = await axiosWithRetry(`${API_BASE_URL}/${username}/contest/history`);
                return response.data;
            } catch (error) {
                if (error.response?.status === 404) return null;
                throw error;
            }
        });
    },

    getSkillStats: async (username, bypassCache = false) => {
        return getCachedOrFetch(`skill:${username}`, bypassCache, async () => {
            try {
                const response = await axiosWithRetry(`${API_BASE_URL}/${username}/skill`);
                return response.data;
            } catch (error) {
                if (error.response?.status === 404) return null;
                throw error;
            }
        });
    },

    getAcSubmissions: async (username, limit = 20, bypassCache = false) => {
        return getCachedOrFetch(`acSubmissions:${username}:${limit}`, bypassCache, async () => {
            try {
                const response = await axiosWithRetry(
                    `${API_BASE_URL}/${username}/acSubmission?limit=${limit}`
                );
                return {
                    submission: response.data?.submission ?? []
                };
            } catch (error) {
                if (error.response?.status === 404) return { submission: [] };
                throw error;
            }
        });
    },
    clearCache: (username) => {
        const keysToClear = [
            `profile:${username}`,
            `solved:${username}`,
            `contest:${username}`,
            `contestHistory:${username}`,
            `skill:${username}`
        ];
        for (const key of cache.keys()) {
            if (key.startsWith(`acSubmissions:${username}:`) || keysToClear.includes(key)) {
                cache.delete(key);
            }
        }
        console.log(`[Cache Cleared] For username: ${username}`);
    }
};

module.exports = leetcodeService;