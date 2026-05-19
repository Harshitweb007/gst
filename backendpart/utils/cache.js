const { getRedis } = require("../config/redis");

const getJson = async (key) => {
  const redis = getRedis();
  if (!redis) return null;

  const raw = await redis.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const setJson = async (key, value, ttlSeconds = 60) => {
  const redis = getRedis();
  if (!redis) return;

  await redis.setex(key, ttlSeconds, JSON.stringify(value));
};

const del = async (...keys) => {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;

  await redis.del(...keys);
};

const cacheKeys = {
  dashboard: (userId) => `cache:dashboard:${userId}`,
  invoices: (userId) => `cache:invoices:${userId}`,
  user: (userId) => `cache:user:${userId}`
};

const invalidateUserCache = async (userId) => {
  await del(
    cacheKeys.dashboard(userId),
    cacheKeys.invoices(userId),
    cacheKeys.user(userId)
  );
};

module.exports = {
  getJson,
  setJson,
  del,
  cacheKeys,
  invalidateUserCache
};
