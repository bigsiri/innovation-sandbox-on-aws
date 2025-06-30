// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';

import { MyLeases } from '../../../../src/domains/home/components/MyLeases';
import { renderWithSimpleI18n, renderSimpleBilingual } from '../../../../src/test/simple-i18n-test-utils';

// Mock the lease hooks
const mockGetLeasesForCurrentUser = vi.fn();

vi.mock('@amzn/innovation-sandbox-frontend/domains/leases/hooks', () => ({
  getLeasesForCurrentUser: () => mockGetLeasesForCurrentUser(),
}));

// Mock the LeasePanel component
vi.mock('@amzn/innovation-sandbox-frontend/domains/home/components/LeasePanel', () => ({
  LeasePanel: ({ lease }: { lease: any }) => (
    <div data-testid="lease-panel" data-lease-id={lease.uuid}>
      {lease.originalLeaseTemplateName || `Lease ${lease.uuid}`}
    </div>
  ),
}));

// Mock other components
vi.mock('@amzn/innovation-sandbox-frontend/components/Loader', () => ({
  Loader: ({ label }: { label: string }) => (
    <div data-testid="loader">{label}</div>
  ),
}));

vi.mock('@amzn/innovation-sandbox-frontend/components/ErrorPanel', () => ({
  ErrorPanel: ({ description, retry }: { description: string; retry: () => void }) => (
    <div data-testid="error-panel">
      <div>{description}</div>
      <button onClick={retry}>Retry</button>
    </div>
  ),
}));

