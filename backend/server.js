require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const router = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', router);

app.get('/', (req, res) => {
  res.json({
    message: 'Alexandria API está no ar',
    docs: `http://localhost:${PORT}/api-docs`,
  });
});

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Documentação Swagger em http://localhost:${PORT}/api-docs`);
  });
}