# Backend Agent Spec — LTI Talent Tracking System

**Read this file whenever you create, modify, or review any file inside `backend/`.**
Stack: Node.js · Express 4 · TypeScript 4.9 (strict mode) · Prisma 5 · PostgreSQL 15.

---

## Layer Map

| Layer | File path | Single responsibility |
|---|---|---|
| Types / DTOs | `backend/src/types/<resource>.types.ts` | TypeScript interfaces only. No logic. |
| Service | `backend/src/services/<resource>.service.ts` | All Prisma calls + business rules. No HTTP concepts. |
| Controller | `backend/src/controllers/<resource>.controller.ts` | Parse request → call service → send response. |
| Router | `backend/src/routes/<resource>.routes.ts` | Mount handlers + per-route middleware + Swagger JSDoc. |
| Middleware | `backend/src/middleware/<name>.middleware.ts` | Cross-cutting: validation, auth, rate-limit. |
| Tests | `backend/src/tests/<resource>.<layer>.test.ts` | Unit or integration test per layer. |

**Creation order for a new resource:** types → service → controller → route → mount in `index.ts`.

---

## Types

```typescript
// backend/src/types/candidate.types.ts

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateCandidateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}
```

- Use `interface`, not `class` or `type` alias, for DTOs.
- Suffix: `CreateXDto`, `UpdateXDto`.
- Never include `id`, `createdAt`, or `updatedAt` in DTOs — Prisma manages those.

---

## Service

```typescript
// backend/src/services/candidate.service.ts

import prisma from '../index';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateCandidateDto, UpdateCandidateDto } from '../types/candidate.types';

export const findAll = async () =>
  prisma.candidate.findMany({ orderBy: { createdAt: 'desc' } });

export const findById = async (id: number) => {
  const record = await prisma.candidate.findUnique({ where: { id } });
  if (!record) {
    const err = new Error('Candidate not found') as any;
    err.statusCode = 404;
    throw err;
  }
  return record;
};

export const create = async (data: CreateCandidateDto) => {
  try {
    return await prisma.candidate.create({ data });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        const err = new Error('A candidate with that email already exists') as any;
        err.statusCode = 409;
        throw err;
      }
    }
    throw e;
  }
};

export const update = async (id: number, data: UpdateCandidateDto) => {
  try {
    return await prisma.candidate.update({ where: { id }, data });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
      const err = new Error('Candidate not found') as any;
      err.statusCode = 404;
      throw err;
    }
    throw e;
  }
};

export const remove = async (id: number) => {
  try {
    await prisma.candidate.delete({ where: { id } });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
      const err = new Error('Candidate not found') as any;
      err.statusCode = 404;
      throw err;
    }
    throw e;
  }
};
```

**Rules:**
- Import `prisma` from `'../index'` (the singleton). Never `new PrismaClient()`.
- Business logic and Prisma calls belong here. Never in controllers or routes.
- Map Prisma errors to typed errors with `statusCode`. The global handler reads that property.
- Never return `password`, token, or any secret field from a query — use `select` to allowlist fields.

**Prisma error codes reference:**

| Code | Meaning | `statusCode` |
|---|---|---|
| `P2002` | Unique constraint violation | 409 |
| `P2025` | Record not found (update/delete) | 404 |
| `P2003` | Foreign key constraint failure | 400 |

---

## Controller

```typescript
// backend/src/controllers/candidate.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as candidateService from '../services/candidate.service';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json(await candidateService.findAll());
  } catch (err) {
    next(err);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'id must be a number' }); return; }
    res.json(await candidateService.findById(id));
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(201).json(await candidateService.create(req.body));
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'id must be a number' }); return; }
    res.json(await candidateService.update(id, req.body));
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'id must be a number' }); return; }
    await candidateService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
```

**Rules:**
- Return type is always `Promise<void>`.
- Always `return` immediately after sending a mid-handler response (prevents "headers already sent" errors).
- Never call Prisma directly. Never implement business logic here.
- On error: always `next(err)`. Never `res.json({ error: err.message })` for unexpected errors.
- Always parse and validate path params before using them.

---

## Router

```typescript
// backend/src/routes/candidate.routes.ts

import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/candidate.controller';
import { validateBody } from '../middleware/validate.middleware';
import { candidateCreateSchema, candidateUpdateSchema } from '../types/candidate.types';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Candidate management
 */

/**
 * @swagger
 * /api/v1/candidates:
 *   get:
 *     summary: List all candidates
 *     tags: [Candidates]
 *     responses:
 *       200:
 *         description: Array of candidate objects
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/candidates/{id}:
 *   get:
 *     summary: Get a candidate by id
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Candidate object
 *       404:
 *         description: Not found
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/v1/candidates:
 *   post:
 *     summary: Create a candidate
 *     tags: [Candidates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCandidateDto'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/', validateBody(candidateCreateSchema), create);
router.put('/:id', validateBody(candidateUpdateSchema), update);
router.delete('/:id', remove);

export default router;
```

