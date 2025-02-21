const { createClient } = require('../clients/redis.client');
class CacheService {
  constructor() {
    this.client = createClient();
    
    // Set up error handler
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // Asynchronous connection
    this.client.connect()
      .then(() => console.log('Connected to Redis'))
      .catch(err => console.error('Redis connection failed:', err));
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = process.env.CACHE_TTL) {
    try {
      await this.client.set(key, value, {
        EX: ttl
      });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();