import { fetchCandidates, createCandidate } from '../services/candidate.service';
import { CreateCandidateDto } from '../types/candidate';

global.fetch = jest.fn();

beforeEach(() => jest.clearAllMocks());

const mockCandidate = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  phone: null,
  address: null,
  education: null,
  workExperience: null,
  cvPath: null,
  createdAt: '',
  updatedAt: '',
};

describe('fetchCandidates', () => {
  it('returns parsed candidates on 200', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockCandidate]),
    });
    const result = await fetchCandidates();
    expect(result).toEqual([mockCandidate]);
  });

  it('throws on non-ok response', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchCandidates()).rejects.toThrow('500');
  });
});

describe('createCandidate', () => {
  const dto: CreateCandidateDto = {
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
  };

  it('returns created candidate on 201', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCandidate),
    });
    const result = await createCandidate(dto);
    expect(result).toEqual(mockCandidate);
  });

  it('throws with server error message on non-ok response', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Validation failed' }),
    });
    await expect(createCandidate(dto)).rejects.toThrow('Validation failed');
  });

  it('throws generic message when no error body', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('no body')),
    });
    await expect(createCandidate(dto)).rejects.toThrow('500');
  });
});
