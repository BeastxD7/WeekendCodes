import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { validateEnv } from './config/env.config';
import { connectDB, disconnectDB } from './utils/db.util';

// Import routes
import authRoutes from './routes/auth.routes';
import quizRoutes from './routes/quiz.routes';
import participationRoutes from './routes/participation.routes';
import questionRoutes from './routes/question.routes';
import userRoutes from './routes/user.routes';

// Load environment variables
dotenv.config();
validateEnv();

// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to QuestGen API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  console.log('Server shut down gracefully');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  console.log('Server shut down gracefully');
  process.exit(0);
});