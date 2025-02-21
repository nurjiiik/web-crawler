const Bull = require('bull');
const redisConfig = require('../clients/redis.client');
const metrics = require('./metrics.service');

class QueueService {
  constructor() {
    this.queue = new Bull('crawler', {
      redis: {
        host: redisConfig.host,
        port: redisConfig.port
      },
      limiter: {
        max: 5,
        duration: 1000
      }
    });

    this.setupEvents();
  }

  setupEvents() {
    this.queue.on('completed', (job) => {
      metrics.jobsCompleted.inc();
    });

    this.queue.on('failed', (job, err) => {
      metrics.jobsFailed.inc();
      console.error(`Job ${job.id} failed:`, err);
    });
  }

  async add(data) {
    return this.queue.add(data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 }
    });
  }

  async getJob(jobId) {
    return this.queue.getJob(jobId);
  }
}

module.exports = new QueueService();