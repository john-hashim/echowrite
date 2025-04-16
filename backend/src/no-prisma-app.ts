// src/app-no-prisma.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint was called');
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Add a root route for basic testing
app.get('/', (req, res) => {
  console.log('Root endpoint was called');
  res.status(200).json({ message: 'Welcome to SASS API' });
});

// Start server
app.listen(3000, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

export default app;