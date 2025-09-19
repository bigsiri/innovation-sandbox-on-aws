// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { SideNavigationProps } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { ApprovalsBadge } from "@amzn/innovation-sandbox-frontend/domains/leases/components/ApprovalsBadge";

export const useNavItems = () => {
  const { t } = useTranslation('common');

  const commonNavItems: SideNavigationProps.Item[] = [
    { type: "divider" },
    {
      external: true,
      href: "https://docs.aws.amazon.com/solutions/latest/innovation-sandbox-on-aws/use-the-solution.html",
      text: t("documentation"),
      type: "link",
    },
  ];

  const userNavItems: SideNavigationProps.Item[] = [
    { href: "/", text: t("home"), type: "link" },
  ];

  const managerNavItems: SideNavigationProps.Item[] = [
    ...userNavItems,
    { type: "divider" },
    {
      href: "/approvals",
      text: t("approvals"),
      type: "link",
      info: <ApprovalsBadge />,
    },
    { href: "/leases", text: t("leases"), type: "link" },
    { href: "/lease_templates", text: t("leaseTemplates"), type: "link" },
  ];

  const adminNavItems: SideNavigationProps.Item[] = [
    ...managerNavItems,
    { type: "divider" },
    {
      type: "section",
      text: t("administration"),
      items: [
        { href: "/accounts", text: t("accounts"), type: "link" },
        { href: "/settings", text: t("settings"), type: "link" },
      ],
    },
  ];

  return { commonNavItems, userNavItems, managerNavItems, adminNavItems };
};

export const spacerSvg = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  ></svg>
);
