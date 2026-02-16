// middleware/rateLimiter.js
const redisClient = require('../config/redis');

const rateLimiter = ({ prefix, limit }) => {
    return async (req, res, next) => {
        try {
            const userId = req.result?._id;
            if (!userId) return res.status(401).send("Unauthorized");

            // Get current date in YYYY-MM-DD format (UTC)
            const today = new Date().toISOString().split('T')[0];
            const key = `ratelimit:${prefix}:${userId}:${today}`;

            const currentRequests = await redisClient.incr(key);

            if (currentRequests === 1) {
                // Calculate seconds until midnight UTC
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
                tomorrow.setUTCHours(0, 0, 0, 0);
                const secondsUntilMidnight = Math.floor((tomorrow - now) / 1000);
                
                await redisClient.expire(key, secondsUntilMidnight);
            }

            if (currentRequests > limit) {
                return res.status(429).json({
                    message: "Daily limit reached.",
                    detail: `You can only Run and Submit code once per day. Try again tomorrow or upgrade to our Paid Subscription for unlimited access!`,
                    isQuotaExceeded: true
                });
            }
            
            next();
        } catch (err) {
            console.error('Rate limiter error:', err);
            next(); 
        }
    };
};

module.exports = rateLimiter;