# Frontend Agent Spec — LTI Talent Tracking System

**Read this file whenever you create, modify, or review any file inside `frontend/`.**
Stack: React 18 · TypeScript 4.9 · Create React App · `@testing-library/react` 13.

---

## Layer Map

| Layer | Path | Single responsibility |
|---|---|---|
| Page | `frontend/src/pages/<PageName>/index.tsx` | Route-level component. Composes feature components, owns top-level data fetching. |
| Component | `frontend/src/components/<ComponentName>/index.tsx` | Reusable UI unit. Receives all data via props. No direct API calls. |
| Hook | `frontend/src/hooks/use<Name>.ts` | Encapsulates stateful logic or side effects shared across components. |
| Service | `frontend/src/services/<resource>.service.ts` | All `fetch` calls to the backend API. Returns typed data. No JSX. |
| Types | `frontend/src/types/<name>.ts` | TypeScript interfaces and type aliases only. No logic. |
| Utils | `frontend/src/utils/<name>.ts` | Pure helper functions (formatters, validators). No React imports. |
| Tests | `frontend/src/tests/<Name>.<layer>.test.tsx` | One test file per unit. |

**Creation order for a new feature:** types → service → hook (if needed) → component → page → route in `App.tsx`.

**What belongs where:**
- Data fetching: pages or custom hooks. Never inside a presentational component.
- Business formatting (e.g. date display, status labels): utils.
- Shared stateful logic used by ≥2 components: a custom hook.
- One-off local helpers: inline in the file that uses them.

---

## Component Conventions

### Folder structure

```
frontend/src/components/CandidateCard/
  index.tsx          ← component implementation and named export
  CandidateCard.module.css   ← styles (CSS Modules, optional)
  CandidateCard.types.ts     ← prop interface if file grows large
```

Keep sub-components in the same folder only when they are not reused elsewhere. If a sub-component is needed by two different parents, promote it to its own folder under `components/`.

### Prop typing

Always define props as a named `interface` in the same file (or in `CandidateCard.types.ts` if the file is large). Use the `Props` suffix.

```typescript
// frontend/src/components/CandidateCard/index.tsx

interface CandidateCardProps {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  onSelect: (id: number) => void;
}

export const CandidateCard = ({ id, firstName, lastName, email, onSelect }: CandidateCardProps) => {
  return (
    <div onClick={() => onSelect(id)}>
      <strong>{firstName} {lastName}</strong>
      <span>{email}</span>
    </div>
  );
};
```

- Use `interface`, not `type`, for prop shapes.
- Never use `React.FC<Props>` — it adds implicit `children` and hides the return type. Type the function directly.
- Always use named exports for components. Default export only for the file's primary export when required by a router or CRA convention.

### Avoiding prop drilling

- Lift state up to the nearest common ancestor, not further.
- If state needs to travel more than two levels, introduce a custom hook and pass the value/setter explicitly, or use React Context.
- Do not reach for Context for frequently-changing state (e.g. form field values) — it causes full subtree re-renders.

---

## State Management

### Local state

Use `useState` for simple values, `useReducer` for state with multiple sub-fields or transitions.

```typescript
// Prefer useReducer when the state has related fields that change together
type FormState = { firstName: string; lastName: string; email: string };
type FormAction = { type: 'set'; field: keyof FormState; value: string } | { type: 'reset' };

const initialState: FormState = { firstName: '', lastName: '', email: '' };

function formReducer(state: FormState, action: FormAction): FormState {
  if (action.type === 'reset') return initialState;
  return { ...state, [action.field]: action.value };
}
```

### Shared / global state

Use React Context only for low-frequency state (auth session, theme, current user). Never store server-fetched lists in Context.

```typescript
// frontend/src/hooks/useAuth.ts
import { createContext, useContext } from 'react';

interface AuthContextValue {
  userId: number | null;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
```

- Provide the Context at the lowest subtree that needs it, not always at the app root.
- No Redux, Zustand, or other external stores unless a feature genuinely demands it. Justify in a comment if added.

---

## Service Layer (API Calls)

All HTTP calls live in `frontend/src/services/<resource>.service.ts`. Components and pages never call `fetch` directly.

### Base URL

```typescript
const BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3010/api/v1';
```

Set `REACT_APP_API_URL` in `frontend/.env` for environments other than local. CRA only exposes env vars prefixed with `REACT_APP_`.

### Service function pattern

