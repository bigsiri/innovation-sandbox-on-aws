// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UseQueryResult } from "@tanstack/react-query";

import {
  Lease,
  LeaseStatus,
} from "@amzn/innovation-sandbox-commons/data/lease/lease";
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

// helper function to turn labels like "PendingApproval" into "Pending Approval"
const splitCamelCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z0-9])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
};

// Translation-aware status display function
export const getLeaseStatusDisplayName = (
  status: LeaseStatus, 
  t?: TranslationFunction
): string => {
  if (!t) {
    // Fallback to original behavior for backward compatibility
    return getLeaseStatusDisplayNameLegacy(status);
  }

  switch (status) {
    case "Active":
      return t('status.active', { ns: 'leases' });
    case "Frozen":
      return t('status.frozen', { ns: 'leases' });
    case "PendingApproval":
      return t('status.pendingApproval', { ns: 'leases' });
    case "ApprovalDenied":
      return t('status.approvalDenied', { ns: 'leases' });
    case "Expired":
      return t('status.expired', { ns: 'leases' });
    case "BudgetExceeded":
      return t('status.budgetExceeded', { ns: 'leases' });
    case "ManuallyTerminated":
      return t('status.manuallyTerminated', { ns: 'leases' });
    case "AccountQuarantined":
      return t('status.accountQuarantined', { ns: 'leases' });
    case "Ejected":
      return t('status.ejected', { ns: 'leases' });
    default:
      return t('status.unknown', { ns: 'leases' });
  }
};

// Legacy function for backward compatibility
export const getLeaseStatusDisplayNameLegacy = (status: LeaseStatus): string => {
  switch (status) {
    case "Active":
      return "Active";
    case "Frozen":
      return "Frozen - Threshold Reached";
    case "PendingApproval":
      return "Pending Approval";
    case "ApprovalDenied":
      return "Approval Denied";
    case "Expired":
      return "Lease Duration Expired";
    case "BudgetExceeded":
      return "Budget Exceeded";
    case "ManuallyTerminated":
      return "Lease Manually Terminated";
    case "AccountQuarantined":
      return "Account Quarantined";
    case "Ejected":
      return "Account Manually Ejected";
    default:
      return splitCamelCase(status);
  }
};

// Translation-aware breadcrumb generation
export const generateBreadcrumb = (
  query: UseQueryResult<Lease | undefined, unknown>,
  t?: TranslationFunction,
  isApprovalPage?: boolean,
) => {
  const { data: lease, isLoading, isError } = query;

  const breadcrumbItems = [{ 
    text: t ? t('breadcrumbs.home') : "Home", 
    href: "/" 
  }];

  if (isApprovalPage) {
    breadcrumbItems.push({ 
      text: t ? t('breadcrumbs.approvals') : "Approvals", 
      href: "/approvals" 
    });
  } else {
    breadcrumbItems.push({ 
      text: t ? t('breadcrumbs.leases') : "Leases", 
      href: "/leases" 
    });
  }

  if (isLoading) {
    breadcrumbItems.push({ 
      text: t ? t('breadcrumbs.loading') : "Loading...", 
      href: "#" 
    });
    return breadcrumbItems;
  }

  if (isError || !lease) {
    breadcrumbItems.push({ 
      text: t ? t('breadcrumbs.error') : "Error", 
      href: "#" 
    });
    return breadcrumbItems;
  }

  breadcrumbItems.push({
    text: lease.userEmail,
    href: "#",
  });

  return breadcrumbItems;
};

export const leaseStatusSortingComparator = (a: Lease, b: Lease): number => {
  const statusOrder = {
    PendingApproval: 1,
    Frozen: 2,
    Active: 3,
    Expired: 4,
    BudgetExceeded: 5,
    AccountQuarantined: 6,
    ManuallyTerminated: 7,
    Ejected: 8,
    ApprovalDenied: 9,
  };

  const statusA = statusOrder[a.status] || Number.MAX_VALUE;
  const statusB = statusOrder[b.status] || Number.MAX_VALUE;

  return statusA - statusB;
};
