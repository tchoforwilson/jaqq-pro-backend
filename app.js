'use strict';
import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import globalErrorHandler from './controllers/errorController.js';
import userRouter from './routes/api/userRoutes.js';

const app = express();

// GLOBAL MIDDLEWARES
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

// ROUTES
app.use('/api/v1/users', userRouter);

// INVALID ROUTES
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
