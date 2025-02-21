const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Web Crawler API',
      version: '1.0.0',
      description: 'Enterprise web crawling service',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);