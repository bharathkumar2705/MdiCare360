const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            return false; // Stop retrying
          }
          return 500;
        },
      },
    });
    redisClient.on('error', (err) => console.warn('Redis error (non-fatal):', err.message));
    redisClient.on('connect', () => console.log('Redis connected'));
    await redisClient.connect();
  } catch (err) {
    console.warn('Redis unavailable — caching disabled:', err.message);
    redisClient = null;
  }
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
