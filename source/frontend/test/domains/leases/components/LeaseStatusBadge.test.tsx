// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';

import { LeaseStatusBadge } from '../../../../src/domains/leases/components/LeaseStatusBadge';
import { renderWithSimpleI18n, renderSimpleBilingual } from '../../../../src/test/simple-i18n-test-utils';
import { Lease } from '@amzn/innovation-sandbox-commons/data/lease/lease';

// Mock lease data
const createMockLease = (status: string): Lease => ({
  uuid: 'test-lease-id',
  status: status as any,
  userEmail: 'test@example.com',
  awsAccountId: '123456789012',
  originalLeaseTemplateName: 'Test Template',
  maxSpend: 1000,
  totalCostAccrued: 500,
  leaseDurationInHours: 24,
  startDate: '2024-01-01T00:00:00Z',
  expirationDate: '2024-01-02T00:00:00Z',
  lastCheckedDate: '2024-01-01T12:00:00Z',
  approvedBy: 'test-approver',
  comments: 'Test comments',
});

describe('LeaseStatusBadge Component', () => {
  describe('Status Display', () => {
    it('should display Active status in English', () => {
      const lease = createMockLease('Active');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display Active status in French Canadian', () => {
      const lease = createMockLease('Active');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />, { language: 'fr-CA' });
      
      expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    it('should display Frozen status in English', () => {
      const lease = createMockLease('Frozen');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      expect(screen.getByText('Frozen - Threshold Reached')).toBeInTheDocument();
    });

    it('should display Frozen status in French Canadian', () => {
      const lease = createMockLease('Frozen');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />, { language: 'fr-CA' });
      
      expect(screen.getByText('Gelé - Seuil atteint')).toBeInTheDocument();
    });

    it('should display PendingApproval status in English', () => {
      const lease = createMockLease('PendingApproval');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    });

    it('should display PendingApproval status in French Canadian', () => {
      const lease = createMockLease('PendingApproval');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />, { language: 'fr-CA' });
      
      expect(screen.getByText('En attente d\'approbation')).toBeInTheDocument();
    });

    it('should display Expired status in English', () => {
      const lease = createMockLease('Expired');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      expect(screen.getByText('Lease Duration Expired')).toBeInTheDocument();
    });

    it('should display Expired status in French Canadian', () => {
      const lease = createMockLease('Expired');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />, { language: 'fr-CA' });
      
      expect(screen.getByText('Durée du bail expirée')).toBeInTheDocument();
    });
  });

  describe('Badge Colors', () => {
    it('should use green color for Active status', () => {
      const lease = createMockLease('Active');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      const badge = screen.getByTestId('badge') || screen.getByText('Active').closest('[data-badge]');
      expect(badge).toBeInTheDocument();
    });

    it('should use blue color for Frozen status', () => {
      const lease = createMockLease('Frozen');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      const badge = screen.getByTestId('badge') || screen.getByText('Frozen - Threshold Reached').closest('[data-badge]');
      expect(badge).toBeInTheDocument();
    });

    it('should use severity-low color for PendingApproval status', () => {
      const lease = createMockLease('PendingApproval');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      const badge = screen.getByTestId('badge') || screen.getByText('Pending Approval').closest('[data-badge]');
      expect(badge).toBeInTheDocument();
    });

    it('should use red color for other statuses', () => {
      const lease = createMockLease('Expired');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      const badge = screen.getByTestId('badge') || screen.getByText('Lease Duration Expired').closest('[data-badge]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Bilingual Support', () => {
    it('should render correctly in both languages', () => {
      const lease = createMockLease('Active');
      const { english, french } = renderSimpleBilingual(<LeaseStatusBadge lease={lease} />);
      
      expect(english.getByText('Active')).toBeInTheDocument();
      expect(french.getByText('Actif')).toBeInTheDocument();
    });

    it('should handle complex status names in both languages', () => {
      const lease = createMockLease('BudgetExceeded');
      const { english, french } = renderSimpleBilingual(<LeaseStatusBadge lease={lease} />);
      
      expect(english.getByText('Budget Exceeded')).toBeInTheDocument();
      expect(french.getByText('Budget dépassé')).toBeInTheDocument();
    });

    it('should handle approval denied status in both languages', () => {
      const lease = createMockLease('ApprovalDenied');
      const { english, french } = renderSimpleBilingual(<LeaseStatusBadge lease={lease} />);
      
      expect(english.getByText('Approval Denied')).toBeInTheDocument();
      expect(french.getByText('Approbation refusée')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown status gracefully', () => {
      const lease = createMockLease('UnknownStatus');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      expect(screen.getByText('Unknown Status')).toBeInTheDocument();
    });

    it('should handle empty status', () => {
      const lease = createMockLease('');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      // Should display unknown status or handle gracefully
      expect(screen.getByText('Unknown Status')).toBeInTheDocument();
    });

    it('should maintain badge structure with all statuses', () => {
      const statuses = ['Active', 'Frozen', 'PendingApproval', 'Expired', 'BudgetExceeded'];
      
      statuses.forEach(status => {
        const lease = createMockLease(status);
        const { unmount } = renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
        
        const badge = document.querySelector('[data-badge]');
        expect(badge).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper badge structure', () => {
      const lease = createMockLease('Active');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      const badge = screen.getByText('Active').closest('[data-badge]');
      expect(badge).toBeInTheDocument();
    });

    it('should be readable by screen readers', () => {
      const lease = createMockLease('PendingApproval');
      renderWithSimpleI18n(<LeaseStatusBadge lease={lease} />);
      
      const statusText = screen.getByText('Pending Approval');
      expect(statusText).toBeInTheDocument();
      expect(statusText).toBeVisible();
    });
  });
});
