// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import "@testing-library/jest-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import React, { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { server } from "@amzn/innovation-sandbox-frontend/mocks/server";
import { cleanupI18n } from "./test/i18n-test-utils";

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  cleanupI18n(); // Clean up i18n state between tests
  server.resetHandlers();
  queryClient.clear();
});
afterAll(() => server.close());

export const createQueryClientWrapper = () => {
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export function renderWithQueryClient(ui: React.ReactElement, options = {}) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options,
  );
}

// Mocking the config for future use cases
vi.mock("../config", () => ({
  config: {
    ApiUrl: "MOCK_API_URL",
  },
}));

// Mocking matchMedia for future use cases
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// Mocking window.scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage for i18n testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Adding global mocks
global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn();

// Global i18n test configuration
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  I18nextProvider: ({ children }: { children: ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Export localStorage mock for use in tests
export { localStorageMock };
