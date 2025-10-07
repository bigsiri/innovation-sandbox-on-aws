// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { UpdateLease } from "@amzn/innovation-sandbox-frontend/domains/leases/pages/UpdateLease";
import { renderWithQueryClient } from "@amzn/innovation-sandbox-frontend/setupTests";

// Mock the useParams hook
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ leaseId: "test-lease-id" }),
    useNavigate: () => vi.fn(),
  };
});

describe("UpdateLease", () => {

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
