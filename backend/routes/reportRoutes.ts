import { Router } from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  assignWorkerToReport,
  updateReportStatus,
  deleteReport,
} from '../controllers/reportController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// Public / authenticated routes
router.get('/', getReports);
router.get('/:id', getReportById);

// Submit report (can be authenticated user, or optional token)
router.post('/', (req, res, next) => {
  // If authorization header exists, authenticate it, otherwise allow guest/public report
  if (req.headers.authorization) {
    verifyToken(req, res, next);
  } else {
    next();
  }
}, createReport);

// Update status (worker or admin)
router.put('/:id/status', verifyToken, updateReportStatus);

// Assign worker (admin only)
router.put('/:id/assign', verifyToken, requireRole('admin'), assignWorkerToReport);

// Update report details (admin or owner)
router.put('/:id', verifyToken, updateReport);

// Delete report (admin or owner)
router.delete('/:id', verifyToken, deleteReport);

export default router;
