import request from 'supertest';
import { app } from '../index';
import * as service from '../services/candidate.service';

jest.mock('../services/candidate.service');

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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('GET /api/v1/candidates', () => {
  it('returns 200 with candidate list', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([sampleCandidate]);
    const res = await request(app).get('/api/v1/candidates');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('returns 200 with empty array when no candidates', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/v1/candidates');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/v1/candidates', () => {
  const validBody = { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' };

  it('returns 201 with created candidate on valid body', async () => {
    (service.create as jest.Mock).mockResolvedValue(sampleCandidate);
    const res = await request(app).post('/api/v1/candidates').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ firstName: 'Alice' });
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/v1/candidates').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/candidates')
      .send({ ...validBody, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 409 when email already exists', async () => {
    const err = Object.assign(new Error('A candidate with that email already exists'), {
      statusCode: 409,
    });
    (service.create as jest.Mock).mockRejectedValue(err);
    const res = await request(app).post('/api/v1/candidates').send(validBody);
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });
});
