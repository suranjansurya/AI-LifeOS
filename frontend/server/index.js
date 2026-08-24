import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import aiRoutes from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI LifeOS Server API',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Global Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    provider: 'local-fallback'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI LifeOS Backend Server listening on http://localhost:${PORT}`);
  console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
});
