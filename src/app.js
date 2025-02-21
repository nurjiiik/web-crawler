const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const limiter = require('./config/rate-limiter');
const routes = require('./routes/crawl.routes');
const metrics = require('./services/metrics.service');

const app = express();

// 1. Настройка CORS с безопасными параметрами
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Парсинг JSON-тела запроса
app.use(express.json());

// 3. Подключение rate-limiter ПОСЛЕ основных middleware
app.use(limiter);

// 4. Swagger UI с валидацией схемы
app.use('/api-docs', 
  swaggerUi.serve,
  (req, res, next) => {
    if (!swaggerSpec) {
      return res.status(500).json({ error: 'Swagger specification not loaded' });
    }
    next();
  },
  swaggerUi.setup(swaggerSpec)
);

// 5. Основные роуты
app.use('/api', routes);

// 6. Метрики Prometheus с обработкой ошибок
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    const metricsData = await metrics.register.metrics();
    res.end(metricsData);
  } catch (err) {
    console.error('Metrics error:', err);
    res.status(500).end();
  }
});

// 7. Обработка favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 8. Обработка 404 ошибок
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// 9. Централизованный обработчик ошибок
app.use((err, req, res, next) => {
  // Логирование ошибки
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  // Увеличение счетчика ошибок
  metrics.httpErrors.inc({ 
    code: err.statusCode || 500,
    route: req.path 
  });

  // Форматирование ответа
  const response = {
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(err.statusCode || 500).json(response);
});

module.exports = app;