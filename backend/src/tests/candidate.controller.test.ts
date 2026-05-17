import { getAll, create } from '../controllers/candidate.controller';
import * as service from '../services/candidate.service';

jest.mock('../services/candidate.service');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

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

describe('getAll', () => {
  it('responds 200 with candidate list', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([sampleCandidate]);
    const res = mockRes();
    await getAll({} as any, res, mockNext);
    expect(res.json).toHaveBeenCalledWith([sampleCandidate]);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('forwards service error to next', async () => {
    (service.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));
    await getAll({} as any, mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('create', () => {
  const validBody = { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' };

  it('responds 201 with created candidate', async () => {
    (service.create as jest.Mock).mockResolvedValue(sampleCandidate);
    const req: any = { body: validBody, file: undefined };
    const res = mockRes();
    await create(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(sampleCandidate);
  });

  it('passes file path to service when file is uploaded', async () => {
    (service.create as jest.Mock).mockResolvedValue({
      ...sampleCandidate,
      cvPath: '/uploads/cv.pdf',
    });
    const req: any = { body: validBody, file: { path: '/uploads/cv.pdf' } };
    await create(req, mockRes(), mockNext);
    expect(service.create).toHaveBeenCalledWith(validBody, '/uploads/cv.pdf');
  });

  it('forwards service error to next', async () => {
    (service.create as jest.Mock).mockRejectedValue(new Error('conflict'));
    const req: any = { body: validBody, file: undefined };
    await create(req, mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
