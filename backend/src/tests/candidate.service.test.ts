jest.mock('../index', () => ({
  __esModule: true,
  default: {
    candidate: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from '../index';
import * as service from '../services/candidate.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => jest.clearAllMocks());

const sampleCandidate = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  phone: null,
  address: null,
  education: null,
  workExperience: null,
  cvPath: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('findAll', () => {
  it('returns candidates from Prisma ordered by createdAt desc', async () => {
    (mockPrisma.candidate.findMany as jest.Mock).mockResolvedValue([sampleCandidate]);
    const result = await service.findAll();
    expect(result).toEqual([sampleCandidate]);
    expect(mockPrisma.candidate.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns empty array when no candidates exist', async () => {
    (mockPrisma.candidate.findMany as jest.Mock).mockResolvedValue([]);
    expect(await service.findAll()).toEqual([]);
  });
});

describe('create', () => {
  const dto = { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' };

  it('returns the created candidate on success', async () => {
    (mockPrisma.candidate.create as jest.Mock).mockResolvedValue(sampleCandidate);
    const result = await service.create(dto);
    expect(result).toEqual(sampleCandidate);
  });

  it('passes cvPath to Prisma when provided', async () => {
    (mockPrisma.candidate.create as jest.Mock).mockResolvedValue({
      ...sampleCandidate,
      cvPath: '/uploads/cv.pdf',
    });
    await service.create(dto, '/uploads/cv.pdf');
    expect(mockPrisma.candidate.create).toHaveBeenCalledWith({
      data: { ...dto, cvPath: '/uploads/cv.pdf' },
    });
  });

  it('throws 409 on duplicate email (P2002)', async () => {
    (mockPrisma.candidate.create as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: '5.0.0',
      }),
    );
    await expect(service.create(dto)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('re-throws unknown Prisma errors', async () => {
    const err = new Error('DB error');
    (mockPrisma.candidate.create as jest.Mock).mockRejectedValue(err);
    await expect(service.create(dto)).rejects.toThrow('DB error');
  });
});
