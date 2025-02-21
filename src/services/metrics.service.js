const prom = require('prom-client');

module.exports = {
  register: prom.register,
  httpRequests: new prom.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'path', 'status']
  }),
  crawlDuration: new prom.Histogram({
    name: 'crawl_duration_seconds',
    help: 'Crawling process duration',
    buckets: [0.1, 0.5, 1, 5, 10]
  }),
  jobsCompleted: new prom.Counter({
    name: 'jobs_completed_total',
    help: 'Total completed jobs'
  })
};