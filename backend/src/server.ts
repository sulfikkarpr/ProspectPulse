import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { prospectRoutes } from './routes/prospects';
import { preTalkRoutes } from './routes/pretalks';
import { syncRoutes } from './routes/sync';
import { dashboardRoutes } from './routes/dashboard';
import { userRoutes } from './routes/users';
import { startScheduledSync } from './services/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prospects', prospectRoutes);
app.use('/api/pretalks', preTalkRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Start scheduled sync job (runs every 6 hours)
  if (process.env.NODE_ENV === 'production') {
    startScheduledSync();
  }
});

export default app;

