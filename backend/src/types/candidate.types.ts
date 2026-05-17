import { z } from 'zod';

export const candidateCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional(),
  education: z.string().optional(),
  workExperience: z.string().optional(),
});

export const candidateUpdateSchema = candidateCreateSchema.partial();

export type CreateCandidateDto = z.infer<typeof candidateCreateSchema>;
export type UpdateCandidateDto = z.infer<typeof candidateUpdateSchema>;
