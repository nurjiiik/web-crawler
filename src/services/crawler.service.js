const { Cluster } = require('puppeteer-cluster');
const { parseRobots } = require('../utils/validator');
const metrics = require('./metrics.service');
const Cache = require('./cache.service');

class CrawlerService {
  constructor() {
    this.cluster = null;
    this.robotsCache = new Map();
    this.results = {
      foundEmails: new Set(),
      foundPhones: new Set(),
      pagesScanned: 0
    };
  }

  async initialize() {
    try {
      if (this.cluster) {
        try {
          await this.cluster.idle();
          await this.cluster.close();
        } catch (err) {
          console.error('Error closing existing cluster:', err);
        }
        this.cluster = null;
      }

      this.cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
        monitor: true,
        puppeteerOptions: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-software-rasterizer'
          ],
          timeout: 30000,
          ignoreHTTPSErrors: true
        },
        retryLimit: 2,
        retryDelay: 2000,
        timeout: 45000
      });

      if (!this.cluster) {
        throw new Error('Failed to initialize browser cluster');
      }

      await this.cluster.task(async ({ page, data: url }) => {
        if (!page) {
          throw new Error('Browser page not available');
        }

        try {
          const start = Date.now();
          await page.setDefaultNavigationTimeout(15000);
          await page.setRequestInterception(true);
          
          page.on('request', request => {
            if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
              request.abort();
            } else {
              request.continue();
            }
          });

          const content = await this.crawlPage(page, url);
          metrics.crawlDuration.observe((Date.now() - start) / 1000);
          this.updateResults(content);
          return content;
        } catch (error) {
          console.error(`Error crawling ${url}:`, error);
          metrics.crawlErrors.inc();
          throw error;
        }
      });
    } catch (error) {
      console.error('Failed to initialize crawler cluster:', error);
      throw new Error(`Failed to initialize crawler: ${error.message}`);
    }
  }

  async crawlPage(page, url) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      const content = await page.content();
      return {
        emails: this.extractEmails(content),
        phones: this.extractPhones(content),
        content: content
      };
    } catch (error) {
      console.error(`Error crawling page ${url}:`, error);
      throw error;
    }
  }

  updateResults(content) {
    content.emails.forEach(email => this.results.foundEmails.add(email));
    content.phones.forEach(phone => this.results.foundPhones.add(phone));
    this.results.pagesScanned++;
  }

  getResults() {
    return {
      foundEmails: Array.from(this.results.foundEmails),
      foundPhones: Array.from(this.results.foundPhones),
      pagesScanned: this.results.pagesScanned
    };
  }

  resetResults() {
    this.results = {
      foundEmails: new Set(),
      foundPhones: new Set(),
      pagesScanned: 0
    };
  }

  extractEmails(content) {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return [...new Set(content.match(regex) || [])];
  }

  extractPhones(content) {
    const regex = /(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/g;
    return [...new Set(content.match(regex) || [])];
  }

  async cleanup() {
    if (this.cluster) {
      try {
        await this.cluster.idle();
        await this.cluster.close();
        this.cluster = null;
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  }
}

module.exports = new CrawlerService();