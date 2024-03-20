import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.1.0',
    language: 'en-US', // Change response language. By default is 'en-US'
    disableLogs: false, // Enable/Disable logs. By default is false
    autoHeaders: false, // Enable/Disable automatic headers capture. By default is true
    autoQuery: false, // Enable/Disable automatic query capture. By default is true
    autoBody: false,
    info: {
      title: 'Jaqq Pro',
      description: 'API documentation for Jaqp Pro service application',
      contact: {
        name: ':Lac-doh-Wilson Tchofor',
        email: 'tchoforwilson@gmai.com',
        url: 'https://github.com/tchoforwilson',
      },
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html',
      },
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:9000',
        description: 'Local server',
      },
      {
        url: 'http://backend.jaqq-pro.com',
        description: 'Live server',
      },
    ],
  },
  // looks for configuration in specified directories
  apis: ['./routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  // Swagger Page
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs, { explorer: true })
  );
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

  // Documentation in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
  });
};
export default swaggerDocs;
