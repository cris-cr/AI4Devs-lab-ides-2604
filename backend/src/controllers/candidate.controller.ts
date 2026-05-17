import { Request, Response, NextFunction } from 'express';
import * as candidateService from '../services/candidate.service';

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(await candidateService.findAll());
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cvPath = req.file?.path;
    const candidate = await candidateService.create(req.body, cvPath);
    res.status(201).json(candidate);
  } catch (err) {
    next(err);
  }
};
