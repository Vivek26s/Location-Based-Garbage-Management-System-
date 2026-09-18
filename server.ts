import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './backend/routes/authRoutes';
import reportRoutes from './backend/routes/reportRoutes';
import workerRoutes from './backend/routes/workerRoutes';
import dashboardRoutes from './backend/routes/dashboardRoutes';
import notificationRoutes from './backend/routes/notificationRoutes';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Support JSON payloads with base64 images up to 20MB
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'Location Based Garbage Management System for Smart City',
      timestamp: new Date().toISOString(),
    });
  });

  // Base64 / File upload endpoint
  app.post('/api/upload', (req: Request, res: Response) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        res.status(400).json({ success: false, message: 'No image data provided.' });
        return;
      }
      // Return the image data or a managed data URI
      res.json({
        success: true,
        imageUrl: imageBase64,
        message: 'Image processed successfully',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/workers', workerRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Vite Middleware or Static Production Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart City SWM] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
