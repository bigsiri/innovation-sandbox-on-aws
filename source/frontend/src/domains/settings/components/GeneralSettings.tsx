// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Container,
  KeyValuePairs,
  StatusIndicator,
} from "@cloudscape-design/components";
import { useTranslation } from "react-i18next";

import { ErrorPanel } from "@amzn/innovation-sandbox-frontend/components/ErrorPanel";
import { Loader } from "@amzn/innovation-sandbox-frontend/components/Loader";
import { SettingsContainer } from "@amzn/innovation-sandbox-frontend/domains/settings/components/SettingsContainer";
import { useGetConfigurations } from "@amzn/innovation-sandbox-frontend/domains/settings/hooks";

export const GeneralSettings = () => {
  const { t } = useTranslation(['settings']);
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
        description={t("loadingError")}
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
            label: t("general.maintenanceMode"),
            value: config.maintenanceMode ? (
              <StatusIndicator type="warning">
                {t("general.maintenanceModeOn")}
              </StatusIndicator>
            ) : (
              <StatusIndicator type="success">
                {t("general.maintenanceModeOff")}
              </StatusIndicator>
            ),
          },
          {
            label: t("general.managedRegions"),
            value:
              (config.isbManagedRegions || []).length > 0 ? (
                <ul data-list>
                  {config.isbManagedRegions.map((region) => (
                    <li key={region}>{region}</li>
                  ))}
                </ul>
              ) : (
                <StatusIndicator type="warning">{t("general.notSet")}</StatusIndicator>
              ),
          },
          {
            label: t("general.termsOfService"),
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
