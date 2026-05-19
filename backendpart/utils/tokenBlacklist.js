const jwt = require("jsonwebtoken");
const { getRedis } = require("../config/redis");

const blacklistKey = (token) => `blacklist:${token}`;

const addToBlacklist = async (token) => {
  const redis = getRedis();
  if (!redis || !token) return;

  const decoded = jwt.decode(token);
  if (!decoded?.exp) return;

  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.setex(blacklistKey(token), ttl, "1");
  }
};

const isBlacklisted = async (token) => {
  const redis = getRedis();
  if (!redis || !token) return false;

  const hit = await redis.get(blacklistKey(token));
  return hit === "1";
};

module.exports = {
  addToBlacklist,
  isBlacklisted
};