vi.mock('@amzn/innovation-sandbox-frontend/components/InfoPanel', () => ({
  InfoPanel: ({ header, description, actionLabel, action }: { 
    header: string; 
    description: string; 
    actionLabel: string; 
    action: () => void 
  }) => (
    <div data-testid="info-panel">
      <h3>{header}</h3>
      <p>{description}</p>
      <button onClick={action}>{actionLabel}</button>
    </div>
  ),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('MyLeases Component', () => {
  const mockLeases = [
    {
      uuid: 'lease-1',
      originalLeaseTemplateName: 'Test Template 1',
      status: 'Active',
      meta: { lastEditTime: '2024-01-01T00:00:00Z' },
    },
    {
      uuid: 'lease-2',
      originalLeaseTemplateName: 'Test Template 2',
      status: 'PendingApproval',
      meta: { lastEditTime: '2024-01-02T00:00:00Z' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loader when loading in English', () => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: undefined,
        isFetching: true,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<MyLeases />);
      
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText('Loading your leases...')).toBeInTheDocument();
    });

    it('should display loader when loading in French Canadian', () => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: undefined,
        isFetching: true,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<MyLeases />, { language: 'fr-CA' });
      
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText('Chargement de vos baux...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error panel when error occurs in English', () => {
      const mockRefetch = vi.fn();
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: undefined,
        isFetching: false,
        isError: true,
        refetch: mockRefetch,
        error: new Error('Test error'),
      });

      renderWithSimpleI18n(<MyLeases />);
      
      expect(screen.getByTestId('error-panel')).toBeInTheDocument();
      expect(screen.getByText('Your leases can\'t be retrieved at the moment.')).toBeInTheDocument();
    });

    it('should display error panel when error occurs in French Canadian', () => {
      const mockRefetch = vi.fn();
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: undefined,
        isFetching: false,
        isError: true,
        refetch: mockRefetch,
        error: new Error('Test error'),
      });

      renderWithSimpleI18n(<MyLeases />, { language: 'fr-CA' });
      
      expect(screen.getByTestId('error-panel')).toBeInTheDocument();
      expect(screen.getByText('Vos baux ne peuvent pas être récupérés pour le moment.')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', () => {
      const mockRefetch = vi.fn();
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: undefined,
        isFetching: false,
        isError: true,
        refetch: mockRefetch,
        error: new Error('Test error'),
      });

      renderWithSimpleI18n(<MyLeases />);
      
      const retryButton = screen.getByText('Retry');
      retryButton.click();
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should display info panel when no leases exist in English', () => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: [],
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<MyLeases />);
      
      expect(screen.getByTestId('info-panel')).toBeInTheDocument();
      expect(screen.getByText('You currently don\'t have any leases.')).toBeInTheDocument();
      expect(screen.getByText('To get started, click below to request a new lease.')).toBeInTheDocument();
      expect(screen.getByText('Request a new lease')).toBeInTheDocument();
    });

    it('should display info panel when no leases exist in French Canadian', () => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: [],
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<MyLeases />, { language: 'fr-CA' });
      
      expect(screen.getByTestId('info-panel')).toBeInTheDocument();
      expect(screen.getByText('Vous n\'avez actuellement aucun bail.')).toBeInTheDocument();
      expect(screen.getByText('Pour commencer, cliquez ci-dessous pour demander un nouveau bail.')).toBeInTheDocument();
      expect(screen.getByText('Demander un nouveau bail')).toBeInTheDocument();
    });

    it('should navigate to request page when action button is clicked', () => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: [],
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<MyLeases />);
      
      const actionButton = screen.getByText('Request a new lease');
      actionButton.click();
      
      expect(mockNavigate).toHaveBeenCalledWith('/request');
    });
  });

  describe('Success State with Leases', () => {
    beforeEach(() => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: mockLeases,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });
    });

    it('should display lease panels when leases exist', async () => {
      renderWithSimpleI18n(<MyLeases />);
      
      await waitFor(() => {
        expect(screen.getAllByTestId('lease-panel')).toHaveLength(2);
        expect(screen.getByText('Test Template 1')).toBeInTheDocument();
        expect(screen.getByText('Test Template 2')).toBeInTheDocument();
      });
    });

    it('should display correct lease count in English', async () => {
      renderWithSimpleI18n(<MyLeases />);
      
      await waitFor(() => {
        expect(screen.getByText('My Leases')).toBeInTheDocument();
        expect(screen.getByText('(2 lease(s))')).toBeInTheDocument();
      });
    });

    it('should display correct lease count in French Canadian', async () => {
      renderWithSimpleI18n(<MyLeases />, { language: 'fr-CA' });
      
      await waitFor(() => {
        expect(screen.getByText('Mes baux')).toBeInTheDocument();
        expect(screen.getByText('(2 bail/baux)')).toBeInTheDocument();
      });
    });

    it('should display section description in English', async () => {
      renderWithSimpleI18n(<MyLeases />);
      
      await waitFor(() => {
        expect(screen.getByText('View a list of your leases')).toBeInTheDocument();
      });
    });

    it('should display section description in French Canadian', async () => {
      renderWithSimpleI18n(<MyLeases />, { language: 'fr-CA' });
      
      await waitFor(() => {
        expect(screen.getByText('Voir la liste de vos baux')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should call refetch when refresh button is clicked', async () => {
      const mockRefetch = vi.fn();
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: mockLeases,
        isFetching: false,
        isError: false,
        refetch: mockRefetch,
        error: null,
      });

      renderWithSimpleI18n(<MyLeases />);
      
      await waitFor(() => {
        const refreshButton = screen.getByLabelText('Refresh');
        refreshButton.click();
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('should disable refresh button when loading', () => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: undefined,
        isFetching: true,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<MyLeases />);
      
      const refreshButton = screen.getByLabelText('Refresh');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Bilingual Support', () => {
    beforeEach(() => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: mockLeases,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });
    });

    it('should render correctly in both languages', async () => {
      const { english, french } = renderSimpleBilingual(<MyLeases />);
      
      await waitFor(() => {
        // English
        expect(english.getByText('My Leases')).toBeInTheDocument();
        expect(english.getByText('View a list of your leases')).toBeInTheDocument();
        expect(english.getByText('(2 lease(s))')).toBeInTheDocument();
        
        // French Canadian
        expect(french.getByText('Mes baux')).toBeInTheDocument();
        expect(french.getByText('Voir la liste de vos baux')).toBeInTheDocument();
        expect(french.getByText('(2 bail/baux)')).toBeInTheDocument();
      });
    });

    it('should handle empty state in both languages', () => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: [],
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      const { english, french } = renderSimpleBilingual(<MyLeases />);
      
      // English
      expect(english.getByText('You currently don\'t have any leases.')).toBeInTheDocument();
      expect(english.getByText('Request a new lease')).toBeInTheDocument();
      
      // French Canadian
      expect(french.getByText('Vous n\'avez actuellement aucun bail.')).toBeInTheDocument();
      expect(french.getByText('Demander un nouveau bail')).toBeInTheDocument();
    });
  });

  describe('Lease Filtering and Sorting', () => {
    it('should display leases when data is available', async () => {
      mockGetLeasesForCurrentUser.mockReturnValue({
        data: mockLeases,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<MyLeases />);
      
      await waitFor(() => {
        const leasePanels = screen.getAllByTestId('lease-panel');
        expect(leasePanels).toHaveLength(2);
        
        // Check that lease IDs are present
        expect(screen.getByTestId('lease-panel')).toHaveAttribute('data-lease-id', 'lease-1');
      });
    });
  });
});
