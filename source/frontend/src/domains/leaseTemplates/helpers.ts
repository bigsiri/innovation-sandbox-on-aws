// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UseQueryResult } from "@tanstack/react-query";

import { LeaseTemplate } from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template";

export const generateBreadcrumb = (
  query: UseQueryResult<LeaseTemplate | undefined, unknown>,
  t?: (key: string, options?: any) => string,
) => {
  const { data: leaseTemplate, isLoading, isError } = query;

  const breadcrumbItems = [
    { text: t?.('breadcrumbs.home', { ns: 'common' }) || "Home", href: "/" },
    { text: t?.('leaseTemplates', { ns: 'common' }) || "Lease Templates", href: "/lease_templates" },
  ];

  if (isLoading) {
    breadcrumbItems.push({ text: t?.('breadcrumbs.loading', { ns: 'common' }) || "Loading...", href: "#" });
    return breadcrumbItems;
  }

  if (isError || !leaseTemplate) {
    breadcrumbItems.push({ text: t?.('breadcrumbs.error', { ns: 'common' }) || "Error", href: "#" });
    return breadcrumbItems;
  }

  breadcrumbItems.push({
    text: leaseTemplate.name,
    href: `/lease_templates/edit/${leaseTemplate?.uuid}`,
  });

  return breadcrumbItems;
};
