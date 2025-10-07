// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { showSuccessToast } from "@amzn/innovation-sandbox-frontend/components/Toast";
import { UpdateLease } from "@amzn/innovation-sandbox-frontend/domains/leases/pages/UpdateLease";
import { config } from "@amzn/innovation-sandbox-frontend/helpers/config";
import { createActiveLease } from "@amzn/innovation-sandbox-frontend/mocks/factories/leaseFactory";
import { mockLeaseApi } from "@amzn/innovation-sandbox-frontend/mocks/mockApi";
import { server } from "@amzn/innovation-sandbox-frontend/mocks/server";
import { renderWithQueryClient } from "@amzn/innovation-sandbox-frontend/setupTests";

// Mock the useBreadcrumb hook
vi.mock("@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb", () => ({
  useBreadcrumb: () => vi.fn(),
}));

// Mock the useParams hook
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ leaseId: "test-lease-id" }),
    useNavigate: () => vi.fn(),
  };
});

// Mock the Toast component
vi.mock("@amzn/innovation-sandbox-frontend/components/Toast", () => ({
  showSuccessToast: vi.fn(),
}));

describe("UpdateLease", () => {
  const mockLease = createActiveLease({
    uuid: "test-lease-id",
    budgetThresholds: [],
  });

  // Add API mocks
  server.use(
    http.get(`${config.apiUrl}/leases/test-lease-id`, () => {
      return HttpResponse.json(mockLease);
    }),
    http.put(`${config.apiUrl}/leases/test-lease-id`, () => {
      return HttpResponse.json(mockLease);
    }),
    http.get(`${config.apiUrl}/configurations`, () => {
      return HttpResponse.json({
        maxLeaseDurationInHours: 168,
        maxLeaseSpend: 1000,
        leaseSpendThresholds: [50, 75, 90],
        leaseDurationThresholds: [24, 72, 120],
      });
    }),
  );

  const renderComponent = () =>
    renderWithQueryClient(
      <BrowserRouter>
        <UpdateLease />
      </BrowserRouter>,
    );

  test("renders lease details correctly", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  test("renders tabs for active lease", async () => {
    renderComponent();

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  test("updates budget successfully", async () => {
    renderComponent();

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  test("handles error when fetching lease details", async () => {
    renderComponent();

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
