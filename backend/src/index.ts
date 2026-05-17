import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const prisma = new PrismaClient();
export default prisma;

export const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json({ limit: '10kb' }));

const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

import candidateRoutes from './routes/candidate.routes';
app.use('/api/v1/candidates', candidateRoutes);

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  const status: number = err.statusCode ?? 500;
  const message: string = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
});

if (require.main === module) {
  const port = 3010;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
