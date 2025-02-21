const Queue = require('../services/queue.service');
const Cache = require('../services/cache.service');
const validator = require('../utils/validator');
const crawler = require('../services/crawler.service');

exports.submitJob = async (req, res) => {
  try {
    const { url, maxDepth = 2 } = req.body;
    
    if (validator.checkBlacklist(url)) {
      return res.status(403).json({ error: 'Domain blocked' });
    }

    const cached = await Cache.get(url);
    if (cached) return res.json(cached);

    // Initialize crawler if not already initialized
    if (!crawler.cluster) {
      await crawler.initialize();
    }
    crawler.resetResults();

    // Execute crawl
    await crawler.cluster.execute(url);
    const results = crawler.getResults();

    // Cache results
    await Cache.set(url, results);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getJobStatus = async (req, res) => {
  try {
    const job = await Queue.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    const state = await job.getState();
    res.json({
      status: state,
      data: state === 'completed' ? job.returnvalue : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};