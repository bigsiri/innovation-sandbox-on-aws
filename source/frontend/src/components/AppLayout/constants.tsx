// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SideNavigationProps } from "@cloudscape-design/components";

import { ApprovalsBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/ApprovalsBadge";
import { TranslationFunction } from "@amzn/innovation-sandbox-frontend/i18n/types";

export const getCommonNavItems = (t: TranslationFunction): SideNavigationProps.Item[] => [
  { type: "divider" },
  {
    external: true,
    href: "https://docs.aws.amazon.com/solutions/latest/innovation-sandbox-on-aws/use-the-solution.html",
    text: t('menu.documentation', { ns: 'navigation' }),
    type: "link",
  },
];

export const getUserNavItems = (t: TranslationFunction): SideNavigationProps.Item[] => [
  { 
    href: "/", 
    text: t('menu.home', { ns: 'navigation' }), 
    type: "link" 
  },
];

export const getManagerNavItems = (t: TranslationFunction): SideNavigationProps.Item[] => [
  ...getUserNavItems(t),
  { type: "divider" },
  {
    href: "/approvals",
    text: t('menu.approvals', { ns: 'navigation' }),
    type: "link",
    info: <ApprovalsBadge />,
  },
  { 
    href: "/leases", 
    text: t('menu.leases', { ns: 'navigation' }), 
    type: "link" 
  },
  { 
    href: "/lease_templates", 
    text: t('menu.leaseTemplates', { ns: 'navigation' }), 
    type: "link" 
  },
];

export const getAdminNavItems = (t: TranslationFunction): SideNavigationProps.Item[] => [
  ...getManagerNavItems(t),
  { type: "divider" },
  {
    type: "section",
    text: t('menu.administration', { ns: 'navigation' }),
    items: [
      { 
        href: "/accounts", 
        text: t('menu.accounts', { ns: 'navigation' }), 
        type: "link" 
      },
      { 
        href: "/settings", 
        text: t('menu.settings', { ns: 'navigation' }), 
        type: "link" 
      },
    ],
  },
];

export const spacerSvg = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  ></svg>
);

// Legacy constants for backward compatibility (deprecated)
// These will be removed in a future version
export const commonNavItems: SideNavigationProps.Item[] = [
  { type: "divider" },
  {
    external: true,
    href: "https://docs.aws.amazon.com/solutions/latest/innovation-sandbox-on-aws/use-the-solution.html",
    text: "Documentation",
    type: "link",
  },
];

export const userNavItems: SideNavigationProps.Item[] = [
  { href: "/", text: "Home", type: "link" },
];

export const managerNavItems: SideNavigationProps.Item[] = [
  ...userNavItems,
  { type: "divider" },
  {
    href: "/approvals",
    text: "Approvals",
    type: "link",
    info: <ApprovalsBadge />,
  },
  { href: "/leases", text: "Leases", type: "link" },
  { href: "/lease_templates", text: "Lease Templates", type: "link" },
];

export const adminNavItems: SideNavigationProps.Item[] = [
  ...managerNavItems,
  { type: "divider" },
  {
    type: "section",
    text: "Administration",
    items: [
      { href: "/accounts", text: "Accounts", type: "link" },
      { href: "/settings", text: "Settings", type: "link" },
    ],
  },
];
