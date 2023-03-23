'use strict';
import express, { json, urlencoded } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

import globalErrorHandler from './controllers/errorController.js';
import AppError from './utilities/appError.js';
import userRouter from './routes/api/userRoutes.js';
import providerRouter from './routes/api/providerRoutes.js';
import taskRouter from './routes/api/taskRoutes.js';
import pricingRouter from './routes/api/pricingRoutes.js';

config({ path: './config.env' });

// Start express app
const app = express();

// GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Serving static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(json({ limit: '10kb' }));
app.use(urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.body);
  next();
});

// ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/providers', providerRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/pricings', pricingRouter);

// INVALID ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