**Then mount in `backend/src/index.ts`:**
```typescript
import candidateRoutes from './routes/candidate.routes';
app.use('/api/v1/candidates', candidateRoutes);
```

**Rules:**
- Every route must have a Swagger JSDoc comment.
- POST and PUT routes must use the `validateBody` middleware.
- No logic in route files — only mounting, middleware, and Swagger docs.

---

## Middleware

### Validation (`backend/src/middleware/validate.middleware.ts`)

Uses `zod` for TypeScript-first schema validation. Install if not present: `npm install zod`.

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({ error: 'Validation failed', details: err.errors });
        return;
      }
      next(err);
    }
  };
```

Define Zod schemas alongside the TS interfaces in the types file:
```typescript
// backend/src/types/candidate.types.ts
import { z } from 'zod';

export const candidateCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

export const candidateUpdateSchema = candidateCreateSchema.partial();

export type CreateCandidateDto = z.infer<typeof candidateCreateSchema>;
export type UpdateCandidateDto = z.infer<typeof candidateUpdateSchema>;
```

### Global Error Handler (in `backend/src/index.ts`)

```typescript
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const status: number = err.statusCode ?? 500;
  const message: string = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
});
```

This must be the **last** `app.use()` call in `index.ts`.

---

## Security

Apply these on every backend change. Install once if not present:
```bash
cd backend && npm install helmet cors express-rate-limit && npm install --save-dev @types/cors
```

Wire in `index.ts` **before all routes**:
```typescript
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

**Per-endpoint rules:**

| Risk | Rule |
|---|---|
| Mass assignment | Pass only explicit DTO fields to Prisma. Never `prisma.x.create({ data: req.body })`. |
| SQL injection | Never use `$queryRaw` / `$executeRaw` with user input. Prisma parameterizes all queries. |
| Numeric params | Always `parseInt(req.params.id, 10)` + `isNaN()` guard before use. |
| Verbose errors | 5xx responses must say `'Internal server error'`, never `err.message`. |
| Sensitive data | Use `select` in Prisma queries to allowlist returned fields. Never return password or token fields. |
| Missing auth | Routes requiring authentication must use an `authenticate` middleware. Never trust a client-sent user id. |
| Secrets | All credentials in `backend/.env` via `process.env.VAR`. Add new var names to `.env.example` (value blank). |

---

## Prisma Schema Conventions

```prisma
model Candidate {
  id           Int           @id @default(autoincrement())
  firstName    String
  lastName     String
  email        String        @unique
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  applications Application[]
}
```

- Every model must have `id`, `createdAt`, `updatedAt`.
- Field names: camelCase. Prisma maps to snake_case in PostgreSQL automatically.
- After editing schema:
  ```bash
  cd backend && npx prisma migrate dev --name <kebab-case-description>
  npx prisma generate
  ```

---

## Swagger Setup (one-time)

Add to `backend/src/index.ts` after `app` is declared:
```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'LTI API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3010' }],
  },
  apis: ['./src/routes/*.routes.ts'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## Testing

**Approach: Test-Driven Development (TDD).** For every new file, write the test file first (red), then write the implementation to make it pass (green). Never write implementation code before the test that requires it exists.

**Coverage target: 100%** — statements, branches, and lines — for all files introduced or modified by a change. Enforce with Jest's `--coverage` flag. Do not reduce thresholds to make a build pass.

Run: `cd backend && npm test`. Test files: `backend/src/tests/<resource>.<layer>.test.ts`.

### Service unit tests — mock Prisma

```typescript
// backend/src/tests/candidate.service.test.ts

