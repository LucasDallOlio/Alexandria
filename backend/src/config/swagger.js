const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alexandria API',
      version: '1.0.0',
      description:
        'API RESTful para o sistema Alexandria — gerenciamento de biblioteca escolar/pública. ' +
        'Utilize o botão **Authorize** para inserir o Bearer token JWT obtido no endpoint `/auth/login`.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor local de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT retornado pelo login: **Bearer &lt;token&gt;**',
        },
      },
      schemas: {
        Pagination: {
          type: 'object',
          properties: {
            data: { type: 'array', items: {} },
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
