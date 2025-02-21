const router = require('express').Router();
const controller = require('../controllers/crawl.controller');
const validator = require('../utils/validator');

/**
 * @swagger
 * tags:
 *   name: Crawler
 *   description: Web crawling operations
 *
 * components:
 *   schemas:
 *     CrawlRequest:
 *       type: object
 *       required:
 *         - url
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: The URL to crawl
 *         maxDepth:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           default: 2
 *           description: Maximum depth for crawling
 *
 *     CrawlResponse:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *           description: Unique identifier for the crawl job
 *
 *     JobStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [waiting, active, completed, failed]
 *           description: Current status of the job
 *         data:
 *           type: object
 *           description: Job result data (only present when status is completed)
 */

/**
 * @swagger
 * /api/crawl:
 *   post:
 *     summary: Submit a new crawl job
 *     tags: [Crawler]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrawlRequest'
 *     responses:
 *       200:
 *         description: Job submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrawlResponse'
 *       400:
 *         description: Invalid request parameters
 *       403:
 *         description: Domain is blacklisted
 *       500:
 *         description: Server error
 */

router.post('/crawl', 
  validator.validateRequest,
  controller.submitJob
);

router.get('/jobs/:id', 
  controller.getJobStatus
);

module.exports = router;