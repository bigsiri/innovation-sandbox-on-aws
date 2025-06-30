// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';

import { GeneralSettings } from '../../../../src/domains/settings/components/GeneralSettings';
import { renderWithSimpleI18n, renderSimpleBilingual } from '../../../../src/test/simple-i18n-test-utils';

// Mock the settings hooks
const mockConfig = {
  maintenanceMode: false,
  isbManagedRegions: ['us-east-1', 'us-west-2'],
  termsOfService: 'Sample terms of service text',
};

const mockUseGetConfigurations = vi.fn();

vi.mock('@amzn/innovation-sandbox-frontend/domains/settings/hooks', () => ({
  useGetConfigurations: () => mockUseGetConfigurations(),
}));

// Mock the SettingsContainer
vi.mock('@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer', () => ({
  SettingsContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="settings-container">{children}</div>
  ),
}));

// Mock Loader and ErrorPanel
vi.mock('@amzn/innovation-sandbox-frontend/components/Loader', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

vi.mock('@amzn/innovation-sandbox-frontend/components/ErrorPanel', () => ({
  ErrorPanel: ({ description, retry }: { description: string; retry: () => void }) => (
    <div data-testid="error-panel">
      <div>{description}</div>
      <button onClick={retry}>Retry</button>
    </div>
  ),
}));

describe('GeneralSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loader when loading in English', () => {
      mockUseGetConfigurations.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<GeneralSettings />);
      
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display loader when loading in French Canadian', () => {
      mockUseGetConfigurations.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<GeneralSettings />, { language: 'fr-CA' });
      
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error panel when error occurs in English', () => {
      const mockRefetch = vi.fn();
      mockUseGetConfigurations.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
        error: new Error('Test error'),
      });

      renderWithSimpleI18n(<GeneralSettings />);
      
      expect(screen.getByTestId('error-panel')).toBeInTheDocument();
      expect(screen.getByText('There was a problem loading settings.')).toBeInTheDocument();
    });

    it('should display error panel when error occurs in French Canadian', () => {
      const mockRefetch = vi.fn();
      mockUseGetConfigurations.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
        error: new Error('Test error'),
      });

      renderWithSimpleI18n(<GeneralSettings />, { language: 'fr-CA' });
      
      expect(screen.getByTestId('error-panel')).toBeInTheDocument();
      expect(screen.getByText('Un problème est survenu lors du chargement des paramètres.')).toBeInTheDocument();
    });

    it('should call refetch when retry button is clicked', () => {
      const mockRefetch = vi.fn();
      mockUseGetConfigurations.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
        error: new Error('Test error'),
      });

      renderWithSimpleI18n(<GeneralSettings />);
      
      const retryButton = screen.getByText('Retry');
      retryButton.click();
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockUseGetConfigurations.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });
    });

    it('should display maintenance mode OFF in English', async () => {
      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Maintenance Mode')).toBeInTheDocument();
        expect(screen.getByText('Maintenance mode is OFF')).toBeInTheDocument();
      });
    });

    it('should display maintenance mode OFF in French Canadian', async () => {
      renderWithSimpleI18n(<GeneralSettings />, { language: 'fr-CA' });
      
      await waitFor(() => {
        expect(screen.getByText('Mode maintenance')).toBeInTheDocument();
        expect(screen.getByText('Le mode maintenance est DÉSACTIVÉ')).toBeInTheDocument();
      });
    });

    it('should display maintenance mode ON when enabled', async () => {
      mockUseGetConfigurations.mockReturnValue({
        data: { ...mockConfig, maintenanceMode: true },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Maintenance mode is ON')).toBeInTheDocument();
      });
    });

    it('should display managed regions in English', async () => {
      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Innovation Sandbox Managed Regions')).toBeInTheDocument();
        expect(screen.getByText('us-east-1')).toBeInTheDocument();
        expect(screen.getByText('us-west-2')).toBeInTheDocument();
      });
    });

    it('should display managed regions in French Canadian', async () => {
      renderWithSimpleI18n(<GeneralSettings />, { language: 'fr-CA' });
      
      await waitFor(() => {
        expect(screen.getByText('Régions gérées par Innovation Sandbox')).toBeInTheDocument();
        expect(screen.getByText('us-east-1')).toBeInTheDocument();
        expect(screen.getByText('us-west-2')).toBeInTheDocument();
      });
    });

    it('should display "Not set" when no regions are configured', async () => {
      mockUseGetConfigurations.mockReturnValue({
        data: { ...mockConfig, isbManagedRegions: [] },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Not set')).toBeInTheDocument();
      });
    });

    it('should display "Non défini" when no regions are configured in French', async () => {
      mockUseGetConfigurations.mockReturnValue({
        data: { ...mockConfig, isbManagedRegions: [] },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<GeneralSettings />, { language: 'fr-CA' });
      
      await waitFor(() => {
        expect(screen.getByText('Non défini')).toBeInTheDocument();
      });
    });

    it('should display terms of service in English', async () => {
      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
        expect(screen.getByText('Sample terms of service text')).toBeInTheDocument();
      });
    });

    it('should display terms of service in French Canadian', async () => {
      renderWithSimpleI18n(<GeneralSettings />, { language: 'fr-CA' });
      
      await waitFor(() => {
        expect(screen.getByText('Conditions d\'utilisation')).toBeInTheDocument();
        expect(screen.getByText('Sample terms of service text')).toBeInTheDocument();
      });
    });
  });

  describe('Bilingual Support', () => {
    beforeEach(() => {
      mockUseGetConfigurations.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });
    });

    it('should render correctly in both languages', async () => {
      const { english, french } = renderSimpleBilingual(<GeneralSettings />);
      
      await waitFor(() => {
        // English
        expect(english.getByText('Maintenance Mode')).toBeInTheDocument();
        expect(english.getByText('Innovation Sandbox Managed Regions')).toBeInTheDocument();
        expect(english.getByText('Terms of Service')).toBeInTheDocument();
        
        // French Canadian
        expect(french.getByText('Mode maintenance')).toBeInTheDocument();
        expect(french.getByText('Régions gérées par Innovation Sandbox')).toBeInTheDocument();
        expect(french.getByText('Conditions d\'utilisation')).toBeInTheDocument();
      });
    });

    it('should handle maintenance mode states in both languages', async () => {
      const { english, french } = renderSimpleBilingual(<GeneralSettings />);
      
      await waitFor(() => {
        // English
        expect(english.getByText('Maintenance mode is OFF')).toBeInTheDocument();
        
        // French Canadian
        expect(french.getByText('Le mode maintenance est DÉSACTIVÉ')).toBeInTheDocument();
      });
    });
  });

  describe('Component Structure', () => {
    beforeEach(() => {
      mockUseGetConfigurations.mockReturnValue({
        data: mockConfig,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });
    });

    it('should render within SettingsContainer', async () => {
      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        expect(screen.getByTestId('settings-container')).toBeInTheDocument();
      });
    });

    it('should display regions as a list when available', async () => {
      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
        
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(2);
        expect(listItems[0]).toHaveTextContent('us-east-1');
        expect(listItems[1]).toHaveTextContent('us-west-2');
      });
    });

    it('should display terms of service in a preformatted container', async () => {
      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        const preElement = screen.getByText('Sample terms of service text');
        expect(preElement.tagName).toBe('PRE');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing config data', () => {
      mockUseGetConfigurations.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<GeneralSettings />);
      
      expect(screen.getByTestId('error-panel')).toBeInTheDocument();
    });

    it('should handle undefined regions array', async () => {
      mockUseGetConfigurations.mockReturnValue({
        data: { ...mockConfig, isbManagedRegions: undefined },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
        error: null,
      });

      renderWithSimpleI18n(<GeneralSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Not set')).toBeInTheDocument();
      });
    });
  });
});
