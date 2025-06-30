// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Container,
  KeyValuePairs,
  StatusIndicator,
} from "@cloudscape-design/components";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";
import { useTranslation } from "@amzn/innovation-sandbox-frontend/i18n/hooks/useTranslation";

export const GeneralSettings = () => {
  const { t } = useTranslation();
  const {
    data: config,
    isLoading,
    isError: loadingError,
    refetch,
    error,
  } = useGetConfigurations();

  if (isLoading) {
    return <Loader />;
  }

  if (loadingError || !config) {
    return (
      <ErrorPanel
        description={t('page.error', { ns: 'settings' })}
        retry={refetch}
        error={error as Error}
      />
    );
  }

  return (
    <SettingsContainer>
      <KeyValuePairs
        items={[
          {
            label: t('general.maintenanceMode.label', { ns: 'settings' }),
            value: config.maintenanceMode ? (
              <StatusIndicator type="warning">
                {t('general.maintenanceMode.on', { ns: 'settings' })}
              </StatusIndicator>
            ) : (
              <StatusIndicator type="success">
                {t('general.maintenanceMode.off', { ns: 'settings' })}
              </StatusIndicator>
            ),
          },
          {
            label: t('general.regions.label', { ns: 'settings' }),
            value:
              (config.isbManagedRegions || []).length > 0 ? (
                <ul data-list>
                  {config.isbManagedRegions.map((region) => (
                    <li key={region}>{region}</li>
                  ))}
                </ul>
              ) : (
                <StatusIndicator type="warning">
                  {t('general.regions.notSet', { ns: 'settings' })}
                </StatusIndicator>
              ),
          },
          {
            label: t('general.termsOfService.label', { ns: 'settings' }),
            value: (
              <Container>
                <pre>{config.termsOfService}</pre>
              </Container>
            ),
          },
        ]}
      />
    </SettingsContainer>
  );
};
