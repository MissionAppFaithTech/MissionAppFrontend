---
name: frontend-testing
description: >-
  Standard procedures for writing, debugging, and maintaining React 19 and Next.js 16
  unit and integration tests with Vitest and React Testing Library. Use when writing
  component tests, mocking Next.js routers, testing async state, and resolving act() warnings.
---

# Frontend Testing Best Practices (Vitest + React Testing Library)

This skill provides comprehensive patterns for building resilient, fast, and maintainable unit and integration tests for Next.js 16 and React 19.

## 1. Core Testing Stack

- **Test Runner**: Vitest (`vitest run` / `vitest watch`)
- **Testing Library**: `@testing-library/react` + `@testing-library/user-event`
- **DOM Matchers**: `@testing-library/jest-dom`

## 2. Test Structure & Best Practices

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders accessible elements and handles user interactions', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();

    render(<MyComponent onAction={handleAction} />);

    // Prefer role queries
    const button = screen.getByRole('button', { name: /salvar/i });
    expect(button).toBeInTheDocument();

    await user.click(button);

    await waitFor(() => {
      expect(handleAction).toHaveBeenCalled();
    });
  });
});
```

## 3. Mocking Next.js App Router

When components or pages use Next.js App Router hooks (`useRouter`, `usePathname`, `useSearchParams`, `redirect`):

```tsx
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => '/profile/sobre',
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
  };
});
```

## 4. Handling React 19 Asynchronous Updates & `act(...)`

1. Always initialize `userEvent` with `const user = userEvent.setup();`.
2. Always `await user.click(...)`, `await user.type(...)`, and `await user.upload(...)`.
3. For modal closes, animations, or delayed state transitions, wrap DOM assertions in `await waitFor(() => { expect(...).toBeInTheDocument(); });`.
4. When testing file uploads:

```tsx
const fileInput = screen.getByLabelText(/upload de foto/i);
const file = new File(['content'], 'avatar.png', { type: 'image/png' });
await user.upload(fileInput, file);
```

## 5. Verification Cycle

Always execute the standard verification suite before declaring tasks complete:
`pnpm test` (or `pnpm vitest run`)
