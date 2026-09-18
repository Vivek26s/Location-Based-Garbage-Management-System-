import { Router } from 'express';
import { getDashboardStats, resetDatabaseSeed } from '../controllers/dashboardController';

const router = Router();

router.get('/stats', getDashboardStats);
router.post('/reset-seed', resetDatabaseSeed);

export default router;
