// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ContentLayout, Header, Tabs } from "@cloudscape-design/components";

import { InfoLink } from "@amzn/innovation-sandbox-frontend/components/InfoLink";
import { Markdown } from "@amzn/innovation-sandbox-frontend/components/Markdown";
import { CleanupSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/CleanupSettings";
import { GeneralSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/GeneralSettings";
import { LeaseSettings } from "@amzn/innovation-sandbox-frontend/domains/settings/components/LeaseSettings";
import { UserPreferences } from "@amzn/innovation-sandbox-frontend/domains/settings/components/UserPreferences";
import { useBreadcrumb } from "@amzn/innovation-sandbox-frontend/hooks/useBreadcrumb";
import { useInit } from "@amzn/innovation-sandbox-frontend/hooks/useInit";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";
import { useAppLayoutContext } from "@aws-northstar/ui/components/AppLayout";

export const Settings = () => {
  const { t } = useTranslation();
  const setBreadcrumb = useBreadcrumb();
  const { setTools } = useAppLayoutContext();

  useInit(() => {
    setBreadcrumb([
      { text: t('breadcrumbs.home', { ns: 'settings' }), href: "/" },
      { text: t('breadcrumbs.settings', { ns: 'settings' }), href: "/settings" },
    ]);
    setTools(<Markdown file="settings" />);
  });

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          info={<InfoLink markdown="settings" />}
          description={t('page.description', { ns: 'settings' })}
        >
          {t('page.title', { ns: 'settings' })}
        </Header>
      }
    >
      <Tabs
        tabs={[
          {
            label: t('tabs.general', { ns: 'settings' }),
            id: "general",
            content: <GeneralSettings />,
          },
          {
            label: t('tabs.preferences', { ns: 'settings' }),
            id: "preferences",
            content: <UserPreferences />,
          },
          {
            label: t('tabs.lease', { ns: 'settings' }),
            id: "lease",
            content: <LeaseSettings />,
          },
          {
            label: t('tabs.cleanup', { ns: 'settings' }),
            id: "clean",
            content: <CleanupSettings />,
          },
        ]}
      />
    </ContentLayout>
  );
};