jest.mock('../index', () => ({
  __esModule: true,
  default: {
    candidate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from '../index';
import * as service from '../services/candidate.service';

beforeEach(() => jest.clearAllMocks());

describe('findAll', () => {
  it('returns records from Prisma', async () => {
    const rows = [{ id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }];
    (prisma.candidate.findMany as jest.Mock).mockResolvedValue(rows);
    expect(await service.findAll()).toEqual(rows);
  });
});

describe('findById', () => {
  it('throws 404 when record is missing', async () => {
    (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.findById(99)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('create', () => {
  it('throws 409 on unique violation', async () => {
    const { PrismaClientKnownRequestError } = jest.requireActual('@prisma/client/runtime/library');
    (prisma.candidate.create as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError('Unique', { code: 'P2002', clientVersion: '5.0.0' }),
    );
    await expect(service.create({ firstName: 'A', lastName: 'B', email: 'a@b.com' }))
      .rejects.toMatchObject({ statusCode: 409 });
  });
});
```

### Controller unit tests — mock the service

```typescript
// backend/src/tests/candidate.controller.test.ts

import { getAll, getById, create } from '../controllers/candidate.controller';
import * as service from '../services/candidate.service';

jest.mock('../services/candidate.service');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('getAll', () => {
  it('responds 200 with records', async () => {
    const data = [{ id: 1 }];
    (service.findAll as jest.Mock).mockResolvedValue(data);
    const res = mockRes();
    await getAll({} as any, res, mockNext);
    expect(res.json).toHaveBeenCalledWith(data);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('calls next on service error', async () => {
    (service.findAll as jest.Mock).mockRejectedValue(new Error('db down'));
    await getAll({} as any, mockRes(), mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('getById', () => {
  it('returns 400 for non-numeric id', async () => {
    const res = mockRes();
    await getById({ params: { id: 'abc' } } as any, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
```

### Route integration tests — Supertest

```typescript
// backend/src/tests/candidate.routes.test.ts

import request from 'supertest';
import { app } from '../index';
import * as service from '../services/candidate.service';

jest.mock('../services/candidate.service');

beforeEach(() => jest.clearAllMocks());

describe('GET /api/v1/candidates', () => {
  it('200 with data', async () => {
    (service.findAll as jest.Mock).mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get('/api/v1/candidates');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/candidates', () => {
  const validBody = { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' };

  it('201 on success', async () => {
    (service.create as jest.Mock).mockResolvedValue({ id: 1, ...validBody });
    const res = await request(app).post('/api/v1/candidates').send(validBody);
    expect(res.status).toBe(201);
  });

  it('400 on missing fields', async () => {
    const res = await request(app).post('/api/v1/candidates').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('propagates service statusCode', async () => {
    const err = Object.assign(new Error('conflict'), { statusCode: 409 });
    (service.create as jest.Mock).mockRejectedValue(err);
    const res = await request(app).post('/api/v1/candidates').send(validBody);
    expect(res.status).toBe(409);
  });
});
```

### Middleware unit tests

```typescript
// backend/src/tests/validate.middleware.test.ts
import { z } from 'zod';
import { validateBody } from '../middleware/validate.middleware';

const schema = z.object({ name: z.string() });
const next = jest.fn();
beforeEach(() => jest.clearAllMocks());

it('passes valid body to next', () => {
  const req: any = { body: { name: 'Alice' } };
  const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  validateBody(schema)(req, res, next);
  expect(next).toHaveBeenCalledWith();
});

it('returns 400 on invalid body', () => {
  const req: any = { body: {} };
  const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  validateBody(schema)(req, res, next);
  expect(res.status).toHaveBeenCalledWith(400);
});
```

### Minimum test coverage per layer

| Layer | Required test cases |
|---|---|
| Service | Happy path + each Prisma error code the function maps |
| Controller | Happy path + invalid param + service throws (next called) |
| Route | 2xx happy path + 400 validation + error statusCode propagated |
| Middleware | Valid input passes + invalid input returns 400 |

---

## Pre-completion Checklist

Before marking any backend work done, verify every item:

- [ ] Types file: `CreateXDto` and `UpdateXDto` interfaces defined; Zod schemas exported.
- [ ] Service: uses `prisma` singleton; maps Prisma error codes to `statusCode`; no secrets in return values.
- [ ] Controller: all handlers return `Promise<void>`; `return` after every mid-handler response; no direct Prisma calls.
- [ ] Route: Swagger JSDoc on every endpoint; `validateBody` on POST/PUT; mounted in `index.ts`.
- [ ] `index.ts`: `helmet`, `cors`, `express.json({ limit: '10kb' })`, `rateLimit` applied before routes; global error handler is last.
- [ ] No `req.body` spread directly into Prisma — only explicit DTO fields.
- [ ] No sensitive fields in responses.
- [ ] Service tests: happy path + each mapped Prisma error.
- [ ] Controller tests: happy path + invalid param + error forwarding.
- [ ] Route tests: 2xx + 400 + service error propagation.
- [ ] `cd backend && npm test` passes.
- [ ] `cd backend && npx eslint src/` passes.
