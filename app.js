import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

import swaggerDocs from './swagger.js';
import config from './configurations/config.js';
import globalErrorHandler from './controllers/error.controller.js';
import onConnection from './actions/connection.js';
import AppError from './utilities/appError.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import taskRouter from './routes/task.routes.js';
import serviceRouter from './routes/service.routes.js';
import pricingRouter from './routes/pricing.routes.js';
import reviewRouter from './routes/review.routes.js';
import auth from './actions/auth.socket.js';

// Start express app
const app = express();

// Define server
const server = http.createServer(app);
// Socket IO
export const io = new Server(server, {
  cors: {
    origin: config.env === 'production' ? false : ['*'],
  },
});
app.set('io', io);

// GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Serving static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Development logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(json({ limit: '10kb' }));
app.use(urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Server swaggger documentation
swaggerDocs(app);

// ROUTES
app.use(`${config.prefix}/auth`, authRouter);
app.use(`${config.prefix}/users`, userRouter);
app.use(`${config.prefix}/tasks`, taskRouter);
app.use(`${config.prefix}/services`, serviceRouter);
app.use(`${config.prefix}/reviews`, reviewRouter);
app.use(`${config.prefix}/pricings`, pricingRouter);

// Socket Connections
io.use(auth.protect);
io.on('connection', onConnection);

// INVALID ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default server;
