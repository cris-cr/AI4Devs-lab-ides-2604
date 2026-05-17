import request from 'supertest';
import { app } from '../index';
import * as service from '../services/candidate.service';

jest.mock('../services/candidate.service');

describe('app health', () => {
  it('serves the candidates API at /api/v1/candidates', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([]);
    const response = await request(app).get('/api/v1/candidates');
    expect(response.statusCode).toBe(200);
  });
});
