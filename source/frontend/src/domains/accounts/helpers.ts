// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SandboxAccount } from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account";
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

type GenerateAccountBreadcrumbArgs = {
  isLoading?: boolean;
  isError?: boolean;
  account?: SandboxAccount;
  t?: TranslationFunction;
};

export const generateAccountBreadcrumb = ({
  isLoading,
  isError,
  account,
  t,
}: GenerateAccountBreadcrumbArgs) => {
  const breadcrumbItems = [
    { 
      text: t ? t('breadcrumbs.home', { ns: 'accounts' }) : "Home", 
      href: "/" 
    },
    { 
      text: t ? t('breadcrumbs.accounts', { ns: 'accounts' }) : "Accounts", 
      href: "/accounts" 
    },
  ];

  if (isLoading) {
    breadcrumbItems.push({ 
      text: t ? t('breadcrumbs.loading', { ns: 'accounts' }) : "Loading...", 
      href: "#" 
    });
  }

  if (isError) {
    breadcrumbItems.push({ 
      text: t ? t('breadcrumbs.error', { ns: 'accounts' }) : "Error", 
      href: "#" 
    });
  }

  if (account) {
    breadcrumbItems.push({
      text: account.awsAccountId,
      href: `/accounts/${account?.awsAccountId}`,
    });
    breadcrumbItems.push({ 
      text: t ? t('breadcrumbs.addAccounts', { ns: 'accounts' }) : "Add Account", 
      href: "#" 
    });
  }

  return breadcrumbItems;
};

// Legacy function for backward compatibility
export const generateAccountBreadcrumbLegacy = ({
  isLoading,
  isError,
  account,
}: Omit<GenerateAccountBreadcrumbArgs, 't'>) => {
  return generateAccountBreadcrumb({ isLoading, isError, account });
};

export const accountStatusSortingComparator = (
  a: SandboxAccount,
  b: SandboxAccount,
): number => {
  const statusOrder = {
    Quarantine: 1,
    Frozen: 2,
    Active: 3,
    CleanUp: 4,
    Available: 5,
  };

  const statusA = statusOrder[a.status] || Number.MAX_VALUE;
  const statusB = statusOrder[b.status] || Number.MAX_VALUE;

  return statusA - statusB;
};
