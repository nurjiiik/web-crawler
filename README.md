# Web Crawler Service

A scalable web crawler service with rate limiting and caching capabilities.

## Features

- Rate limiting to prevent overloading target servers
- Redis-based caching for improved performance
- Concurrent crawling with configurable limits
- Swagger API documentation
- Metrics collection

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy example.env to .env and configure as needed:
```bash
cp example.env .env
```

3. Start Redis server

4. Run the application:
- Development: `npm run dev`
- Production: `npm start`

## API Documentation

Once the server is running, visit `/api-docs` for the Swagger documentation.

## Configuration

See `example.env` for available configuration options.

## Development

- `npm run dev` - Start with hot-reload
- `npm test` - Run tests
- `npm start` - Start in production mode