import { Router } from 'express';
import { getARLocationController } from './controllers/ar.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/ar/location:
 *   get:
 *     summary: Fetch AR assets and meta guidelines for a travel destination
 *     tags: [AR Preview]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the destination/monument (e.g. TajMahal, EiffelTower)
 *     responses:
 *       200:
 *         description: Assets returned successfully
 *       400:
 *         description: Name query parameter missing
 *       404:
 *         description: Destination assets not found
 */
router.get('/location', getARLocationController);

export default router;
