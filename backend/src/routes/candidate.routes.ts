import { Router } from 'express';
import { getAll, create } from '../controllers/candidate.controller';
import { validateBody } from '../middleware/validate.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { candidateCreateSchema } from '../types/candidate.types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Candidate management
 */

/**
 * @swagger
 * /api/v1/candidates:
 *   get:
 *     summary: List all candidates
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: Array of candidate objects
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               education:
 *                 type: string
 *               workExperience:
 *                 type: string
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Candidate created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post(
  '/',
  uploadMiddleware.single('cv'),
  validateBody(candidateCreateSchema),
  create,
);

export default router;
