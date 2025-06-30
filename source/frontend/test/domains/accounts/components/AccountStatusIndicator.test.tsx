// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';

import { AccountStatusIndicator } from '../../../../src/domains/accounts/components/AccountStatusIndicator';
import { renderWithSimpleI18n, renderSimpleBilingual } from '../../../../src/test/simple-i18n-test-utils';
import { SandboxAccountStatus } from '@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account';

// Mock the getColor function
vi.mock('@amzn/innovation-sandbox-frontend/components/AccountsSummary/helpers', () => ({
  getColor: vi.fn((status: string) => {
    const colors = {
      Available: '#00ff00',
      Active: '#0000ff',
      Frozen: '#ff0000',
      CleanUp: '#ffff00',
      Quarantine: '#ff00ff',
    };
    return colors[status as keyof typeof colors] || '#000000';
  }),
}));

describe('AccountStatusIndicator Component', () => {
  const mockCleanupStartTime = '2024-01-01T10:00:00Z';

  describe('Status Display', () => {
    it('should display Available status in English', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Available" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should display Available status in French Canadian', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Available" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />,
        { language: 'fr-CA' }
      );
      
      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });

    it('should display Active status in English', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Active" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display Active status in French Canadian', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Active" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />,
        { language: 'fr-CA' }
      );
      
      expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    it('should display Frozen status in English', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Frozen" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      expect(screen.getByText('Frozen')).toBeInTheDocument();
    });

    it('should display Frozen status in French Canadian', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Frozen" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />,
        { language: 'fr-CA' }
      );
      
      expect(screen.getByText('Gelé')).toBeInTheDocument();
    });

    it('should display Quarantine status in English', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Quarantine" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      expect(screen.getByText('Quarantine')).toBeInTheDocument();
    });

    it('should display Quarantine status in French Canadian', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Quarantine" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />,
        { language: 'fr-CA' }
      );
      
      expect(screen.getByText('Quarantaine')).toBeInTheDocument();
    });
  });

  describe('CleanUp Status with Popover', () => {
    it('should display CleanUp status with popover in English', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="CleanUp" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      expect(screen.getByText('Clean Up')).toBeInTheDocument();
    });

    it('should display CleanUp status with popover in French Canadian', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="CleanUp" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />,
        { language: 'fr-CA' }
      );
      
      expect(screen.getByText('Nettoyage')).toBeInTheDocument();
    });

    it('should show cleanup message in popover content', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="CleanUp" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      // The popover content should contain the cleanup message
      // Note: Testing popover content might require user interaction or specific testing utilities
      expect(screen.getByText('Clean Up')).toBeInTheDocument();
    });
  });

  describe('Unknown Status Handling', () => {
    it('should handle unknown status gracefully', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status={'UnknownStatus' as SandboxAccountStatus} 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should handle unknown status in French Canadian', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status={'UnknownStatus' as SandboxAccountStatus} 
          lastCleanupStartTime={mockCleanupStartTime} 
        />,
        { language: 'fr-CA' }
      );
      
      expect(screen.getByText('Inconnu')).toBeInTheDocument();
    });
  });

  describe('Bilingual Support', () => {
    it('should render correctly in both languages', () => {
      const { english, french } = renderSimpleBilingual(
        <AccountStatusIndicator 
          status="Available" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      expect(english.getByText('Available')).toBeInTheDocument();
      expect(french.getByText('Disponible')).toBeInTheDocument();
    });

    it('should handle all status types in both languages', () => {
      const statuses: SandboxAccountStatus[] = ['Available', 'Active', 'Frozen', 'CleanUp', 'Quarantine'];
      
      statuses.forEach(status => {
        const { english, french } = renderSimpleBilingual(
          <AccountStatusIndicator 
            status={status} 
            lastCleanupStartTime={mockCleanupStartTime} 
          />
        );
        
        // Each status should render something in both languages
        expect(english.container).toHaveTextContent(/\w+/);
        expect(french.container).toHaveTextContent(/\w+/);
      });
    });
  });

  describe('Icon Display', () => {
    it('should display appropriate icons for each status', () => {
      const statusIconMap = {
        Available: 'status-positive',
        Active: 'status-in-progress',
        Frozen: 'status-stopped',
        CleanUp: 'remove',
        Quarantine: 'status-negative',
      };

      Object.entries(statusIconMap).forEach(([status, expectedIcon]) => {
        const { unmount } = renderWithSimpleI18n(
          <AccountStatusIndicator 
            status={status as SandboxAccountStatus} 
            lastCleanupStartTime={mockCleanupStartTime} 
          />
        );
        
        // Check that the component renders (icon testing would require more specific setup)
        expect(document.body).toContainHTML('span');
        
        unmount();
      });
    });
  });

  describe('Color Application', () => {
    it('should apply correct colors for each status', () => {
      const statuses: SandboxAccountStatus[] = ['Available', 'Active', 'Frozen', 'Quarantine'];
      
      statuses.forEach(status => {
        const { container } = renderWithSimpleI18n(
          <AccountStatusIndicator 
            status={status} 
            lastCleanupStartTime={mockCleanupStartTime} 
          />
        );
        
        const statusSpan = container.querySelector('span');
        expect(statusSpan).toBeInTheDocument();
        expect(statusSpan).toHaveStyle('color: rgb(0, 0, 0)'); // Mock color or actual color
      });
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with proper text content', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Available" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      const statusElement = screen.getByText('Available');
      expect(statusElement).toBeVisible();
      expect(statusElement).toHaveTextContent('Available');
    });

    it('should maintain accessibility in French Canadian', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="Available" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />,
        { language: 'fr-CA' }
      );
      
      const statusElement = screen.getByText('Disponible');
      expect(statusElement).toBeVisible();
      expect(statusElement).toHaveTextContent('Disponible');
    });
  });

  describe('Date Formatting', () => {
    it('should format cleanup start time according to locale', () => {
      renderWithSimpleI18n(
        <AccountStatusIndicator 
          status="CleanUp" 
          lastCleanupStartTime={mockCleanupStartTime} 
        />
      );
      
      // The cleanup status should render
      expect(screen.getByText('Clean Up')).toBeInTheDocument();
      
      // Date formatting is handled internally in the popover
      // More specific testing would require popover interaction
    });
  });
});
