import { Candidate, CreateCandidateDto } from '../types/candidate';

const BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3010/api/v1';

export const fetchCandidates = async (): Promise<Candidate[]> => {
  const res = await fetch(`${BASE_URL}/candidates`);
  if (!res.ok) throw new Error(`Failed to fetch candidates: ${res.status}`);
  return res.json() as Promise<Candidate[]>;
};

export const createCandidate = async (
  data: CreateCandidateDto,
  cvFile?: File,
): Promise<Candidate> => {
  const formData = new FormData();
  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('email', data.email);
  if (data.phone) formData.append('phone', data.phone);
  if (data.address) formData.append('address', data.address);
  if (data.education) formData.append('education', data.education);
  if (data.workExperience) formData.append('workExperience', data.workExperience);
  if (cvFile) formData.append('cv', cvFile);

  const res = await fetch(`${BASE_URL}/candidates`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<Candidate>;
};
