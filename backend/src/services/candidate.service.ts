import prisma from '../index';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateCandidateDto } from '../types/candidate.types';

export const findAll = async () =>
  prisma.candidate.findMany({ orderBy: { createdAt: 'desc' } });

export const create = async (data: CreateCandidateDto, cvPath?: string) => {
  try {
    return await prisma.candidate.create({ data: { ...data, cvPath } });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
      const err = new Error('A candidate with that email already exists') as any;
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
};
