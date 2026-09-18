import { Router } from 'express';
import {
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
  getWorkerTasks,
} from '../controllers/workerController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// Get list of workers (authenticated users / admin)
router.get('/', verifyToken, getWorkers);

// Worker specific tasks
router.get('/:id/tasks', verifyToken, getWorkerTasks);

// Worker profile updates (admin or worker themselves)
router.put('/:id', verifyToken, updateWorker);

// Admin-only management
router.post('/', verifyToken, requireRole('admin'), createWorker);
router.delete('/:id', verifyToken, requireRole('admin'), deleteWorker);

export default router;
