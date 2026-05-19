const { getRedis } = require("../config/redis");

const rateLimit =
  ({ windowSeconds = 900, maxAttempts = 10, keyPrefix = "ratelimit" }) =>
  async (req, res, next) => {
    const redis = getRedis();
    if (!redis) return next();

    const identifier =
      req.body?.email?.toLowerCase()?.trim() ||
      req.ip ||
      "unknown";

    const key = `${keyPrefix}:${identifier}`;

    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > maxAttempts) {
        return res.status(429).json({
          message: "Too many attempts. Please try again later."
        });
      }

      next();
    } catch (err) {
      console.error("Rate limit error:", err.message);
      next();
    }
  };

module.exports = rateLimit;
