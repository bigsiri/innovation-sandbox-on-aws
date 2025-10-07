// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import "@testing-library/jest-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import React, { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { server } from "@amzn/innovation-sandbox-frontend/mocks/server";

// Import translation files for tests
import enCommon from "./i18n/locales/en/common.json";
import enSettings from "./i18n/locales/en/settings.json";
import enLeases from "./i18n/locales/en/leases.json";
import enApprovals from "./i18n/locales/en/approvals.json";
import enLeaseTemplates from "./i18n/locales/en/leaseTemplates.json";
import enAccounts from "./i18n/locales/en/accounts.json";
import enHome from "./i18n/locales/en/home.json";

// Initialize i18n for tests
i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      common: enCommon,
      settings: enSettings,
      leases: enLeases,
      approvals: enApprovals,
      leaseTemplates: enLeaseTemplates,
      accounts: enAccounts,
      home: enHome,
    },
  },
});

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

// Adding global mocks
global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn();
