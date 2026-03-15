import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db/connect';
import voiceRouter from './routes/voice';
import notesRouter from './routes/notes';
import remindersRouter from './routes/reminders';
import healthRouter from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests', code: 'RATE_LIMIT' },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', limiter);

// Routes
app.use('/api/health', healthRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/notes', notesRouter);
app.use('/api/reminders', remindersRouter);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
});

// Start server
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      console.log('Database connected');
    } else {
      console.warn('MONGODB_URI not set - running without database');
    }
    app.listen(PORT, () => {
      console.log(`Jarvis server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
