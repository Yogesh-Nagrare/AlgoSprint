const redisClient = require('../config/redis');

const rateLimiter = ({ prefix, limit }) => {
    return async (req, res, next) => {
        try {
            const userId = req.result?._id;
            if (!userId) return res.status(401).send("Unauthorized");

            const today = new Date().toISOString().split('T')[0];
            const key = `ratelimit:${prefix}:${userId}:${today}`;

            const currentRequests = await redisClient.incr(key);

            if (currentRequests === 1) {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
                tomorrow.setUTCHours(0, 0, 0, 0);
                const secondsUntilMidnight = Math.floor((tomorrow - now) / 1000);
                
                await redisClient.expire(key, secondsUntilMidnight);
            }

            // ✨✨✨ CHANGED: Instead of blocking, set flag and continue ✨✨✨
            if (currentRequests > limit) {
                // Decrement back because we're not actually using the quota
                await redisClient.decr(key);
                
                // Set flag for controller to handle
                req.quotaExhausted = true;
                return next(); // ✨ LET IT PASS TO CONTROLLER
            }
            
            next();
        } catch (err) {
            console.error('Rate limiter error:', err);
            next(); 
        }
    };
};

module.exports = rateLimiter;