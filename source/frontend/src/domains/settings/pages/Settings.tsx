// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ContentLayout, Header, Tabs } from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { InfoLink } from "@amzn/innovation-sandbox-frontend/components/InfoLink";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { CleanupSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/CleanupSettings";
import { GeneralSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/GeneralSettings";
import { LeaseSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/LeaseSettings";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

export const Settings = () => {
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();
  const { t } = useTranslation(['settings', 'common']);

  useInit(() => {
    setBreadcrumb([
      { text: t("common.home"), href: "/" },
      { text: t("settings"), href: "/settings" },
    ]);
    setTools(<Markdown file="settings" />);
  });

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={<InfoLink markdown="settings" />}
          description={t("pageDescription")}
        >
          {t("settings")}
        </Header>
      }
    >
      <Tabs
        tabs={[
          {
            label: t("tabs.general"),
            id: "general",
            content: <GeneralSettings />,
          },
          {
            label: t("tabs.lease"),
            id: "lease",
            content: <LeaseSettings />,
          },
          {
            label: t("tabs.cleanup"),
            id: "clean",
            content: <CleanupSettings />,
          },
        ]}
      />
    </ContentLayout>
  );
};