```typescript
// frontend/src/services/candidate.service.ts

import { Candidate, CreateCandidateDto } from '../types/candidate';

const BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3010/api/v1';

export const fetchCandidates = async (): Promise<Candidate[]> => {
  const res = await fetch(`${BASE_URL}/candidates`);
  if (!res.ok) throw new Error(`Failed to fetch candidates: ${res.status}`);
  return res.json() as Promise<Candidate[]>;
};

export const createCandidate = async (data: CreateCandidateDto): Promise<Candidate> => {
  const res = await fetch(`${BASE_URL}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<Candidate>;
};
```

**Rules:**
- Always check `res.ok` and throw on failure. Never silently swallow a non-2xx response.
- Return type must be explicit and match the backend response shape defined in `frontend/src/types/`.
- Never pass raw user input into a URL segment without encoding: use `encodeURIComponent(id)` for string path params.
- Do not put auth tokens in the URL. Pass them in headers.

---

## TypeScript Rules

- **No `any`.** Use `unknown` when the type is genuinely unknown, then narrow with a type guard.
- All exported functions must have explicit return types.
- Use `interface` for object shapes (props, API responses, DTOs). Use `type` only for unions, intersections, or aliases of primitives.
- Do not duplicate backend types. Define frontend-facing types in `frontend/src/types/` aligned with the API contract. If the backend publishes a shared types package, import from there instead.
- Never cast with `as` to silence a type error. Fix the root cause.
- `tsconfig.json` inherits CRA's strict defaults — do not loosen `strict`, `noImplicitAny`, or `strictNullChecks`.

```typescript
// frontend/src/types/candidate.ts

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string; // ISO 8601 string as returned by JSON
}

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
}
```

---

## Testing Requirements

Run: `cd frontend && npm test -- --watchAll=false`

Test files: `frontend/src/tests/<Name>.<layer>.test.tsx`

### Component tests — `@testing-library/react`

Test what the user sees and does, not implementation details. Do not test internal state or private functions.

```typescript
// frontend/src/tests/CandidateCard.component.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateCard } from '../components/CandidateCard';

const baseProps = {
  id: 1,
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  onSelect: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

it('renders name and email', () => {
  render(<CandidateCard {...baseProps} />);
  expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  expect(screen.getByText('alice@example.com')).toBeInTheDocument();
});

it('calls onSelect with id on click', () => {
  render(<CandidateCard {...baseProps} />);
  fireEvent.click(screen.getByText('Alice Smith'));
  expect(baseProps.onSelect).toHaveBeenCalledWith(1);
});
```

### Service tests — mock `fetch`

```typescript
// frontend/src/tests/candidate.service.test.ts

import { fetchCandidates, createCandidate } from '../services/candidate.service';

global.fetch = jest.fn();

beforeEach(() => jest.clearAllMocks());

it('returns parsed candidates on 200', async () => {
  const data = [{ id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', createdAt: '' }];
  (fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(data) });
  expect(await fetchCandidates()).toEqual(data);
});

it('throws on non-ok response', async () => {
  (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve({}) });
  await expect(fetchCandidates()).rejects.toThrow('500');
});
```

### Hook tests — `renderHook`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCandidates } from '../hooks/useCandidates';
import * as service from '../services/candidate.service';

jest.mock('../services/candidate.service');

it('loads candidates on mount', async () => {
  (service.fetchCandidates as jest.Mock).mockResolvedValue([{ id: 1 }]);
  const { result } = renderHook(() => useCandidates());
  await act(async () => {});
  expect(result.current.candidates).toHaveLength(1);
});
```

### Minimum test coverage per layer

| Layer | Required test cases |
|---|---|
| Component | Renders expected content + each user interaction (click, input, submit) |
| Service | 2xx happy path + non-ok response throws |
| Hook | Initial state + state after async resolution + error state |
| Utils | One test per logical branch |

Do not test: CRA boilerplate (`reportWebVitals`, `setupTests`), CSS modules, SVG imports.

---

## Code Quality Gates

Before marking any frontend work done:

- `cd frontend && npm test -- --watchAll=false` passes.
- `cd frontend && npx tsc --noEmit` passes (no type errors).
- `cd frontend && npx eslint src/` passes (react-app config).
- No `// @ts-ignore` or `// eslint-disable` added without a code comment explaining the exception.
- No `console.log` left in production code.
- All new `fetch` calls are inside a service file, not inline in a component.

---

## Do / Don't Quick Reference

| Do | Don't |
|---|---|
| Type all props with a named `interface` | Use `any` or omit prop types |
| Call APIs only from service files | Call `fetch` inside a component or page |
| `throw new Error(...)` on non-ok responses in services | Silently return `null` or `undefined` on HTTP errors |
| Use `useReducer` for multi-field form state | Scatter 5 `useState` calls for related fields |
| Use CSS Modules or scoped styles | Write global class names that collide across components |
| Export components as named exports | Default-export everything |
| Test user-visible behavior with Testing Library | Assert on internal state or call component methods directly |
| Gate API base URL with `REACT_APP_API_URL` env var | Hardcode `localhost:3010` inline in component code |
| Use `encodeURIComponent` for string path params | Interpolate raw strings into URL paths |
| Lift state to the nearest common ancestor | Reach for Context for every shared piece of state |
