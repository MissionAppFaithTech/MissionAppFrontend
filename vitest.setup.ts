import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia for MUI Responsive & jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for JSDOM
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Mock Next.js navigation hooks
vi.mock('next/navigation', () => {
  const actual = vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({ username: '_SamiMendonca' }),
  };
});

// Mock Next.js fonts
vi.mock('next/font/google', () => ({
  DM_Sans: () => ({
    className: 'font-dm-sans',
    variable: '--font-dm-sans',
  }),
}));

// Polyfill Range and Element getClientRects / getBoundingClientRect for ProseMirror & TipTap in JSDOM
if (typeof window !== 'undefined') {
  const mockDOMRect: DOMRect = {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => '',
  };

  const createMockDOMRectList = (): DOMRectList => {
    const list = [mockDOMRect] as unknown as DOMRectList;
    list.item = (index: number) => (index === 0 ? mockDOMRect : null);
    return list;
  };

  Range.prototype.getClientRects = createMockDOMRectList;
  Range.prototype.getBoundingClientRect = () => mockDOMRect;
  Element.prototype.getClientRects = createMockDOMRectList;
}
