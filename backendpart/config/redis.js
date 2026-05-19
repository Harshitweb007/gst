const Redis = require("ioredis");

let client = null;
let isReady = false;

const connectRedis = async () => {
  const url = process.env.REDIS_URL;

  if (!url) {
    console.log("Redis disabled (REDIS_URL not set)");
    return null;
  }

  client = new Redis(url, { maxRetriesPerRequest: 3 });

  client.on("error", (err) => {
    console.error("Redis error:", err.message);
    isReady = false;
  });

  await client.ping();
  isReady = true;
  console.log("Redis connected");
  return client;
};

const getRedis = () => (isReady && client ? client : null);

const isRedisReady = () => isReady;

const disconnectRedis = async () => {
  if (client) {
    await client.quit();
    client = null;
    isReady = false;
  }
};

module.exports = {
  connectRedis,
  getRedis,
  isRedisReady,
  disconnectRedis
};
